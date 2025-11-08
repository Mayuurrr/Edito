import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";

export default function JoinPage() {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const createRoom = () => {
    const id = uuid();
    setRoomId(id);
  };

  const joinRoom = () => {
    if (!roomId.trim() || !userName.trim()) {
      setError("Room ID and Name are required");
      return;
    }

    sessionStorage.setItem("roomId", roomId);
    sessionStorage.setItem("userName", userName);
    sessionStorage.setItem("userId", uuid());

    navigate(`/room/${roomId}`);
  };

  return (
    <div className="landing-root">
      <div className="tech-grid" />

      {/* Particle Layer */}
      <div className="particles">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      {/* Main Card */}
      <div className="join-card enhanced spacing-fix">
        <h1 className="app-title">Edito</h1>
        <h2 className="sub-title">Real-time Collaborative Coding</h2>

        <div className="field-block">
          <label>Room ID</label>
          <input
            type="text"
            placeholder="Enter existing Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <button className="mini-btn neon wide-btn" onClick={createRoom}>
            Create Room
          </button>
        </div>

        <div className="field-block">
          <label>Your Name</label>
          <input
            type="text"
            placeholder="Enter your display name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="join-btn crazy" onClick={joinRoom}>
          Enter Edito
        </button>
      </div>
    </div>
  );
}
