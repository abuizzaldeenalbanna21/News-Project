# مشروع أخبار العالم

تطبيق أخبار بواجهة React وVite وخادم Python Sanic، مع تسجيل دخول وأدوار للمستخدم والصحفي والمسؤول، وإمكانية حفظ الأخبار المفضلة.

## المتطلبات

- Python 3.10 أو أحدث
- Node.js 20.19+ أو 22.12+
- npm

## تشغيل الخادم الخلفي

من مجلد المشروع:

```powershell
cd news-backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:JWT_SECRET_KEY = python -c "import secrets; print(secrets.token_hex(32))"
python app.py
```

الخادم يعمل افتراضيًا على `http://localhost:8000`، وينشئ قاعدة بيانات SQLite محلية عند التشغيل. لا ترفع ملف قاعدة البيانات أو تضع بيانات حقيقية فيه.

لإتاحة الواجهة من عنوان آخر، عيّن `CORS_ORIGINS` إلى أصل الواجهة المسموح، مثل `https://news.example.com`. يمكن تعيين `PORT` لتغيير المنفذ. لا تفعّل `SANIC_DEBUG` في بيئة منشورة.

### بيانات تجريبية اختيارية

ينشئ `seed_data.py` مستخدمين وأخبارًا تجريبية. عيّن كلمات مرور خاصة بك قبل تشغيله؛ لا توجد كلمات مرور تجريبية افتراضية:

```powershell
$env:SEED_ADMIN_PASSWORD = "ضع-كلمة-مرور-قوية-هنا"
$env:SEED_JOURNALIST_PASSWORD = "ضع-كلمة-مرور-قوية-هنا"
$env:SEED_USER_PASSWORD = "ضع-كلمة-مرور-قوية-هنا"
python seed_data.py
```

التسجيل العام ينشئ حساب مستخدم عادي فقط. أنشئ حساب المسؤول محليًا عبر أداة البيانات التجريبية بعد تعيين كلمة مرور قوية، أو عبر وسيلة إدارية موثوقة.

## تشغيل الواجهة

في نافذة طرفية أخرى:

```powershell
cd news-frontend
npm ci
npm run dev
```

الواجهة تعمل افتراضيًا على `http://localhost:5173` وتتصل بالخادم على `http://localhost:8000`. لتغيير عنوان API، أنشئ `news-frontend/.env.local` واضبط:

```dotenv
VITE_API_URL=https://api.example.com
```

## الفحوصات والبناء

```powershell
cd news-frontend
npm run lint
npm run build
```

ولفحص صياغة ملفات Python:

```powershell
cd news-backend
python -m py_compile app.py main.py seed_data.py security.py
```

## ملاحظات قبل النشر

- لا ترفع `.env` أو قاعدة بيانات محلية أو بيئات Python وNode.
- اضبط `JWT_SECRET_KEY` كمتغير بيئة قوي وفريد في بيئة الاستضافة.
- عيّن `CORS_ORIGINS` إلى نطاق الواجهة الفعلي، ولا تستخدم وضع التصحيح في الإنتاج.
- قاعدة البيانات SQLite محلية ومناسبة للتطوير؛ اختر قاعدة بيانات مُدارة قبل النشر العام أو الاستخدام متعدد النسخ.
