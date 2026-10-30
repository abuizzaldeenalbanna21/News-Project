from sanic import Sanic
from sanic.response import json
from sanic_cors import CORS
import sqlite3
import jwt
from datetime import datetime, timedelta
import os
from functools import wraps
from pathlib import Path
from security import hash_password, needs_password_upgrade, verify_password

app = Sanic("news_app")
CORS(
    app,
    origins=[
        origin.strip()
        for origin in os.environ.get(
            "CORS_ORIGINS", "http://localhost:5173"
        ).split(",")
        if origin.strip()
    ],
)

# Database setup
DB_PATH = os.environ.get(
    "DATABASE_PATH", str(Path(__file__).with_name("news.db"))
)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    # News table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            title_en TEXT,
            content_en TEXT,
            author_id INTEGER NOT NULL,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users(id)
        )
    """
    )

    # Favorites table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            news_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, news_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (news_id) REFERENCES news(id)
        )
    """
    )

    conn.commit()
    conn.close()


def generate_token(user_id, role):
    secret_key = os.environ.get("JWT_SECRET_KEY")
    if not secret_key or len(secret_key) < 32:
        raise RuntimeError("JWT_SECRET_KEY must contain at least 32 characters")
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")


def verify_token(token):
    secret_key = os.environ.get("JWT_SECRET_KEY")
    if not secret_key or len(secret_key) < 32:
        raise RuntimeError("JWT_SECRET_KEY must contain at least 32 characters")
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        return payload
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    @wraps(f)
    async def decorated_function(request, *args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return json({"error": "No token provided"}, status=401)

        payload = verify_token(token)
        if not payload:
            return json({"error": "Invalid token"}, status=401)

        request.ctx.user_id = payload.get("user_id")
        request.ctx.role = payload.get("role")
        return await f(request, *args, **kwargs)

    return decorated_function


# Routes


@app.post("/register")
async def register(request):
    data = request.json
    email = data.get("email")
    password = data.get("password")
    role = "user"

    if not email or not password:
        return json({"error": "Email and password required"}, status=400)

    conn = get_db()
    cursor = conn.cursor()

    try:
        hashed_password = hash_password(password)
        cursor.execute(
            "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
            (email, hashed_password, role),
        )
        conn.commit()
        user_id = cursor.lastrowid

        token = generate_token(user_id, role)
        return json(
            {
                "message": "User registered successfully",
                "token": token,
                "userId": user_id,
                "role": role,
            },
            status=201,
        )
    except sqlite3.IntegrityError:
        return json({"error": "Email already exists"}, status=400)
    finally:
        conn.close()


@app.post("/login")
async def login(request):
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return json({"error": "Email and password required"}, status=400)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(password, user["password"]):
        return json({"error": "Invalid credentials"}, status=401)

    if needs_password_upgrade(user["password"]):
        conn = get_db()
        conn.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            (hash_password(password), user["id"]),
        )
        conn.commit()
        conn.close()

    token = generate_token(user["id"], user["role"])
    return json(
        {
            "message": "Login successful",
            "token": token,
            "userId": user["id"],
            "role": user["role"],
        }
    )


@app.get("/news")
async def get_news(request):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT n.id, n.title, n.content, n.title_en, n.content_en, n.author_id, n.image_url, u.email as author, n.created_at
        FROM news n
        JOIN users u ON n.author_id = u.id
        ORDER BY n.created_at DESC
    """
    )
    news = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return json(news)


@app.post("/news")
@require_auth
async def create_news(request):
    if request.ctx.role != "journalist":
        return json({"error": "Only journalists can publish news"}, status=403)

    data = request.json
    title = data.get("title")
    content = data.get("content")
    title_en = data.get("title_en")
    content_en = data.get("content_en")
    image_url = data.get("image_url")

    if not title or not content:
        return json({"error": "Title and content required"}, status=400)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO news (title, content, title_en, content_en, author_id, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        (title, content, title_en, content_en, request.ctx.user_id, image_url),
    )
    conn.commit()
    news_id = cursor.lastrowid
    conn.close()

    return json({"message": "News published", "news_id": news_id}, status=201)


@app.delete("/news/<news_id:int>")
@require_auth
async def delete_news(request, news_id):
    if request.ctx.role != "admin":
        return json({"error": "Only admins can delete news"}, status=403)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM news WHERE id = ?", (news_id,))
    conn.commit()
    conn.close()

    return json({"message": "News deleted"})


@app.post("/favorites")
@require_auth
async def add_favorite(request):
    data = request.json
    news_id = data.get("news_id")

    if not news_id:
        return json({"error": "news_id required"}, status=400)

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO favorites (user_id, news_id) VALUES (?, ?)",
            (request.ctx.user_id, news_id),
        )
        conn.commit()
        return json({"message": "Added to favorites"}, status=201)
    except sqlite3.IntegrityError:
        return json({"error": "Already in favorites"}, status=400)
    finally:
        conn.close()


@app.get("/favorites")
@require_auth
async def get_favorites(request):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT f.id, f.news_id, n.title, n.content, n.title_en, n.content_en, n.image_url, u.email as author, n.created_at
        FROM favorites f
        JOIN news n ON f.news_id = n.id
        JOIN users u ON n.author_id = u.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    """,
        (request.ctx.user_id,),
    )
    favorites = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return json(favorites)


@app.delete("/favorites/<news_id:int>")
@require_auth
async def remove_favorite(request, news_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM favorites WHERE user_id = ? AND news_id = ?",
        (request.ctx.user_id, news_id),
    )
    conn.commit()
    conn.close()

    return json({"message": "Removed from favorites"})


@app.get("/admin/news")
@require_auth
async def admin_get_news_list(request):
    if request.ctx.role != "admin":
        return json({"error": "Only admins can access this"}, status=403)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT n.id, n.title, n.content, n.title_en, n.content_en, n.author_id, n.image_url, u.email as author, n.created_at
        FROM news n
        JOIN users u ON n.author_id = u.id
        ORDER BY n.created_at DESC
    """
    )
    news = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return json(news)


@app.get("/admin/users")
@require_auth
async def admin_get_users(request):
    if request.ctx.role != "admin":
        return json({"error": "Only admins can access this"}, status=403)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, role, created_at FROM users")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return json(users)


@app.delete("/admin/users/<user_id:int>")
@require_auth
async def admin_delete_user(request, user_id):
    if request.ctx.role != "admin":
        return json({"error": "Only admins can access this"}, status=403)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()

    return json({"message": "User deleted"})


def run_app():
    secret_key = os.environ.get("JWT_SECRET_KEY")
    if not secret_key or len(secret_key) < 32:
        raise RuntimeError(
            "Set JWT_SECRET_KEY to a secret of at least 32 characters before starting"
        )
    init_db()
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "8000")),
        debug=os.environ.get("SANIC_DEBUG", "").lower() == "true",
    )


if __name__ == "__main__":
    run_app()
