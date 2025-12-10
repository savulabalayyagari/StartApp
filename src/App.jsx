import React, { useEffect, useState } from "react";

const API = "https://9ic4qmke47.execute-api.us-east-2.amazonaws.com/prod";

const App = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [text, setText] = useState("");       // add box at top

  // modal state (ONLY in parent)
  const [showModal, setShowModal] = useState(false);
  const [modalId, setModalId] = useState(null);
  const [modalText, setModalText] = useState("");

  // ---------- READ ----------
  async function fetchTheData() {
    try {
      setIsLoading(true);
      setError(false);

      const res = await fetch(`${API}/reading?userid=srivant`);
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

  // ---------- ADD ----------
  async function addItem() {
    const trimmed = text.trim();
    if (!trimmed) return;

    // show on screen immediately
    const newItem = { id: Date.now().toString(), text: trimmed };
    setItems((prev) => [newItem, ...prev]);
    setText("");

    try {
      await fetch(
        `${API}/writing?userid=srivant&text=${encodeURIComponent(trimmed)}`
      );
    } catch (e) {
      console.error("Write error:", e);
    }
  }

  // ---------- DELETE ----------
  async function deleteItem(id) {
    try {
      await fetch(`${API}/delete?user=srivant&id=${encodeURIComponent(id)}`);
      await fetchTheData(); // refresh from DB
    } catch (e) {
      console.error("Delete error:", e);
    }
  }

  // ---------- MODAL OPEN / CLOSE ----------
  function openModal(item) {
    // when text button is clicked, open modal with that item’s info
    setModalId(item.id);
    setModalText(item.text);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setModalId(null);
    setModalText("");
  }

  // ---------- UPDATE ----------
  async function updateItem() {
    if (!modalId) return;

    try {
      // course update Lambda usually uses ?user=...&id=...&text=...
      const url = `${API}/update?user=srivant&id=${encodeURIComponent(
        modalId
      )}&text=${encodeURIComponent(modalText)}`;

      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text();
        console.error("Update failed:", res.status, body);
        return;
      }

      // refresh list from DB, then close modal
      await fetchTheData();
      closeModal();
    } catch (e) {
      console.error("Update error:", e);
    }
  }

  // ---------- RENDER ----------
  if (isLoading) {
    return <div>Loading data from database ...</div>;
  }

  if (error) {
    return <div>Erroneous state ...</div>;
  }

  return (
    <div>
      <h3 style={{ textAlign: "center" }}>Reading the Database</h3>

      {/* Add Item row (same as previous assignments) */}
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

      {/* List: text as a button + Remove button */}
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: "8px" }}>
            <div>
              {/* text button – opens modal */}
              <button
                onClick={() => openModal(item)}
                style={{
                  display: "block",
                  width: "200px",
                  padding: "8px",
                  border: "2px solid black",
                  background: "white",
                  marginBottom: "4px",
                }}
              >
                {item.text}
              </button>

              {/* delete button */}
              <button
                onClick={() => deleteItem(item.id)}
                style={{
                  padding: "6px 10px",
                  border: "2px solid black",
                  background: "white",
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal – stateless, no hooks */}
      {showModal && (
        <EditModal
          text={modalText}
          onTextChange={(value) => setModalText(value)}
          onClose={closeModal}
          onUpdate={updateItem}
        />
      )}
    </div>
  );
};

// ---------- Modal component (NO useState / useEffect) ----------
function EditModal({ text, onTextChange, onClose, onUpdate }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "16px",
          border: "2px solid black",
          minWidth: "260px",
        }}
      >
        <div style={{ marginBottom: "10px" }}>
          <label>
            Text:&nbsp;
            <input
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              style={{ padding: "4px", width: "180px" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button onClick={onClose}>Close Me</button>
          <button onClick={onUpdate}>Update</button>
        </div>
      </div>
    </div>
  );
}

export default App;







