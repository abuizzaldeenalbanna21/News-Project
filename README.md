# World News Project

A news application featuring a React and Vite frontend and a Python Sanic backend. It includes user authentication with roles for regular users, journalists, and administrators, as well as the ability to save favorite news articles.

## Requirements

- Python 3.10 or later
- Node.js 20.19+ or 22.12+
- npm

## Running the Backend Server

From the project directory:

```powershell
cd news-backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:JWT_SECRET_KEY = python -c "import secrets; print(secrets.token_hex(32))"
python app.py
```

The server runs by default at `http://localhost:8000` and creates a local SQLite database upon startup. Do not upload the database file or store real data within it.

To allow access from a different origin, set `CORS_ORIGINS` to the permitted frontend origin (e.g., `https://news.example.com`). You can also set `PORT` to change the port number. Do not enable `SANIC_DEBUG` in a production environment.

### Optional Sample Data

The `seed_data.py` script generates sample users and news articles. Please set your own passwords before running it. There are no default seed passwords:

```powershell
$env:SEED_ADMIN_PASSWORD = "set-a-strong-password-here"
$env:SEED_JOURNALIST_PASSWORD = "set-a-strong-password-here"
$env:SEED_USER_PASSWORD = "set-a-strong-password-here"
python seed_data.py
```

Public registration only creates a standard user account. Create the administrator account locally using the seed data tool—after setting a strong password—or via another trusted administrative method.

## Running the Frontend

In a separate terminal window:

```powershell
cd news-frontend
npm ci
npm run dev
```

The frontend runs by default at `http://localhost:5173` and connects to the backend at `http://localhost:8000`. To change the API URL, create a `news-frontend/.env.local` file and set:

```dotenv
VITE_API_URL=https://api.example.com
```

## Linting and Building

```powershell
cd news-frontend
npm run lint
npm run build
```

To check the syntax of the Python files:

```powershell
cd news-backend
python -m py_compile app.py main.py seed_data.py security.py
```
