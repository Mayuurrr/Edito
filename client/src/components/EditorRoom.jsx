import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useSocket } from "../hooks/useSocket";
import { debounce } from "../utils/debounce";

export default function EditorRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const userName = sessionStorage.getItem("userName");
  const userId = sessionStorage.getItem("userId");

  /* Redirect users who do not have identity or room info */
  useEffect(() => {
    if (!roomId || !userId || !userName) navigate("/", { replace: true });
  }, []);

  const { socketRef, safeEmit } = useSocket();
  const socket = socketRef.current;

  /* ---------- Local State ---------- */
  const [users, setUsers] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [userInput, setUserInput] = useState("");
  const [running, setRunning] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");

  /* ---------- Editor references ---------- */
  const editorRef = useRef(null);
  const lastKnownCode = useRef("// start code here");

  /* Debounced code update sending */
  const sendCodeUpdate = useRef(
    debounce((code) => {
      if (code !== lastKnownCode.current) {
        lastKnownCode.current = code;
        safeEmit("codeChange", { roomId, code });
        safeEmit("typing", { roomId, userId });
      }
    }, 200)
  ).current;

  /* ---------- Socket Setup ---------- */
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      socket.emit("join", { roomId, userName, userId });
    };

    /* Updated user list */
    socket.on("userJoined", (list) => setUsers(list));

    /* Remote code update */
    socket.on("codeUpdate", (newCode) => {
      if (!editorRef.current) return;
      if (newCode === lastKnownCode.current) return;

      const ed = editorRef.current;
      const pos = ed.getPosition();

      ed.executeEdits("", [
        {
          range: ed.getModel().getFullModelRange(),
          text: newCode,
        },
      ]);

      ed.setPosition(pos);
      lastKnownCode.current = newCode;
    });

    /* Remote language update */
    socket.on("languageUpdate", setLanguage);

    /* Typing indicator */
    socket.on("userTyping", (name) => {
      setTyping(`${name.slice(0, 12)} is typing...`);
      setTimeout(() => setTyping(""), 1200);
    });

    /* Output from backend */
    socket.on("codeResponse", (res) => {
      setRunning(false);
      setOutPut(res?.run?.output ?? "");
    });

    /* Input sync from other users */
    socket.on("inputUpdate", (value) => {
      setUserInput(value);
    });

    /* Ensure connection */
    if (!socket.connected) {
      socket.connect();
      socket.once("connect", onConnect);
    } else onConnect();

    /* Cleanup listeners on component unmount */
    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("languageUpdate");
      socket.off("userTyping");
      socket.off("codeResponse");
      socket.off("inputUpdate");
    };
  }, []);

  /* ---------- Editor Mount ---------- */
  const handleEditorMount = (ed) => {
    editorRef.current = ed;
    ed.setValue(lastKnownCode.current);

    ed.onDidChangeModelContent(() => {
      sendCodeUpdate(ed.getValue());
    });
  };

  /* ---------- Copy Room ID ---------- */
  const copyRoom = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopyMsg("Copied!");
    setTimeout(() => setCopyMsg(""), 1500);
  };

  /* ---------- Leave Room ---------- */
  const leaveRoom = () => {
    safeEmit("leaveRoom");
    navigate("/", { replace: true });
  };

  /* ---------- Run Code ---------- */
  const runCode = () => {
    setRunning(true);
    safeEmit("compileCode", {
      code: editorRef.current?.getValue() ?? "",
      roomId,
      language,
      version: "*",
      input: userInput,
    });
  };

  return (
    <div className="editor-root">
      <div className="editor-grid" />

      {/* Sidebar */}
      <aside className="editor-sidebar">
        <h2 className="side-heading">Room Info</h2>

        <div className="side-box">
          <div className="room-id-display">{roomId}</div>
          <button className="side-btn" onClick={copyRoom}>Copy</button>
          {copyMsg && <span className="copy-badge">{copyMsg}</span>}
        </div>

        <h3 className="side-heading">Users</h3>

        <ul className="user-list">
          {users.map((u) => (
            <li key={u.userId} className="user-pill">
              <span className="dot" />
              <span className="name">{u.name}</span>

              {u.userId === userId && (
                <span style={{ color: "#8fb0ff", marginLeft: "6px" }}>
                  (you)
                </span>
              )}
            </li>
          ))}
        </ul>

        <p className="typing-indicator">{typing}</p>

        {/* Language selector */}
        <select
          className="lang-select no-gap"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            safeEmit("languageChange", { roomId, language: e.target.value });
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>

        {/* Leave button */}
        <button className="leave-btn no-gap" onClick={leaveRoom}>
          Leave Room
        </button>
      </aside>

      {/* Editor + Console */}
      <main className="editor-main">
        {/* Monaco editor */}
        <div className="code-editor-box">
          <Editor
            height="100%"
            defaultLanguage={language}
            theme="vs-dark"
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              automaticLayout: true,
              smoothScrolling: true,
              scrollBeyondLastLine: false,
            }}
          />

          {/* Floating run button inside editor */}
          <button
            className="run-btn floating-run"
            onClick={runCode}
            disabled={running}
          >
            {running ? "Running..." : "Run"}
          </button>
        </div>

        {/* Input + Output console */}
        <div className="console-section">
          <textarea
            className="console-input"
            placeholder="Enter input..."
            value={userInput}
            onChange={(e) => {
              const value = e.target.value;
              setUserInput(value);
              safeEmit("inputChange", { roomId, input: value });
            }}
          />

          <textarea
            className="console-output"
            readOnly
            placeholder="Output..."
            value={outPut}
          />
        </div>
      </main>
    </div>
  );
}
