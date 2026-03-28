import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Header from "./Header";
import ChatContainer from "./ChatContainer";
import ChatInput from "./ChatInput";
import "./Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setError("");

    const timestamp = new Date().toISOString();

    const newMessages = [
      ...messages,
      {
        id: `${Date.now()}-user`,
        role: "user",
        text: trimmed,
        timestamp
      }
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiBase = process.env.REACT_APP_API_BASE || "";
      const res = await axios.post(`${apiBase}/api/chat`, { message: trimmed });

      const botText = res.data?.reply || "Sorry, I could not generate a response.";

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          role: "bot",
          text: botText,
          disclaimer: "This chatbot provides informational guidance only.",
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      const d = err.response?.data || {};
      const msg = d.detail || d.error || err.message || "Request failed";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "bot",
          text: `Error: ${msg}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chat-app ${darkMode ? "dark" : "light"}`}>
      <div className="chat-shell">
        <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode((v) => !v)} />
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          chatEndRef={chatEndRef}
        />
        {error && (
          <div className="chat-error-banner">
            {error}
          </div>
        )}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          disabled={!input.trim() || isLoading}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default Chatbot;