import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState<string>("checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("unreachable"));
  }, []);

  return (
    <div>
      <h1>Notes App</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

export default App;