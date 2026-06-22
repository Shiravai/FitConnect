# 🏂 FitConnect — מדריך הרצה (למתחילים, צעד-אחר-צעד)

מדריך להרצת הפרויקט על מחשב חדש (לדוגמה, אצל שותף/ה לצוות).
הפרויקט = **שרת** (Node) שרץ על המחשב + **אפליקציית טלפון** (Expo) שרצה דרך Expo Go.

---

## 0️⃣ להתקין פעם אחת (אם עוד לא מותקן)
1. **Node.js** (גרסת LTS) — מ-https://nodejs.org → להתקין רגיל (Next, Next).
2. **Git** — מ-https://git-scm.com
3. בטלפון: אפליקציית **Expo Go** (חינם ב-Google Play / App Store).

בדיקה שהכל מותקן — פתחו טרמינל (PowerShell) והריצו:
```
node -v
git --version
```
אם מופיעות גרסאות — מצוין.

---

## 1️⃣ להוריד את הקוד מ-GitHub
פתחו טרמינל בתיקייה שבה תרצו את הפרויקט, והריצו:
```
git clone https://github.com/Shiravai/FitConnect.git
cd FitConnect
```

---

## 2️⃣ ליצור את קובץ הסודות (.env)
מטעמי אבטחה הקובץ הזה **לא** נמצא ב-GitHub. צריך ליצור אותו ידנית.

1. בתוך תיקיית `server`, צרו קובץ חדש בשם **`.env`** (בדיוק ככה, עם הנקודה).
2. הדביקו לתוכו את השורות הבאות:
```
MONGO_URI=<בקשו מהשותף/ה את המחרוזת המדויקת מתוך ה-server/.env שלו/ה>
JWT_SECRET=<בקשו מהשותף/ה את אותו ערך>
PORT=5000
CLIENT_URL=http://localhost:5173
```
> 💡 הדרך הכי פשוטה: בקשו מבן/בת הזוג לשלוח לכם את הקובץ `server/.env` שלו/ה (בוואטסאפ/מייל),
> ופשוט שימו אותו בתיקיית `server`. זה אותו מסד נתונים משותף.

---

## 3️⃣ להריץ את השרת (טרמינל מספר 1)
```
cd server
npm install        # פעם ראשונה בלבד (לוקח כמה דקות)
npm start
```
✅ צריכה להופיע השורה: **`[FitConnect] MongoDB connected ✔`** ו-`Server running on http://localhost:5000`
**השאירו את הטרמינל הזה פתוח ורץ.**

> אם Windows שואל על **Firewall** — לחצו **Allow** (כדי שהטלפון יוכל להתחבר).

---

## 4️⃣ להריץ את האפליקציה (טרמינל מספר 2 — חדש!)
פתחו טרמינל **נוסף** (בטרמינל של VS Code: לחצן `+`), והריצו:
```
cd mobile
npm install        # פעם ראשונה בלבד (לוקח כמה דקות)
npx expo start
```
יופיע **קוד QR** בטרמינל.

📱 **סרקו את ה-QR:**
- **אנדרואיד:** דרך אפליקציית **Expo Go** → "Scan QR code".
- **אייפון:** דרך אפליקציית **המצלמה** הרגילה → ללחוץ על ההתראה שקופצת.

האפליקציה תיפתח על הטלפון! 🎉

### 🔑 משתמשים לדוגמה (סיסמה לכולם: `123456`)
`admin` · `maya` · `daniel` · `noa` · `yossi` · `tamar` · `omer` · `lior` · `shira`

---

## 5️⃣ גישה מרחוק (חברים שלא על אותה רשת Wi-Fi)
אם רוצים שמישהו מרחוק יבדוק את האפליקציה, יש סקריפט שמריץ הכל אוטומטית כולל tunnel:
```
.\start.ps1
```
הסקריפט מפעיל את השרת, יוצר tunnel חינמי דרך Cloudflare, ומפעיל את Expo עם tunnel.
בסוף הוא מדפיס קישור שאפשר לשלוח לכל אחד — הם פותחים אותו ב-Expo Go והאפליקציה עולה.

> 💡 צריך להתקין פעם אחת: `npm install -g cloudflared`

---

## ⚠️ חובה לדעת
- **למצב רגיל (LAN):** הטלפון והמחשב חייבים להיות על אותה רשת Wi-Fi.
- **למצב tunnel:** אפשר מכל מקום, אבל המחשב שמריץ חייב להישאר דלוק.
- **שני הטרמינלים צריכים לרוץ במקביל** (שרת + אפליקציה).

---

## 🛠️ פתרון תקלות נפוצות

**"npm.ps1 / npx.ps1 cannot be loaded ... not digitally signed"**
הריצו פעם אחת:
```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
(אם שואל אישור — `Y` ו-Enter). לחלופין, הוסיפו `.cmd`: `npm.cmd start` / `npx.cmd expo start`.

**"MongoDB connection error" / "IP isn't whitelisted"**
היכנסו ל-https://cloud.mongodb.com → Network Access → ADD IP ADDRESS → **Allow Access From Anywhere** (`0.0.0.0/0`) → Confirm. חכו דקה והריצו שוב.
(התיקון של DNS כבר נמצא בקוד, אז `querySrv ECONNREFUSED` לא אמור לחזור.)

**"Could not connect to development server" (בטלפון)**
1. ודאו ששני המכשירים על אותה רשת Wi-Fi.
2. חכו ש-Metro יסיים לבנות (שורה `Bundled` בטרמינל), ואז לחצו **Reload** בטלפון.
3. אם ממשיך — סגרו לגמרי את Expo Go וסרקו שוב, או אשרו ל-Node גישה ב-Firewall.

**"Project is incompatible with this version of Expo Go"**
האפליקציה היא Expo **SDK 54**. ודאו שיש לכם את הגרסה העדכנית של Expo Go מהחנות.

---

## 📂 מבנה הפרויקט
```
FitConnect/
  server/   ← השרת (Node + Express + MongoDB) — לא לשנות בשביל הרצה
  mobile/   ← אפליקציית הטלפון (React Native + Expo)  ← זה מה שרץ בטלפון
  client/   ← גרסת ווב ישנה (לא בשימוש למובייל)
```

בהצלחה! 💪
