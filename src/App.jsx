import React, { useEffect, useState } from "react";

const API_BASE =
  "https://9ic4qmke47.execute-api.us-east-2.amazonaws.com/prod";

const App = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false); // only for read errors
  const [text, setText] = useState("");

  // ---- READ DATA ----
  async function fetchTheData() {
    try {
      setIsLoading(true);
      setError(false);

      const res = await fetch(`${API_BASE}/reading?userid=srivant`);
      if (!res.ok) throw new Error("Read failed");

      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error("Read error:", e);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTheData();
  }, []);

  // ---- ADD NEW ITEM ----
  async function addItem() {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Show on screen immediately
    const newItem = {
      id: Date.now().toString(),
      text: trimmed,
    };
    setItems((prev) => [newItem, ...prev]);
    setText("");

    // Try to write to DB (non-blocking for UI)
    try {
      await fetch(
        `${API_BASE}/writing?userid=srivant&text=${encodeURIComponent(
          trimmed
        )}`
      );
    } catch (e) {
      console.error("Write error:", e);
    }
  }

  // ---- DELETE ITEM ----
  async function deleteItem(id) {
    try {
   
      await fetch(
        `${API_BASE}/delete?user=srivant&id=${encodeURIComponent(id)}`
      );

      await fetchTheData();
    } catch (e) {
      console.error("Delete error:", e);
    }
  }

  // ---- UI ----
  if (isLoading) return <div>Loading data from database ...</div>;
  if (error) return <div>Erroneous state ...</div>;

  return (
    <div>
      <h3 style={{ textAlign: "center" }}>Reading the Database</h3>

      {/* Add Item */}
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

      {/* List with Remove buttons */}
      <ul>
        {items.map((x) => (
          <li key={x.id} style={{ marginBottom: "8px" }}>
            {x.text}
            <div>
              <button
                onClick={() => deleteItem(x.id)}
                style={{ marginTop: "4px", padding: "4px 8px" }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;


