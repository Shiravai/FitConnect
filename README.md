# FitConnect 🏋️ — רשת חברתית לכושר / Fitness Social Network

פרויקט גמר לקורס "פיתוח צד לקוח בסביבת אנדרואיד 2" (HIT).
אפליקציית ווב full‑stack: **Node.js + Express + MongoDB** בצד השרת, **React** בצד הלקוח,
עם **jQuery + Ajax**, **Socket.io** לצ׳אט, **Canvas + Video**, **CSS3** ו‑**D3.js**.

> מסמך הדרישות (אף שהקורס נקרא "אנדרואיד 2") מגדיר אפליקציית **ווב** — וזה בדיוק מה שנבנה כאן.

---

## 🚀 איך מריצים — מדריך צעד‑אחר‑צעד (למתחילים)

### דרישות מקדימות
- **Node.js** (גרסת LTS) מותקן. בדיקה: בטרמינל הריצו `node -v`.
- חשבון **MongoDB Atlas** חינמי (נסביר בהמשך).

### שלב 1 — להקים מסד נתונים בענן (MongoDB Atlas)
1. היכנסו ל‑https://www.mongodb.com/atlas והירשמו (חינם).
2. צרו **Cluster** חינמי (M0).
3. ב‑**Database Access** צרו משתמש עם שם וסיסמה (שמרו אותם).
4. ב‑**Network Access** לחצו *Add IP Address → Allow access from anywhere* (`0.0.0.0/0`).
5. בקלאסטר לחצו **Connect → Drivers** והעתיקו את ה‑Connection String. הוא נראה כך:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   החליפו את `<username>` ו‑`<password>` בפרטים שלכם, והוסיפו את שם ה‑DB `fitconnect` לפני סימן ה‑`?`:
   ```
   mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/fitconnect?retryWrites=true&w=majority
   ```

### שלב 2 — הגדרת השרת
פתחו טרמינל בתיקיית `server`:
```bash
cd server
npm install
```
צרו קובץ בשם `.env` (העתיקו מ‑`.env.example`) ומלאו:
```
MONGO_URI=mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/fitconnect?retryWrites=true&w=majority
JWT_SECRET=any_long_random_secret_text
PORT=5000
CLIENT_URL=http://localhost:5173
```
מלאו את מסד הנתונים בנתוני דמה:
```bash
npm run seed
```
הריצו את השרת:
```bash
npm start
```
✅ אמור להופיע: `Server running on http://localhost:5000`

### שלב 3 — הרצת הלקוח (React)
פתחו טרמינל **נוסף** בתיקיית `client`:
```bash
cd client
npm install
npm run dev
```
פתחו בדפדפן: **http://localhost:5173**

### 🔑 משתמשים לדוגמה (הסיסמה לכולם: `123456`)
| משתמש | תפקיד |
|-------|-------|
| `admin` | מנהל מערכת |
| `maya` | מנהלת קבוצות |
| `daniel` | מנהל קבוצות |
| `noa`, `yossi`, `tamar`, `omer`, `lior`, `shira` | משתמשים רגילים |

---

## 🧱 ארכיטקטורה — MVC
```
fitconnect/
  server/   ← Model + Controller (Express API)
    models/        מודלים: User, Group, Post, Message
    controllers/   הלוגיקה
    routes/        נקודות הקצה REST
    middleware/    אימות (JWT), הרשאות, העלאות, טיפול בשגיאות
    socket/        צ׳אט בזמן אמת (Socket.io)
    seed/          הזרעת נתוני דמה
  client/   ← View (React)
    src/api/        שכבת תקשורת מבוססת jQuery $.ajax
    src/pages/      מסכים
    src/components/ רכיבים (כולל Canvas ו‑Video)
    src/styles/     CSS3
```

---

## ✅ מיפוי הדרישות (15–29)

| # | דרישה | מימוש |
|---|-------|-------|
| 15 | Node+Express server, React client | `server/`, `client/` |
| 16 | MongoDB | Mongoose + Atlas |
| 17 | MVC | models / controllers / routes ↔ React |
| 18 | ≥3 מודלים | User, Group, Post, Message (4) |
| 19 | Create/Update/Delete/List/Search לכל מודל דרך ה‑UI | עמודי CRUD מלאים |
| 20 | ≥2 חיפושים עם 3+ פרמטרים | חיפוש פוסטים (5 פרמטרים), חיפוש קבוצות (4 פרמטרים) |
| 21 | משתמש/סיסמה + הרשאות | JWT + bcrypt; פעולות ניהול למנהלים בלבד; עריכה/מחיקה לבעלים בלבד; קבוצות פרטיות חסומות |
| 22 | פיד אישי | פוסטים שלי + של חברים + של קבוצות שאני חבר בהן |
| 23 | נתוני דמה | `npm run seed` (9 משתמשים, 6 קבוצות, 40 פוסטים) |
| 24 | ולידציות וטיפול בשגיאות (שרת+לקוח) | express-validator + ולידציה ב‑jQuery + errorHandler מרכזי |
| 25 | jQuery + Ajax נרחב | כל קריאות השרת דרך `$.ajax`, וכן אפקטים (fadeIn/slideUp) וולידציה |
| 26 | React + Video + Canvas | `VideoPlayer.jsx`, `CanvasDraw.jsx` |
| 27 | CSS3 (5 יכולות) | text-shadow, transition, multiple-columns, font-face, border-radius |
| 28 | צ׳אט עם Socket.io | `socket/chat.js` + `ChatWidget.jsx` (חלונית צ׳אט צפה עם התראות הודעות שלא נקראו) |
| 29 | ≥2 גרפים ב‑D3.js מנתונים חיים | עמוד Stats: בר, קו ועוגה |

### היכן כל יכולת CSS3 (סעיף 27)
מוגדר ומתועד בראש `client/src/styles/global.css`:
- **font-face** — גופן Poppins
- **text-shadow** — לוגו וכותרות
- **transition** — כפתורים/כרטיסים בריחוף
- **multiple-columns** — ה‑footer של האתר
- **border-radius** — כרטיסים, כפתורים, אווטארים

---

## 🔐 אבטחה והגשה
- סיסמאות מוצפנות עם **bcrypt** (לא נשמרות כטקסט גלוי).
- קובץ `.env` **לא** מועלה ל‑git (מוגדר ב‑`.gitignore`) — אין מפתחות/סיסמאות בקוד (סעיף 7).
- לפני העלאה ל‑git ודאו שלא קיים `.env` במאגר.

## 🧪 בדיקת קצה‑לקצה (לפני ההגנה)
1. הרשמה והתחברות.
2. יצירה/עריכה/מחיקה של פוסט — כולל פוסט **וידאו** ופוסט **ציור Canvas**.
3. יצירת קבוצה, בקשת הצטרפות ואישור ע״י המנהל.
4. הרצת שני החיפושים המתקדמים.
5. צפייה בפיד האישי.
6. צ׳אט בזמן אמת (פתחו שתי לשוניות עם שני משתמשים).
7. עמוד הסטטיסטיקות — שני גרפים ומעלה.
8. הזנת קלט שגוי — השרת לא קורס ומוצגת הודעת שגיאה ידידותית.

בהצלחה! 💪
