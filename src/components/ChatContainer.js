import React from "react";
import ChatMessage from "./ChatMessage";

function ChatContainer({ messages, isLoading, chatEndRef }) {
  return (
    <div className="chat-container">
      <div className="chat-scroll">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {isLoading && (
          <div className="chat-row chat-row-bot">
            <div className="avatar avatar-bot" aria-hidden="true">
              🩺
            </div>
            <div className="bubble bubble-bot typing-bubble">
              <div className="typing-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="typing-label">Bot is typing...</div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

export default ChatContainer;

