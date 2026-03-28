import React from "react";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`chat-row ${isUser ? "chat-row-user" : "chat-row-bot"}`}>
      {!isUser && (
        <div className="avatar avatar-bot" aria-hidden="true">
          🩺
        </div>
      )}
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-bot"}`}>
        <div className="bubble-text">{message.text}</div>
        {message.disclaimer && (
          <div className="bubble-disclaimer">
            {message.disclaimer}
          </div>
        )}
        <div className="bubble-meta">
          <span className="bubble-meta-role">
            {isUser ? "You" : "Assistant"}
          </span>
          <span className="bubble-meta-dot">·</span>
          <span className="bubble-meta-time">{formatTime(message.timestamp)}</span>
        </div>
      </div>
      {isUser && (
        <div className="avatar avatar-user" aria-hidden="true">
          🙂
        </div>
      )}
    </div>
  );
}

export default ChatMessage;

