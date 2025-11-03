# 📦 מדריך מלא להורדה והעלאת האתר לשרת אירוח

## 🎯 סקירה כללית

האתר שבנינו כולל:
- **Frontend**: React (JavaScript)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Files Storage**: תיקיית uploads לתמונות

---

## 📥 שלב 1: הורדת הקבצים

### דרך א': שימוש ב-Git (המומלץ ביותר!)

1. **שמור את הפרויקט ל-GitHub:**
   - בממשק Emergent, לחץ על **"Save to GitHub"**
   - אם אין לך חשבון GitHub, צור אחד ב-https://github.com

2. **הורד את הקוד לשרת שלך:**
```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

### דרך ב': הורדה ידנית של קבצים

אם אתה צריך להוריד קבצים ספציפיים, הנה הרשימה המלאה:

**📁 קבצי Backend (Python):**
```
/app/backend/
├── server.py          # הקוד הראשי של השרת
├── auth.py            # מערכת אימות (JWT)
├── requirements.txt   # רשימת תלויות Python
├── .env              # משתני סביבה (חשוב!)
└── uploads/          # תיקיית תמונות
```

**📁 קבצי Frontend (React):**
```
/app/frontend/
├── src/              # כל קבצי הקוד
│   ├── App.js
│   ├── pages/        # כל הדפים
│   ├── components/   # רכיבי UI
│   └── context/      # CartContext
├── public/           # קבצים סטטיים
├── package.json      # תלויות Node.js
├── tailwind.config.js
├── postcss.config.js
├── craco.config.js
└── .env             # משתני סביבה
```

---

## 🖥️ שלב 2: הכנת השרת (VPS/Dedicated)

### דרישות מינימום:
- **OS**: Ubuntu 20.04+ / Debian 11+
- **RAM**: 2GB לפחות
- **Storage**: 20GB לפחות
- **CPU**: 1 core לפחות

### התקנת תוכנות בסיס:

```bash
# עדכון מערכת
sudo apt update && sudo apt upgrade -y

# התקנת Python 3.9+
sudo apt install python3 python3-pip python3-venv -y

# התקנת Node.js 18+ ו-Yarn
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
npm install -g yarn

# התקנת MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org -y
sudo systemctl start mongod
sudo systemctl enable mongod

# התקנת Nginx (לשרת את האתר)
sudo apt install nginx -y
```

---

## 🔧 שלב 3: הגדרת הפרויקט

### 3.1 Backend Setup

```bash
cd /home/YOUR-USER/hazon-security
cd backend

# צור סביבה וירטואלית
python3 -m venv venv
source venv/bin/activate

# התקן תלויות
pip install -r requirements.txt

# הגדר משתני סביבה
nano .env
```

**תוכן קובץ .env:**
```env
MONGO_URL=mongodb://localhost:27017/hazon_security
JWT_SECRET_KEY=YOUR-SUPER-SECRET-KEY-CHANGE-THIS
```

### 3.2 Frontend Setup

```bash
cd ../frontend

# התקן תלויות
yarn install

# הגדר משתני סביבה
nano .env
```

**תוכן קובץ .env:**
```env
REACT_APP_BACKEND_URL=https://hazonpro.com
```

```bash
# בנה את הפרויקט לproduction
yarn build
```

---

## 🚀 שלב 4: הפעלת השרתים

### 4.1 הפעלת Backend עם systemd (רצה תמיד ברקע)

צור קובץ service:
```bash
sudo nano /etc/systemd/system/hazon-backend.service
```

**תוכן הקובץ:**
```ini
[Unit]
Description=Hazon Security Backend
After=network.target

[Service]
Type=simple
User=YOUR-USER
WorkingDirectory=/home/YOUR-USER/hazon-security/backend
Environment="PATH=/home/YOUR-USER/hazon-security/backend/venv/bin"
ExecStart=/home/YOUR-USER/hazon-security/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

הפעל את השירות:
```bash
sudo systemctl daemon-reload
sudo systemctl start hazon-backend
sudo systemctl enable hazon-backend
sudo systemctl status hazon-backend
```

### 4.2 הגדרת Nginx

```bash
sudo nano /etc/nginx/sites-available/hazonpro.com
```

**תוכן הקובץ:**
```nginx
server {
    listen 80;
    server_name hazonpro.com www.hazonpro.com;

    # Frontend (React build)
    location / {
        root /home/YOUR-USER/hazon-security/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded files
    location /uploads/ {
        alias /home/YOUR-USER/hazon-security/backend/uploads/;
    }
}
```

הפעל את האתר:
```bash
sudo ln -s /etc/nginx/sites-available/hazonpro.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 שלב 5: הוספת HTTPS (SSL)

```bash
# התקן Certbot
sudo apt install certbot python3-certbot-nginx -y

# קבל תעודת SSL
sudo certbot --nginx -d hazonpro.com -d www.hazonpro.com

# חידוש אוטומטי
sudo systemctl enable certbot.timer
```

---

## 🌐 שלב 6: חיבור הדומיין

### ב-Hostinger DNS Management:

1. היכנס ל-Hostinger → Domains → hazonpro.com → DNS
2. הוסף/ערוך רקורדים:

```
Type: A
Name: @
Value: [IP של השרת שלך]
TTL: 3600

Type: A
Name: www
Value: [IP של השרת שלך]
TTL: 3600
```

3. המתן 1-24 שעות להתפשטות DNS

---

## ✅ בדיקות

### בדוק שהכל עובד:

```bash
# בדוק Backend
curl http://localhost:8001/api/

# בדוק MongoDB
mongo
> show dbs
> use hazon_security
> show collections

# בדוק Nginx
sudo systemctl status nginx

# בדוק לוגים
sudo journalctl -u hazon-backend -f
```

### גלוש לאתר:
- http://hazonpro.com (אחרי SSL: https://hazonpro.com)

---

## 📊 ניהול שוטף

### עדכון הקוד:
```bash
cd /home/YOUR-USER/hazon-security
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

### צפייה בלוגים:
```bash
# Backend logs
sudo journalctl -u hazon-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup MongoDB:
```bash
mongodump --db hazon_security --out /backup/mongodb/$(date +%Y%m%d)
```

---

## 🆘 פתרון בעיות נפוצות

### Backend לא עובד:
```bash
sudo systemctl status hazon-backend
sudo journalctl -u hazon-backend -n 50
```

### Frontend לא טוען:
```bash
# בדוק הרשאות
ls -la /home/YOUR-USER/hazon-security/frontend/build
sudo chown -R www-data:www-data /home/YOUR-USER/hazon-security/frontend/build
```

### MongoDB לא מתחבר:
```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

---

## 📞 תמיכה

אם יש בעיות, בדוק:
1. ✅ כל השירותים פועלים (systemctl status)
2. ✅ הפיירוול מאפשר פורט 80 ו-443
3. ✅ DNS מצביע נכון
4. ✅ קבצי .env מוגדרים נכון

---

**האתר מוכן! 🚀 בהצלחה!**
