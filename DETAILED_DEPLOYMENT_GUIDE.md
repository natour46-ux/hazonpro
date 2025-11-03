# 🎥 מדריך מלא ומפורט: הורדה והעלאת האתר לאירוח

## 📌 סקירה כללית

האתר שבניתי כולל:
- **Frontend**: React (JavaScript) - הממשק שהמשתמשים רואים
- **Backend**: FastAPI (Python) - השרת שמטפל בבקשות ומסד נתונים
- **Database**: MongoDB - מסד הנתונים
- **Files**: תמונות מוצרים שהועלו

---

## 🎯 חלק 1: הורדת הקבצים מ-Emergent

### שיטה 1: דרך GitHub (מומלץ ביותר! ⭐)

**למה GitHub?**
- שומר את כל ההיסטוריה
- קל לעדכן
- גיבוי אוטומטי
- עובד עם כל שירות אירוח

**צעדים:**

#### 1️⃣ צור חשבון GitHub (אם אין לך)
- גלוש ל-https://github.com
- לחץ "Sign Up"
- מלא פרטים: אימייל, סיסמה, username
- אשר אימייל

#### 2️⃣ שמור את הפרויקט מ-Emergent ל-GitHub
בממשק של Emergent (המקום שאתה נמצא בו עכשיו):

```
1. חפש כפתור "Save to GitHub" (בצד ימין או למעלה)
2. לחץ עליו
3. יתבקש ממך להתחבר ל-GitHub (אם טרם התחברת)
4. תן הרשאות ל-Emergent לגשת ל-GitHub שלך
5. תן שם לפרויקט: "hazon-security" (או כל שם אחר)
6. לחץ "Save"
```

#### 3️⃣ הפרויקט נשמר! עכשיו תוכל לגשת אליו ב:
```
https://github.com/YOUR-USERNAME/hazon-security
```

---

### שיטה 2: הורדה ידנית (אם אין GitHub)

אם אין לך אפשרות להשתמש ב-Git, הורד את הקבצים באופן ידני:

**קבצים חשובים להורדה:**

```
📁 Backend (Python):
/app/backend/
├── server.py          ← הקובץ הראשי של השרת
├── auth.py            ← מערכת אימות
├── email_service.py   ← שליחת מיילים
├── requirements.txt   ← רשימת תוכנות Python
├── .env              ← הגדרות (חשוב!)
└── uploads/          ← תיקיית תמונות (כל התוכן)

📁 Frontend (React):
/app/frontend/
├── src/              ← כל הקוד (כל התיקייה!)
├── public/           ← קבצים סטטיים
├── package.json      ← רשימת תוכנות JavaScript
├── .env             ← הגדרות
└── [כל קבצי הקונפיגורציה]
```

**איך להוריד?**
- בEMERGENT, לחץ על כל קובץ
- העתק את התוכן (Ctrl+A, Ctrl+C)
- שמור בקובץ חדש במחשב שלך

---

## 🖥️ חלק 2: בחירת שירות אירוח

### אופציה 1: Hostinger (מומלץ למתחילים)

**מה צריך:**
- VPS Hosting (לא Shared Hosting רגיל!)
- מחיר: כ-$10-20/חודש
- תומך ב-Python, MongoDB, Node.js

**קישור:** https://www.hostinger.com/vps-hosting

**למה VPS?**
- האתר שלך צריך Python ו-MongoDB
- Shared Hosting לא תומך בזה
- VPS נותן לך שרת מלא

---

### אופציה 2: DigitalOcean (מומלץ למתקדמים)

**מה זה?**
- שירות VPS מקצועי
- מחיר: מתחיל מ-$6/חודש
- גמיש מאוד

**קישור:** https://www.digitalocean.com

---

### אופציה 3: AWS / Google Cloud (למתקדמים מאוד)

**מתי לבחור?**
- אם יש לך ניסיון
- אם אתה מצפה לתנועה גבוהה
- יקר יותר אבל מאוד חזק

---

## 🚀 חלק 3: הגדרת השרת (צעד אחר צעד)

### שלב 1: קנייה והגדרת VPS

**אם בחרת ב-Hostinger VPS:**

1. היכנס לאתר Hostinger
2. בחר "VPS Hosting"
3. בחר תוכנית (המלצה: KVM 2 - $10/חודש)
4. בתהליך ההזמנה:
   - מערכת הפעלה: **Ubuntu 22.04** (חשוב!)
   - Location: בחר קרוב לישראל (אירופה)
5. השלם תשלום
6. תקבל מייל עם:
   - **IP Address** (כתובת השרת)
   - **Root Password** (סיסמת ניהול)

---

### שלב 2: התחברות לשרת

**באמצעות SSH (Windows/Mac/Linux):**

**Windows:**
1. הורד PuTTY: https://www.putty.org
2. פתח PuTTY
3. Host Name: הכנס את ה-IP שקיבלת
4. Port: 22
5. לחץ "Open"
6. Username: root
7. Password: הסיסמה שקיבלת במייל

**Mac/Linux:**
1. פתח Terminal
2. הקלד:
```bash
ssh root@YOUR-SERVER-IP
```
3. הכנס סיסמה

---

### שלב 3: התקנת תוכנות בסיס

**עכשיו אתה בתוך השרת. הקלד פקודה אחר פקודה:**

```bash
# עדכון המערכת (חשוב!)
sudo apt update && sudo apt upgrade -y

# התקנת Python 3.11
sudo apt install python3 python3-pip python3-venv -y

# בדיקה שPython הותקן
python3 --version
# אמור להציג: Python 3.11.x

# התקנת Node.js 18 (לFrontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# בדיקה
node --version
npm --version

# התקנת Yarn
npm install -g yarn

# התקנת MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org -y

# הפעלת MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# בדיקה שMongoDB רץ
sudo systemctl status mongod
# אמור להציג: active (running)

# התקנת Nginx (שרת אינטרנט)
sudo apt install nginx -y

# התקנת Git
sudo apt install git -y
```

**✅ כשסיימת - יש לך שרת מוכן!**

---

### שלב 4: הורדת הקוד שלך לשרת

**אם השתמשת ב-GitHub:**

```bash
# צור תיקיה לפרויקט
cd /home
mkdir hazon
cd hazon

# הורד את הקוד מGitHub
git clone https://github.com/YOUR-USERNAME/hazon-security.git
cd hazon-security

# עכשיו הקוד שלך נמצא בשרת!
```

**אם הורדת ידנית:**
- השתמש ב-FileZilla או WinSCP להעלות קבצים
- FileZilla: https://filezilla-project.org
- פרטי חיבור: IP, Username (root), Password

---

### שלב 5: הגדרת Backend

```bash
cd /home/hazon/hazon-security/backend

# צור סביבה וירטואלית (לבידוד תוכנות)
python3 -m venv venv

# הפעל את הסביבה
source venv/bin/activate

# צריך להופיע (venv) בהתחלת השורה

# התקן את כל התוכנות הנדרשות
pip install -r requirements.txt

# זה לוקח כמה דקות...
```

**ערוך את קובץ .env:**

```bash
nano .env
```

שנה את התוכן ל:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="hazon_security"
CORS_ORIGINS="*"
JWT_SECRET_KEY="your-super-secret-random-key-change-this-123456"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="hazon.pro@gmail.com"
SMTP_PASSWORD="YOUR-GMAIL-APP-PASSWORD"
ADMIN_EMAIL="hazon.pro@gmail.com"
```

**⚠️ חשוב:**
- JWT_SECRET_KEY: שנה לכל דבר אקראי (לחץ על מקלדת...)
- SMTP_PASSWORD: קבל מ-Gmail (הסבר בהמשך)

**שמור את הקובץ:**
- Ctrl+X
- Y (yes)
- Enter

---

### שלב 6: קבלת Gmail App Password (למיילים)

1. היכנס ל-Gmail שלך: hazon.pro@gmail.com
2. לך ל: https://myaccount.google.com/apppasswords
3. אם מבקש אימות - אמת
4. בחר:
   - App: Mail
   - Device: Other (custom name) → "Hazon Website"
5. לחץ "Generate"
6. **העתק את הסיסמה שנוצרה** (16 תווים)
7. הדבק אותה ב-.env בשדה SMTP_PASSWORD

---

### שלב 7: הגדרת Frontend

```bash
cd /home/hazon/hazon-security/frontend

# התקן תוכנות
yarn install

# זה לוקח זמן... המתן בסבלנות
```

**ערוך .env:**

```bash
nano .env
```

שנה:
```env
REACT_APP_BACKEND_URL=https://hazonpro.com
```

**שמור (Ctrl+X, Y, Enter)**

**בנה את האתר לproduction:**

```bash
yarn build
```

זה יוצר תיקייה `build/` עם האתר המוכן

---

### שלב 8: הגדרת Nginx

**צור קובץ קונפיגורציה:**

```bash
sudo nano /etc/nginx/sites-available/hazonpro.com
```

**הדבק:**

```nginx
server {
    listen 80;
    server_name hazonpro.com www.hazonpro.com;

    # Frontend (React)
    location / {
        root /home/hazon/hazon-security/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploaded Files
    location /uploads/ {
        alias /home/hazon/hazon-security/backend/uploads/;
    }

    client_max_body_size 50M;
}
```

**שמור (Ctrl+X, Y, Enter)**

**הפעל:**

```bash
sudo ln -s /etc/nginx/sites-available/hazonpro.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### שלב 9: הפעלת Backend כשירות

**צור קובץ systemd:**

```bash
sudo nano /etc/systemd/system/hazon-backend.service
```

**הדבק:**

```ini
[Unit]
Description=Hazon Security Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/hazon/hazon-security/backend
Environment="PATH=/home/hazon/hazon-security/backend/venv/bin"
ExecStart=/home/hazon/hazon-security/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

**שמור והפעל:**

```bash
sudo systemctl daemon-reload
sudo systemctl start hazon-backend
sudo systemctl enable hazon-backend
sudo systemctl status hazon-backend
```

אמור להציג: **active (running)** ✅

---

### שלב 10: חיבור הדומיין

**ב-Hostinger (אזור הדומיינים):**

1. היכנס ל-Hostinger
2. Domains → hazonpro.com
3. לחץ "DNS / Nameservers"
4. עדכן/הוסף רקורדים:

```
Type: A
Name: @
Points to: [IP של השרת שלך]
TTL: 3600

Type: A
Name: www
Points to: [IP של השרת שלך]
TTL: 3600
```

5. שמור

**⏰ המתן 1-24 שעות** להתפשטות DNS

---

### שלב 11: הוספת HTTPS (SSL)

**התקן Certbot:**

```bash
sudo apt install certbot python3-certbot-nginx -y
```

**קבל תעודת SSL:**

```bash
sudo certbot --nginx -d hazonpro.com -d www.hazonpro.com
```

עקוב אחרי ההוראות:
- הכנס אימייל
- הסכם לתנאים
- בחר: Redirect HTTP to HTTPS

**חידוש אוטומטי:**

```bash
sudo systemctl enable certbot.timer
```

---

## ✅ בדיקות

### בדוק שהכל עובד:

```bash
# 1. בדוק Backend
curl http://localhost:8001/api/
# אמור להציג: {"message":"Hello World"}

# 2. בדוק MongoDB
mongosh
> show dbs
> use hazon_security
> show collections
> exit

# 3. בדוק Nginx
sudo systemctl status nginx

# 4. בדוק Backend Service
sudo systemctl status hazon-backend

# 5. צפה בלוגים
sudo journalctl -u hazon-backend -f
```

### גלוש לאתר:
```
https://hazonpro.com
```

אמור לראות את האתר! 🎉

---

## 🔄 עדכון האתר (אחרי שינויים)

```bash
cd /home/hazon/hazon-security

# משוך שינויים מGitHub
git pull origin main

# עדכן Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart hazon-backend

# עדכן Frontend
cd ../frontend
yarn install
yarn build
```

---

## 🆘 פתרון בעיות

### Backend לא עובד:
```bash
sudo journalctl -u hazon-backend -n 100
```

### אתר לא נטען:
```bash
sudo tail -f /var/log/nginx/error.log
```

### MongoDB לא מתחבר:
```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

### מיילים לא נשלחים:
- בדוק .env
- וודא Gmail App Password נכון
- בדוק לוגים: `sudo journalctl -u hazon-backend -f`

---

## 📞 תמיכה נוספת

אם נתקעת:
1. ✅ בדוק שכל השלבים בוצעו
2. ✅ בדוק לוגים
3. ✅ Google את השגיאה
4. ✅ פנה לתמיכה של שירות האירוח

---

**בהצלחה! האתר שלך יהיה באוויר בקרוב! 🚀**
