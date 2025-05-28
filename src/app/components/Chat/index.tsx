"use client";

import React, { FormEvent } from "react";
import { useChat } from "ai/react";
import AIBot from "../AIBot";
import "./chatStyles.css";
import Messages from "./Messages";

const Chat: React.FC = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="chat-container">
      <div className="chat-inner">
        <AIBot />
        <div className="messages-container">
          <Messages messages={messages} />
        </div>
        <form onSubmit={handleSubmit} className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
          />
        </form>
      </div>
    </div>
  );
};

export default Chat;
