# ✦ Swarg AI — Gemini Powered Chat App

Apna khud ka AI Chat App — ChatGPT se better design, Gemini 2.0 Flash powered.

---

## 📁 Project Structure

```
swarg-ai/
├── backend/          ← Node.js + Express server
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/         ← React + Vite app
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   └── utils/
    ├── index.html
    └── package.json
```

---

## 🚀 Local Setup

### Step 1 — Backend
```bash
cd backend
npm install
cp .env.example .env
# .env mein apni GEMINI_API_KEY daalo
npm run dev
```

### Step 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

---

## ☁️ Render pe Deploy karna

### Backend Deploy (Web Service)

1. GitHub pe push karo
2. Render.com → **New → Web Service**
3. Repo select karo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. **Environment Variables** mein yeh daalo:
   ```
   GEMINI_API_KEY = your_key_here
   ```
6. Deploy karo → Backend URL copy karo (e.g. `https://swarg-ai-backend.onrender.com`)

---

### Frontend Deploy (Static Site)

1. Render → **New → Static Site**
2. Repo select karo
3. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **Environment Variables** mein daalo:
   ```
   VITE_API_URL = https://swarg-ai-backend.onrender.com
   ```
   *(apna backend URL yahan daalo)*
5. Deploy!

---

## ✨ Features

- 🤖 Gemini 2.0 Flash — fast & smart
- 💬 Real-time streaming responses
- 💾 Chat history saved locally (localStorage)
- ✏️ Rename & delete chats
- 📝 Markdown + Code highlighting support
- 📋 Copy code button
- 🛑 Stop generation button
- 🌙 Premium dark UI design
- 📱 Responsive design

---

Made with ❤️ by Amar Kumar — Swarg AI v1.0
