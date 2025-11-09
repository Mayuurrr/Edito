<div align="center">

# ✨ <strong>Edito</strong>

### <strong>Real-Time Collaborative Code Editor</strong>

<img src="https://img.shields.io/badge/React-18%2B-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Vite-4%2B-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-18%2B-3C873A?style=for-the-badge&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white"/>
<img src="https://img.shields.io/badge/Piston-Execute%20Code-orange?style=for-the-badge"/>

### ⚡ A beautiful, fast, premium real‑time collaborative coding environment built with Monaco Editor, Socket.IO, Node.js, and React.

</div>

---

## 🚀 Features

### ✅ Real‑Time Collaboration

* Multiple users edit the same code live
* Smooth sync via Socket.IO
* Monaco Editor for VS Code‑level editing

### ✅ Live Typing Indicator

* Shows who is typing in real time

### ✅ Synced Language Selector

* Switching languages updates instantly for all users

### ✅ Synced Input Box

* The bottom input panel is shared across all connected clients

### ✅ Execute Code via Piston API

* Supports JavaScript, Python, Java, and C++
* Custom stdin input
* Output is broadcast to all users

### ✅ Room System

* Create / join rooms
* Copy Room ID button
* Online presence indicator
* User list with **you** tag

### ✅ Premium UI

* Glassmorphism cards
* Animated grid background
* Floating **Run** button
* Fully responsive

---

## 📁 Project Structure

```text
EDITO/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EditorRoom.jsx
│   │   │   └── JoinRoom.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── utils/
│   │   │   └── debounce.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── README.md
│
├── server/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
└── .gitignore
```

---

## 🛠️ Tech Stack

### Frontend

* React + Vite
* Monaco Editor
* Socket.IO Client
* Glassmorphism CSS
* Custom Hooks
* Debounce Utility

### Backend

* Node.js
* Express
* Socket.IO
* Axios
* Piston API

---

## ⚙️ Installation & Setup

> Required: **Node.js 18+** and **npm**

### 1) Clone the repo

```bash
git clone https://github.com/Mayuurrr/Edito.git
cd edito
```

### 2) Backend Setup (Server)

```bash
cd server
npm install
npm start
```

**Runs at:** [http://localhost:5000](http://localhost:5000)

### 3) Frontend Setup (Client)

```bash
cd ../client
npm install
npm run dev
```

**Runs at:** [http://localhost:5173](http://localhost:5173)

---

## 🔌 Socket Events

### Client → Server

| Event            | Description           |
| ---------------- | --------------------- |
| `join`           | Join a room           |
| `codeChange`     | Send code updates     |
| `languageChange` | Sync language         |
| `inputChange`    | Sync input box        |
| `typing`         | Send typing indicator |
| `compileCode`    | Execute code          |
| `leaveRoom`      | Manually leave room   |

### Server → Client

| Event            | Description             |
| ---------------- | ----------------------- |
| `userJoined`     | Updated user list       |
| `codeUpdate`     | Receive synced code     |
| `languageUpdate` | Receive synced language |
| `inputUpdate`    | Receive input           |
| `userTyping`     | Show who is typing      |
| `codeResponse`   | Output from execution   |

---

## 🧪 Piston Execution Example

**Request**

```json
{
  "language": "python",
  "version": "*",
  "files": [{ "content": "print('Hi')" }],
  "stdin": "user input"
}
```

**Response includes**

* `stdout`
* `stderr`
* `exit_code`

---

## 📸 UI Overview

### ✅ Join Page

* Glassy login card
* Gradient **Edito** title
* Create Room / Enter Room
* Consistent spacing

### ✅ Editor Page

* Sidebar with room info
* Live user list
* Monaco editor with sync
* Floating **Run** button
* Input + Output panel

---

## 📍 Roadmap

* Multi‑file editor
* Cursor presence sync
* Built‑in chat
* AI coding assistant
* Cloud saving
* Custom themes

---

## 📄 License

This project is licensed under the **MIT License**.

<div align="center">

⭐ If you like this project, give it a star on GitHub!

</div>
