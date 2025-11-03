# 📧 מדריך: איך להפעיל שליחת מיילים אוטומטיים

## 🎯 מה צריך לעשות

כדי שהאתר ישלח מיילים אוטומטיים (אישור הזמנה ללקוח ולך), צריך להגדיר Gmail App Password.

---

## שלב 1: הפעלת אימות דו-שלבי ב-Gmail

**למה זה נדרש?**
Google דורשת אימות דו-שלבי (2FA) כדי ליצור App Passwords.

### צעדים:

1. **היכנס ל-Gmail שלך:**
   - hazon.pro@gmail.com

2. **לך להגדרות Google Account:**
   - לחץ על תמונת הפרופיל (למעלה מימין)
   - בחר "Manage your Google Account"
   - או גלוש ישירות ל: https://myaccount.google.com

3. **הפעל אימות דו-שלבי:**
   - בתפריט צד, לחץ "Security" (אבטחה)
   - גלול למטה ל-"How you sign in to Google"
   - לחץ על "2-Step Verification"
   - לחץ "Get Started"
   - עקוב אחרי ההוראות:
     - הזן מספר טלפון
     - קבל קוד SMS
     - אשר את הקוד
     - לחץ "Turn On"

✅ **עכשיו יש לך אימות דו-שלבי!**

---

## שלב 2: יצירת App Password

**מה זה App Password?**
זו סיסמה מיוחדת שנותנת גישה לאפליקציות חיצוניות לשלוח מיילים בשמך, ללא סיסמת Gmail הרגילה.

### צעדים:

1. **לך לדף App Passwords:**
   - גלוש ל: https://myaccount.google.com/apppasswords
   - או:
     - Google Account → Security
     - גלול ל-"How you sign in to Google"
     - לחץ "App passwords"

2. **צור App Password חדש:**
   - **App name:** הקלד "Hazon Website"
   - לחץ "Create"

3. **העתק את הסיסמה:**
   - תקבל סיסמה בת 16 תווים: `abcd efgh ijkl mnop`
   - **העתק אותה! לא תראה אותה שוב!**
   - דוגמה: `abcdefghijklmnop` (ללא רווחים)

✅ **יש לך App Password!**

---

## שלב 3: הגדרת הסיסמה בשרת

### אם השרת כבר פועל:

1. **התחבר לשרת:**
```bash
ssh root@YOUR-SERVER-IP
```

2. **ערוך את קובץ .env:**
```bash
cd /home/hazon/hazon-security/backend
nano .env
```

3. **עדכן את השדות:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="hazon.pro@gmail.com"
SMTP_PASSWORD="abcdefghijklmnop"  ← הדבק את ה-App Password כאן
ADMIN_EMAIL="hazon.pro@gmail.com"
```

4. **שמור:**
   - Ctrl+X
   - Y
   - Enter

5. **אתחל את השרת:**
```bash
sudo systemctl restart hazon-backend
```

---

### אם עדיין ב-Emergent:

1. **ערוך את `/app/backend/.env`**
2. **הוסף:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="hazon.pro@gmail.com"
SMTP_PASSWORD="YOUR-APP-PASSWORD-HERE"
ADMIN_EMAIL="hazon.pro@gmail.com"
```

3. **שמור את הקובץ**
4. **Restart Backend** (אם יש כפתור כזה)

---

## שלב 4: בדיקה

### בדוק שהמיילים עובדים:

1. **צור הזמנה בדיקה:**
   - היכנס לאתר שלך
   - הוסף מוצר לסל
   - המשך לתשלום
   - מלא טופס עם **אימייל אמיתי שלך**
   - שלח הזמנה

2. **בדוק אימיילים:**
   - **אימייל ללקוח**: הגיע לאימייל שהקלדת?
   - **אימייל לך**: הגיע ל-hazon.pro@gmail.com?

3. **אם לא הגיע מייל - בדוק לוגים:**
```bash
sudo journalctl -u hazon-backend -f
```

חפש שורות:
- "Email sent successfully" ✅
- "Failed to send email" ❌

---

## 🔍 פתרון בעיות

### בעיה: "Failed to send email"

**1. בדוק שה-App Password נכון:**
- 16 תווים
- ללא רווחים
- רק אותיות ומספרים

**2. בדוק שאין רווחים מיותרים:**
```env
SMTP_PASSWORD="abcdefghijklmnop"  ← נכון
SMTP_PASSWORD=" abcdefghijklmnop " ← לא נכון (רווחים)
```

**3. בדוק שאימות דו-שלבי פעיל:**
- https://myaccount.google.com/security
- "2-Step Verification" צריך להיות ON

**4. נסה ליצור App Password חדש:**
- מחק את הישן
- צור חדש
- עדכן ב-.env

---

### בעיה: "SMTP connection refused"

**פתרון:**
- וודא שהשרת יכול לגשת לאינטרנט
- בדוק firewall:
```bash
sudo ufw allow 587/tcp
```

---

### בעיה: מיילים נכנסים לספאם

**פתרון:**
1. הוסף את hazon.pro@gmail.com לאנשי קשר
2. סמן מייל כ-"Not Spam"
3. לאורך זמן Gmail ילמד שזה לא ספאם

---

## 📋 דוגמת .env מלאה

```env
# Database
MONGO_URL="mongodb://localhost:27017"
DB_NAME="hazon_security"
CORS_ORIGINS="*"

# Security
JWT_SECRET_KEY="super-secret-random-key-12345"

# Email (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="hazon.pro@gmail.com"
SMTP_PASSWORD="abcdefghijklmnop"
ADMIN_EMAIL="hazon.pro@gmail.com"
```

---

## ✅ איך נראה המייל?

**ללקוח:**
```
נושא: אישור הזמנה - חזון מערכות אבטחה
תוכן:
- שלום [שם הלקוח]
- תודה שבחרת בחזון מערכות אבטחה
- פרטי ההזמנה
- סיכום מוצרים
- סה"כ לתשלום
- "נציג יצור קשר בהקדם"
```

**אליך (hazon.pro@gmail.com):**
```
נושא: הזמנה חדשה מ-[שם הלקוח] - #12345
תוכן:
- הזמנה חדשה התקבלה!
- פרטי הלקוח (שם, טלפון, כתובת)
- רשימת מוצרים
- אמצעי תשלום
- סה"כ
- "יש ליצור קשר עם הלקוח"
```

---

## 🎉 סיימת!

עכשיו כשמישהו מבצע הזמנה:
1. ✅ הלקוח מקבל מייל אישור
2. ✅ אתה מקבל מייל עם פרטי ההזמנה
3. ✅ ההזמנה נשמרת במסד הנתונים
4. ✅ אתה יכול לראות אותה בממשק הניהול

**זה עובד אוטומטית! 🚀**
