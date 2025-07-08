# 🧠 Collaborative To-Do Board [Live Link](https://to-do-board-beta.vercel.app/)

A real-time, collaborative task management web application built from scratch using custom React components and a Node.js/Express backend. This app allows multiple users to manage tasks in a live-synced Kanban board with advanced conflict resolution and smart assignment logic.

## 🌐 Live Demo

- **Frontend**: [https://to-do-board-beta.vercel.app/](https://to-do-board-beta.vercel.app/)
- **Backend**: [https://to-do-board-qhs5.onrender.com](https://to-do-board-qhs5.onrender.com)
- **Demo Video**: [Watch Demo](https://www.loom.com/share/4d3f3cb47aba4765bc06fc113209c018?sid=378d594c-cb10-40b0-8b93-069c3bf9ff5f)
- **Logic Document**: [Smart Assign & Conflict Handling (PDF)](https://drive.google.com/file/d/1-lufEaICTNmCtSR1bV6R7o_ab44-xV-g/view?usp=sharing)

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Socket.IO Client
- Custom CSS
  
### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO Server
- JSON Web Token (JWT)
- Bcrypt for password hashing

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js and npm
- MongoDB instance (Atlas or local)

### 1. Clone the Repo
```bash
git clone https://github.com/Manideepchopperla/To-Do-Board.git
cd To-Do-Board
```

### 2. Backend Setup

```bash
cd server
npm install
# Create a .env file with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT = 3000
# FRONTEND_URL = http://localhost:5173
npm run dev
```
### 3. Frontend Setup

```bash
cd client
npm install
# Create a .env file with:
# VITE_BACKEND_URL = http://localhost:3000
npm run dev

```

> **Note:**  
> Ensure both backend and frontend are running concurrently.  
> WebSocket server must be reachable from frontend.

---

## 🚀 Features

### 🔒 Authentication
- User registration and login with hashed passwords and JWT.

### 🧩 Kanban Board
- Custom-built three-column board (Todo, In Progress, Done).
- Drag-and-drop task movement.
- Task reassignment and live syncing.

### 📡 Real-Time Sync
- Changes reflected instantly using WebSockets (Socket.IO).

### 📃 Activity Log
- Displays last 20 actions (add/edit/delete/assign/move).
- Live updating panel.

### 📱 Responsive UI
- Works on both desktop and mobile views.

### 🧠 Smart Assign
- One-click assignment to the user with the least active tasks.

### ⚔️ Conflict Handling
- Detects simultaneous edits.
- Prompts users to merge or overwrite changes.

### 🎨 Custom UI & Animation
- No third-party styling.
- Includes smooth drag-drop animations.

---

## 🧠 Smart Assign Logic (Summary)

When the "Smart Assign" button is clicked:
- The system queries all users and counts their **non-completed tasks**.
- It picks the user with the **least number of active tasks**.
- That user is assigned to the selected task automatically.

📄 Full logic breakdown in: [**Logic_Document**](https://drive.google.com/file/d/1-lufEaICTNmCtSR1bV6R7o_ab44-xV-g/view?usp=sharing)


---

## ⚔️ Conflict Handling (Summary)

Each task has a `version` field that updates on every edit.  
When a user submits changes:

- ✅ If versions match → update succeeds.  
- ⚠️ If versions differ → a conflict is detected.

The user is prompted to:
- **Merge** changes  
- **Overwrite** with their version  
- **Keep** the existing version

📄 More details in: [**Logic_Document**](https://drive.google.com/file/d/1-lufEaICTNmCtSR1bV6R7o_ab44-xV-g/view?usp=sharing)


---

## Contact

For any inquiries, please reach out to:

- **Name:** Manideep Chopperla
- **Email:** [manideepchopperla1808@gmail.com](mailto:manideepchopperla1808@gmail.com)
- **GitHub:** [Manideepchopperla](https://github.com/Manideepchopperla)


