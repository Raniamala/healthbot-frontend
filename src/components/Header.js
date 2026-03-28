import React from "react";

function Header({ darkMode, onToggleDarkMode }) {
  return (
    <header className="chat-header">
      <div className="chat-header-main">
        <div className="chat-header-icon">
          <span className="chat-header-cross">+</span>
        </div>
        <div>
          <h1 className="chat-title">Healthcare Assistant</h1>
          <p className="chat-subtitle">Your basic health guidance companion</p>
        </div>
      </div>
      <button
        type="button"
        className="dark-toggle"
        onClick={onToggleDarkMode}
      >
        {darkMode ? "Light mode" : "Dark mode"}
      </button>
    </header>
  );
}

export default Header;

