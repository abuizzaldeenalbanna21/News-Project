import sqlite3
import os
from pathlib import Path
from app import init_db
from security import hash_password

DB_PATH = os.environ.get(
    "DATABASE_PATH", str(Path(__file__).with_name("news.db"))
)


def seed_database():
    required_passwords = {
        "SEED_JOURNALIST_PASSWORD": os.environ.get("SEED_JOURNALIST_PASSWORD"),
        "SEED_ADMIN_PASSWORD": os.environ.get("SEED_ADMIN_PASSWORD"),
        "SEED_USER_PASSWORD": os.environ.get("SEED_USER_PASSWORD"),
    }
    missing_passwords = [
        name for name, password in required_passwords.items() if not password
    ]
    if missing_passwords:
        raise RuntimeError(
            "Set the following environment variables before seeding: "
            + ", ".join(missing_passwords)
        )

    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear existing data (optional)
    # cursor.execute("DELETE FROM news")
    # cursor.execute("DELETE FROM users")

    # Insert sample users
    users = [
        (
            "journalist1@news.com",
            hash_password(required_passwords["SEED_JOURNALIST_PASSWORD"]),
            "journalist",
        ),
        (
            "journalist2@news.com",
            hash_password(required_passwords["SEED_JOURNALIST_PASSWORD"]),
            "journalist",
        ),
        (
            "admin@news.com",
            hash_password(required_passwords["SEED_ADMIN_PASSWORD"]),
            "admin",
        ),
        (
            "user@news.com",
            hash_password(required_passwords["SEED_USER_PASSWORD"]),
            "user",
        ),
    ]

    user_ids = {}
    for email, password, role in users:
        try:
            cursor.execute(
                "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
                (email, password, role),
            )
            user_ids[email] = cursor.lastrowid
            print(f"✅ Added user: {email}")
        except sqlite3.IntegrityError:
            # User already exists, fetch their ID
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            user_ids[email] = cursor.fetchone()[0]
            print(f"⚠️  User already exists: {email}")

    conn.commit()

    # Insert sample news
    news_data = [
        {
            "title": "🔴 تطورات عاجلة في أزمة المناخ العالمية",
            "content": "أعلنت الأمم المتحدة عن نتائج جديدة تشير إلى تسارع تغيير المناخ. الخبراء يحذرون من ضرورة اتخاذ إجراءات عاجلة قبل فوات الأوان.",
            "title_en": "🔴 Breaking: Global Climate Crisis Accelerates",
            "content_en": "The United Nations announced new findings indicating accelerating climate change. Experts warn of the urgent need for immediate action before it's too late.",
            "author_id": user_ids.get("journalist1@news.com", 1),
            "image_url": "https://picsum.photos/600/400?random=1",
        },
        {
            "title": "اكتشاف علمي جديد في مجال الطب النانوي",
            "content": "نجح فريق بحثي دولي في تطوير جزيئات نانوية قادرة على محاربة السرطان بكفاءة عالية. هذا الاكتشاف يعتبر نقطة تحول في مجال الطب الحديث.",
            "title_en": "Breakthrough Discovery in Nanomedicine",
            "content_en": "An international research team has successfully developed nanoparticles capable of fighting cancer with high efficiency. This discovery represents a turning point in modern medicine.",
            "author_id": user_ids.get("journalist2@news.com", 2),
            "image_url": "https://picsum.photos/600/400?random=2",
        },
        {
            "title": "🔴 كارثة اقتصادية: انهيار أسواق العملات الرقمية",
            "content": "شهدت الأسواق المالية اليوم انهيار حاد في أسعار العملات الرقمية الرئيسية. الخبراء يحللون أسباب الانهيار والتوقعات المستقبلية.",
            "title_en": "🔴 Economic Crisis: Cryptocurrency Market Collapse",
            "content_en": "Financial markets experienced a sharp decline in major cryptocurrency prices today. Experts analyze the causes of the crash and future prospects.",
            "author_id": user_ids.get("journalist1@news.com", 1),
            "image_url": "https://picsum.photos/600/400?random=3",
        },
        {
            "title": "إطلاق مشروع عمراني ضخم في العاصمة",
            "content": "أعلنت الحكومة عن مشروع عمراني استثماري جديد بقيمة مليارات الدولارات سيوفر آلاف فرص العمل. المشروع يستهدف تطوير البنية التحتية.",
            "title_en": "Major Urban Development Project Launched in Capital",
            "content_en": "The government announced a new investment project worth billions of dollars that will create thousands of jobs. The project aims to develop infrastructure.",
            "author_id": user_ids.get("journalist2@news.com", 2),
            "image_url": "https://picsum.photos/600/400?random=4",
        },
        {
            "title": "🔴 حادثة طرق مروعة تودي بحياة عشرات الأشخاص",
            "content": "وقعت حادثة طرق مؤسفة على الطريق السريع تسببت في إصابة عشرات الأشخاص. الفريق الطبي يعمل على إنقاذ المصابين.",
            "title_en": "🔴 Tragic Road Accident Claims Dozens of Lives",
            "content_en": "A tragic road accident occurred on the highway injuring dozens of people. The medical team is working to rescue the injured.",
            "author_id": user_ids.get("journalist1@news.com", 1),
            "image_url": "https://picsum.photos/600/400?random=5",
        },
        {
            "title": "انتصار تاريخي: فريقنا يحقق بطولة كرة القدم العالمية",
            "content": "حققت كرة قدم الفريق الوطني انتصاراً تاريخياً بفوزهم بدورة كأس العالم. ملايين المشجعين احتفلوا بهذا الإنجاز.",
            "title_en": "Historic Victory: National Team Wins World Cup",
            "content_en": "The national football team achieved a historic victory by winning the World Cup. Millions of fans celebrated this achievement.",
            "author_id": user_ids.get("journalist2@news.com", 2),
            "image_url": "https://picsum.photos/600/400?random=6",
        },
        {
            "title": "🔴 عاصفة قوية تضرب المدن الساحلية",
            "content": "أحذرت الأرصاد الجوية من عاصفة قوية جداً تضرب السواحل. السكان مطالبون بالبقاء في منازلهم واتخاذ إجراءات السلامة اللازمة.",
            "title_en": "🔴 Powerful Storm Hits Coastal Cities",
            "content_en": "Weather forecasters warned of a very strong storm hitting the coasts. Residents are urged to stay home and take necessary safety measures.",
            "author_id": user_ids.get("journalist1@news.com", 1),
            "image_url": "https://picsum.photos/600/400?random=7",
        },
        {
            "title": "تحسن ملحوظ في مؤشرات الصحة العامة",
            "content": "أظهرت الإحصائيات الطبية تحسناً ملحوظاً في مؤشرات صحة السكان خلال السنوات الثلاث الماضية.",
            "title_en": "Notable Improvement in Public Health Indicators",
            "content_en": "Medical statistics show a significant improvement in population health indicators over the past three years.",
            "author_id": user_ids.get("journalist2@news.com", 2),
            "image_url": "https://picsum.photos/600/400?random=8",
        },
    ]

    for news in news_data:
        try:
            cursor.execute(
                "INSERT INTO news (title, content, title_en, content_en, author_id, image_url) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    news["title"],
                    news["content"],
                    news.get("title_en"),
                    news.get("content_en"),
                    news["author_id"],
                    news["image_url"],
                ),
            )
            print(f"✅ Added news: {news['title'][:50]}...")
        except sqlite3.IntegrityError as e:
            print(f"⚠️  Could not add news: {e}")

    conn.commit()
    conn.close()
    print("\n✅ Database seeding completed!")


if __name__ == "__main__":
    seed_database()
