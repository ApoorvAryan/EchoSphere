# 🎵 EchoSphere — Music Streaming Platform

A full-stack music streaming web app built with React, Node.js, MongoDB, and Cloudinary.

---

## 📁 Project Structure

```
EchoSphere/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
├── package.json     # Root scripts
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Step 1 — Clone / Extract the project
```bash
cd EchoSphere
```

### Step 2 — Install all dependencies
```bash
# Install root deps
npm install

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### Step 3 — Setup environment variables

**Server (`server/.env`):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/echosphere
JWT_SECRET=echosphere_super_secret_change_this_2024
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client (`client/.env`):**
```
VITE_API_URL=http://localhost:5000/api
```

### Step 4 — Start the app
Open **two terminals**:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🍃 MongoDB Setup (Local)

You already have MongoDB installed. Just make sure the service is running:

**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

The database `echosphere` will be created automatically on first run.

---

## ☁️ Cloudinary Setup

1. Log in at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard** → copy your:
   - Cloud Name
   - API Key
   - API Secret
3. Paste into `server/.env`

That's it — audio and image uploads will go to Cloudinary automatically.

---

## 👑 Create Admin User

After registering normally, open MongoDB Compass or shell and run:

```js
// In MongoDB shell or Compass:
use echosphere
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

Now log in and you'll see the Admin dashboard.

---

## 🚀 Deployment

### Backend → Render

1. Push your project to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add all environment variables from `server/.env`
   - Change `MONGODB_URI` to your **MongoDB Atlas** URI (see below)
   - Change `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Connect your GitHub repo
3. Set:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`

### MongoDB Atlas (for deployment)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. **Database Access** → Add user with password
3. **Network Access** → Allow `0.0.0.0/0` (all IPs)
4. **Connect** → Copy the connection string
5. Paste into Render's `MONGODB_URI` env var (replace `<password>`)

---

## 🔑 Features

| Feature | Status |
|---------|--------|
| Register / Login / Logout | ✅ |
| JWT Authentication | ✅ |
| Upload Songs (Cloudinary) | ✅ |
| Upload Cover Art | ✅ |
| Music Player (Play/Pause/Next/Prev) | ✅ |
| Volume Control + Seekbar | ✅ |
| Shuffle + Repeat | ✅ |
| Search Songs | ✅ |
| Favorites / Likes | ✅ |
| Playlists (Create/Delete) | ✅ |
| Recently Played | ✅ |
| Admin Dashboard | ✅ |
| Responsive Design | ✅ |
| Dark Glassmorphism UI | ✅ |

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Router, Axios, React Icons

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer, Cloudinary

---

## 📞 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get profile |
| GET | `/api/songs` | Get all songs |
| GET | `/api/songs/search?q=` | Search songs |
| GET | `/api/songs/trending` | Trending songs |
| POST | `/api/songs` | Upload song |
| DELETE | `/api/songs/:id` | Delete song |
| GET | `/api/playlists` | Get user playlists |
| POST | `/api/playlists` | Create playlist |
| POST | `/api/favorites/:songId` | Toggle favorite |
| GET | `/api/favorites` | Get favorites |
| GET | `/api/admin/stats` | Admin stats |
| GET | `/api/admin/users` | All users |

---

Built with ❤️ — EchoSphere
