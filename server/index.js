import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import axios from "axios";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

/*
 --------------------------------------------------------------------
  ROOM STRUCTURE

  rooms = Map(
    roomId -> {
      users: Map(
        userId -> {
          userId: string,
          name: string,
          socketId: string
        }
      ),
      code: string,
      language: string
    }
  )
 --------------------------------------------------------------------
*/

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // These track which room and which user this socket belongs to
  let currentRoom = null;
  let currentUserId = null;

  /*
    ------------------------------------------------------------------
    USER JOINS A ROOM
    ------------------------------------------------------------------
    - Frontend sends: roomId, userName, userId
    - userId comes from sessionStorage to keep identity stable
    - If room doesn't exist, it is created
    - User is added to the room user map
    - The joining user receives the latest code and language
    - Everyone in the room receives the updated user list
  */
  socket.on("join", ({ roomId, userName, userId }) => {
    currentRoom = roomId;
    currentUserId = userId;

    socket.join(roomId);

    // Create room if it does not exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Map(),
        code: "// start code here",
        language: "javascript",
      });
    }

    const room = rooms.get(roomId);

    // Store user in room using same userId supplied by frontend
    room.users.set(userId, {
      userId,
      name: userName,
      socketId: socket.id,
    });

    // Send the current room state to the joining user
    socket.emit("codeUpdate", room.code);
    socket.emit("languageUpdate", room.language);

    // Notify all users about the updated participant list
    io.to(roomId).emit("userJoined", Array.from(room.users.values()));

    console.log(`User joined room ${roomId}. Total users:`, room.users.size);
  });

  /*
    ------------------------------------------------------------------
    CODE UPDATE HANDLER
    ------------------------------------------------------------------
    - Updates stored code for the room
    - Broadcasts updated code to all other users
  */
  socket.on("codeChange", ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.code = code;
    socket.to(roomId).emit("codeUpdate", code);
  });

  /*
    ------------------------------------------------------------------
    LANGUAGE UPDATE HANDLER
    ------------------------------------------------------------------
    - Stores selected language
    - Broadcasts language changes to everyone else
  */
  socket.on("languageChange", ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.language = language;
    socket.to(roomId).emit("languageUpdate", language);
  });

  /*
    ------------------------------------------------------------------
    INPUT BOX SYNC (Optional)
    ------------------------------------------------------------------
    - If you want the console input box to sync between users,
      uncomment the lines below.

    socket.on("inputChange", ({ roomId, input }) => {
      socket.to(roomId).emit("inputUpdate", input);
    });
  */
 // Sync input box across all users

  socket.on("inputChange", ({ roomId, input }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    socket.to(roomId).emit("inputUpdate", input);
  });

  /*
    ------------------------------------------------------------------
    TYPING INDICATOR
    ------------------------------------------------------------------
    - When a user types inside the editor, others see "User is typing..."
  */
  socket.on("typing", ({ roomId, userId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const user = room.users.get(userId);
    if (!user) return;

    socket.to(roomId).emit("userTyping", user.name);
  });

  /*
    ------------------------------------------------------------------
    MANUAL ROOM EXIT
    ------------------------------------------------------------------
    - Triggered when user presses "Leave Room"
    - Removes user from room
    - Broadcasts updated user list
    - Deletes room if empty
  */
  socket.on("leaveRoom", () => {
    if (!currentRoom || !currentUserId) return;

    const room = rooms.get(currentRoom);
    if (room) {
      room.users.delete(currentUserId);

      io.to(currentRoom).emit("userJoined", Array.from(room.users.values()));

      if (room.users.size === 0) {
        rooms.delete(currentRoom);
      }
    }

    socket.leave(currentRoom);
    currentRoom = null;
    currentUserId = null;

    console.log("User left room.");
  });

  /*
    ------------------------------------------------------------------
    CODE COMPILATION (Piston API)
    ------------------------------------------------------------------
    - Executes code using Piston Engine API
    - Emits output back to all users in room
  */
  socket.on("compileCode", async ({ code, roomId, language, version, input }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language,
      version,
      files: [{ content: code }],
      stdin: input,
    });

    io.to(roomId).emit("codeResponse", response.data);
  });

  /*
    ------------------------------------------------------------------
    SOCKET DISCONNECT HANDLER
    ------------------------------------------------------------------
    - Runs when user's browser closes or network drops
    - Removes user from room
    - Broadcasts updated user list
    - Deletes room if empty
  */
  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);

    if (currentRoom && currentUserId) {
      const room = rooms.get(currentRoom);

      if (room) {
        room.users.delete(currentUserId);

        io.to(currentRoom).emit("userJoined", Array.from(room.users.values()));

        if (room.users.size === 0) {
          rooms.delete(currentRoom);
        }
      }
    }
  });
});

/*
 --------------------------------------------------------------------
  EXPRESS STATIC SERVE
 --------------------------------------------------------------------
*/
const port = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(port, () => {
  console.log("Server running on port", port);
});
