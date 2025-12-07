import React, { useEffect, useState } from "react";

const App = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);  // only for READ error
  const [text, setText] = useState("");

  // ---- READ DATA ONCE ----
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(false);

        const res = await fetch(
          "https://9ic4qmke47.execute-api.us-east-2.amazonaws.com/prod/reading?userid=srivant"
        );

        if (!res.ok) throw new Error("Read failed");
        const data = await res.json();

        setItems(data);
      } catch (e) {
        console.error("Read error:", e);
        setError(true); // this is the "Erroneous state ..." case
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  async function addItem() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newItem = {
      id: Date.now().toString(),
      text: trimmed,
    };
    setItems((prev) => [newItem, ...prev]);
    setText("");

    try {
      const res = await fetch(
        `https://9ic4qmke47.execute-api.us-east-2.amazonaws.com/prod/writing?userid=srivant&text=${encodeURIComponent(
          trimmed
        )}`
      );
      if (!res.ok) throw new Error("Write failed");
     
    } catch (e) {
      console.error("Write error:", e);
      
    }
  }

  // ---- UI ----
  if (isLoading) {
    return <div>Loading data from database ...</div>;
  }

  if (error) {
    return <div>Erroneous state ...</div>;
  }

  return (
    <div>
      <h3 style={{ textAlign: "center" }}>Reading the Database</h3>

      {/* Text box + Add button */}
      <div style={{ textAlign: "center", margin: "20px" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: "8px", width: "200px" }}
        />
        <button onClick={addItem} style={{ marginLeft: "10px", padding: "8px" }}>
          Add Item
        </button>
      </div>

      {/* List of items */}
      <ul>
        {items.map((x) => (
          <li key={x.id}>{x.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;

