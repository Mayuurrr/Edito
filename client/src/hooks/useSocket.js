// src/hooks/useSocket.js
import { useEffect, useRef } from "react";
import io from "socket.io-client";

export function useSocket() {
  const socketRef = useRef(null);

  // Event buffer — stores events emitted before the socket is fully ready
  const emitBuffer = useRef([]);

  // Create socket instance once
  if (!socketRef.current) {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
      reconnectionDelayMax: 4000,
      timeout: 12000,
      pingInterval: 18000, // heartbeat interval
      pingTimeout: 15000,
    });
  }

  const socket = socketRef.current;

  // Enhanced safeEmit with buffering logic
  const safeEmit = (event, payload) => {
    if (!socket) return;

    if (socket.connected) {
      socket.emit(event, payload);
    } else {
      // Buffer events until socket is connected
      emitBuffer.current.push({ event, payload });
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Connect immediately on first mount
    if (!socket.connected) {
      socket.connect();
    }

    // When connected, flush buffered events
    const flushBufferedEvents = () => {
      emitBuffer.current.forEach(({ event, payload }) => {
        socket.emit(event, payload);
      });
      emitBuffer.current = [];
    };

    socket.on("connect", flushBufferedEvents);

    // Log connection state (very useful for debugging)
    socket.on("connect", () => {
      console.log("[socket] connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log(`[socket] reconnect attempt ${attempt}`);
    });

    socket.on("reconnect_failed", () => {
      console.warn("[socket] reconnect failed");
    });

    socket.on("error", (err) => {
      console.error("[socket] error:", err);
    });

    return () => {
      // Cleanup listeners (do NOT disconnect on navigation)
      socket.off("connect", flushBufferedEvents);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnect_attempt");
      socket.off("reconnect_failed");
      socket.off("error");
    };
  }, []);

  return { socketRef, safeEmit };
}
