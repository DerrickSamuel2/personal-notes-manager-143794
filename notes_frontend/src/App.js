import React, { useState, useMemo } from "react";
import "./App.css";

/**
 * Minimalistic Notes App main component.
 * Layout: Header, Sidebar (list+search), Main area (editor/view).
 * Supports: create, edit, delete, list, and search notes.
 * Easily extendable for backend/API CRUD integration.
 */
const DEFAULT_COLORS = {
  primary: "#1976d2",
  secondary: "#424242",
  accent: "#ffeb3b",
};

/**
 * Note shape:
 * {
 *   id: string,
 *   title: string,
 *   content: string,
 *   updatedAt: number (timestamp)
 * }
 */

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now();
}

// PUBLIC_INTERFACE
function App() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNew, setIsNew] = useState(false);

  // Filter notes by search term (title or content)
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes;
    const lower = searchTerm.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.content.toLowerCase().includes(lower)
    );
  }, [notes, searchTerm]);

  const selectedNote = notes.find((n) => n.id === selectedId);

  // PUBLIC_INTERFACE
  function handleNewNote() {
    setIsNew(true);
    setSelectedId(null);
  }

  // PUBLIC_INTERFACE
  function handleSelectNote(id) {
    setSelectedId(id);
    setIsNew(false);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    // If deleted note is selected, clear selection
    if (id === selectedId) {
      setSelectedId(null);
    }
  }

  // PUBLIC_INTERFACE
  function handleSaveNote({ title, content }) {
    if (isNew || !selectedId) {
      // Create
      const newNote = {
        id: generateId(),
        title: title.trim() ? title : "Untitled",
        content: content,
        updatedAt: Date.now(),
      };
      setNotes((prev) => [{ ...newNote }, ...prev]);
      setSelectedId(newNote.id);
      setIsNew(false);
    } else {
      // Edit
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedId
            ? { ...n, title: title.trim() ? title : "Untitled", content, updatedAt: Date.now() }
            : n
        )
      );
    }
  }

  // For the quick demo, populate with sample on first mount (optional)
  React.useEffect(() => {
    if (notes.length === 0) {
      setNotes([
        {
          id: generateId(),
          title: "Welcome to Notes!",
          content: "This is your first note. You can create, edit, and search for notes in the sidebar.",
          updatedAt: Date.now(),
        },
      ]);
    }
  }, []); // eslint-disable-line

  return (
    <div
      className="notes-app-root"
      style={{
        "--color-primary": DEFAULT_COLORS.primary,
        "--color-secondary": DEFAULT_COLORS.secondary,
        "--color-accent": DEFAULT_COLORS.accent,
      }}
    >
      <Header />
      <div className="notes-app-main-area">
        <Sidebar
          notes={filteredNotes}
          selectedId={selectedId}
          onSelect={handleSelectNote}
          onDelete={handleDeleteNote}
          onNew={handleNewNote}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <MainEditor
          key={isNew ? "new" : selectedId || "no-note"} // Key helps clear form on new note
          note={isNew ? null : selectedNote}
          onSave={handleSaveNote}
          isNew={isNew}
        />
      </div>
      <footer className="notes-footer">
        <span>Personal Notes App &middot; Minimal UI</span>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="notes-header">
      <h1>
        <span role="img" aria-label="notes" style={{ marginRight: 8 }}>
          📝
        </span>
        Notes
      </h1>
    </header>
  );
}

/**
 * Sidebar component: search bar, list, create note button
 */
function Sidebar({
  notes,
  selectedId,
  onSelect,
  onDelete,
  onNew,
  searchTerm,
  setSearchTerm,
}) {
  return (
    <aside className="notes-sidebar" aria-label="Sidebar">
      <div className="sidebar-top-bar">
        <input
          className="sidebar-search"
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          spellCheck={false}
        />
        <button className="sidebar-new-btn" aria-label="Create note" onClick={onNew}>
          +
        </button>
      </div>
      <ul className="notes-list">
        {notes.length === 0 ? (
          <li className="notes-list-empty">No notes found.</li>
        ) : (
          notes.map((n) => (
            <li
              key={n.id}
              className={`notes-list-item${
                n.id === selectedId ? " selected" : ""
              }`}
              onClick={() => onSelect(n.id)}
              tabIndex={0}
              aria-current={n.id === selectedId}
              title={n.title}
            >
              <div className="notes-list-title">{n.title}</div>
              <div className="notes-list-actions">
                <button
                  className="delete-btn"
                  aria-label="Delete note"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(n.id);
                  }}
                  tabIndex={-1}
                >
                  ✕
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}

/**
 * Main editor/view component for note
 */
function MainEditor({ note, onSave, isNew }) {
  const [title, setTitle] = useState(note ? note.title : "");
  const [content, setContent] = useState(note ? note.content : "");

  React.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ title, content });
  }

  if (!note && !isNew) {
    return (
      <main className="main-editor-empty" aria-label="Main area">
        <span>Select a note or create a new one.</span>
      </main>
    );
  }

  return (
    <main className="main-editor" aria-label="Note editor">
      <form className="main-editor-form" onSubmit={handleSubmit}>
        <input
          className="main-editor-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          minLength={1}
          maxLength={100}
          spellCheck={false}
        />
        <textarea
          className="main-editor-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          rows={10}
          required
        />
        <div className="main-editor-actions">
          <button type="submit" className="main-editor-save-btn">
            {isNew ? "Create" : "Save"}
          </button>
        </div>
      </form>
      {!isNew && note?.updatedAt && (
        <div className="main-editor-updated">
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </div>
      )}
    </main>
  );
}

export default App;
