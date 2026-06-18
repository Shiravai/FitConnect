# FitConnect Mobile 📱 — React Native + Expo

אפליקציית הטלפון של FitConnect, בנויה ב-**React Native + Expo**, ומדברת עם **אותו שרת**
(Node + Express + MongoDB + Socket.io) שנמצא בתיקיית `../server`.

---

## 🚀 איך מריצים על הטלפון (Expo Go)

### דרישות מקדימות
1. **Node.js** מותקן על המחשב.
2. אפליקציית **Expo Go** מותקנת על הטלפון (חינם ב-Google Play / App Store).
3. הטלפון והמחשב מחוברים **לאותה רשת Wi-Fi**.

### שלב 1 — הריצו את השרת (טרמינל 1)
```bash
cd ../server
npm install     # פעם ראשונה בלבד
npm run seed    # ממלא נתוני דמה (פעם ראשונה)
npm start
```
השאירו אותו רץ. (אם Windows שואל על Firewall — אשרו גישה ל-Node, כדי שהטלפון יוכל להתחבר.)

### שלב 2 — הריצו את האפליקציה (טרמינל 2)
```bash
cd mobile
npm install     # פעם ראשונה בלבד
npx expo start
```
יופיע **קוד QR** בטרמינל. **סרקו אותו עם אפליקציית Expo Go** (אנדרואיד: דרך Expo Go עצמה;
אייפון: דרך המצלמה). האפליקציה תיפתח על הטלפון! 🎉

### 🔑 התחברות לדוגמה (הסיסמה לכולם: `123456`)
`admin` · `maya` · `daniel` · `noa` · `yossi` · `tamar` · `omer` · `lior` · `shira`

---

## 🌐 איך הטלפון מוצא את השרת?
הטלפון לא יכול לגשת ל-`localhost` של המחשב. לכן האפליקציה **מזהה אוטומטית את כתובת ה-IP של
המחשב** מתוך שרת הפיתוח של Expo ופונה אליו ב-`http://<IP-של-המחשב>:5000`
(ראו [src/api/client.js](src/api/client.js)). אין צורך להגדיר כתובת ידנית — רק לוודא שהשניים
על אותה רשת Wi-Fi.

> אם החיבור לא עובד: כבו זמנית את חומת האש של Windows ל-Node, או ודאו שאתם על אותה רשת.

---

## 🧱 מבנה
```
mobile/
  App.js                    נקודת כניסה (providers + ניווט)
  src/
    api/        client.js (fetch + זיהוי IP + טוקן), endpoints.js, socket.js
    context/    AuthContext, ChatContext
    navigation/ RootNavigator (Auth stack / Tabs / Detail stack)
    components/ ui, Avatar, PostCard, Chart (svg+d3)
    screens/    Login, Register, Feed, CreatePost, Groups, GroupDetail,
                Profile, ChatList, ChatRoom, Stats, Admin
```

## 📋 מיפוי טכנולוגיות (ווב → React Native)
| נושא | בגרסת הווב | באפליקציה |
|------|-----------|-----------|
| רכיבי UI | HTML/CSS | רכיבי React Native (`View`, `Text`, `Image`) + `StyleSheet` |
| וידאו | `<video>` | **expo-av** |
| העלאת תמונות | input file | **expo-image-picker** |
| גרפים | D3 + DOM | **react-native-svg + d3-scale/d3-shape** |
| צ'אט בזמן אמת | Socket.io | **socket.io-client** (זהה) |
| ניווט | React Router | **React Navigation** |
| שרת | — | **אותו שרת Node/Express/MongoDB ללא שינוי** |

> ⚠️ הערה: jQuery, CSS3 ו-Canvas של הדפדפן (דרישות 25/27 בגרסת הווב) **לא קיימים** ב-React Native.
> ודאו מול המרצה אילו דרישות חלות על גרסת ה-React Native.
