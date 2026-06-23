export function TitleBar() {
  return (
    <div className="title-bar">
      <span className="title-text">🌸 Nezuko Companion</span>
      <div className="title-controls">
        <button
          className="title-btn"
          onClick={() => window.electronAPI?.minimize()}
          title="Minimize"
        >
          ─
        </button>
        <button
          className="title-btn close"
          onClick={() => window.electronAPI?.close()}
          title="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
