import { BrowserRouter, Routes, Route } from "react-router-dom";
import JoinRoom from "./components/JoinRoom";
import EditorRoom from "./components/EditorRoom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<EditorRoom />} />
      </Routes>
    </BrowserRouter>
  );
}
