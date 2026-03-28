import React from "react";

function ChatInput({ value, onChange, onSend, onKeyDown, disabled, isLoading }) {
  return (
    <div className="chat-input-bar">
      <textarea
        className="chat-input"
        rows={1}
        placeholder="Describe your symptoms in as much detail as you can..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        className="chat-send-btn"
        onClick={onSend}
        disabled={disabled}
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}

export default ChatInput;

