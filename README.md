# Real Life - דמו מולטיפלייר

## הארכיטקטורה
1. **Render** — שרת בענן שמריץ את `server.js` 24/7
2. **GitHub** — שומר את כל קבצי הפרויקט, Render מתחבר אליו ומוריד אוטומטית
3. **Socket.IO** — מחבר שחקנים בזמן אמת (מיקום, הצטרפות, ניתוק)
4. **Three.js** — מצייר את הגרפיקה התלת-ממדית בדפדפן

## הרצה מקומית (לבדיקה לפני העלאה)
```
npm install
npm start
```
ואז גלוש ל-`http://localhost:3000`

## העלאה לאונליין (חד פעמי)

### שלב 1 - יצירת Repository ב-GitHub
1. github.com → New repository → שם (למשל `real-life-game`) → Create

### שלב 2 - חיבור התיקייה המקומית ל-GitHub (מתוך שורת הפקודה, בתיקיית הפרויקט)
```
git init
git add server.js package.json package-lock.json README.md public
git commit -m "גרסה ראשונה"
git branch -M main
git remote add origin https://github.com/USERNAME/real-life-game.git
git push -u origin main
```
(תחליף USERNAME בשם המשתמש שלך ב-GitHub)

### שלב 3 - חיבור ל-Render
1. render.com → הרשמה (מומלץ עם GitHub) → New → Web Service
2. תבחר את ה-repo
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Create Web Service

תוך כמה דקות תקבל כתובת קבועה כמו `https://real-life-game.onrender.com`.

## עדכון המשחק בעתיד
בכל פעם שיש שינוי בקוד, בתוך תיקיית הפרויקט:
```
git add .
git commit -m "תיאור השינוי"
git push
```
Render יזהה את זה אוטומטית ויעדכן את השרת החי תוך דקה-שתיים.

## מגבלות נוכחיות
- אין עדיין: בתים להשכרה, RL NET, טלפון במשחק, כלכלה, עבודות
- אין התנגשויות עם בניינים במפה
- אין שמירת נתונים בין הפעלות שרת (restart = כולם מתנתקים)
