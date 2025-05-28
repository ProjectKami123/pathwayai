// Chat.tsx

import React, { FormEvent, ChangeEvent } from "react";
import Messages from "./Messages";
import { Message, useChat } from "ai/react";

const Chat: React.FC = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div id="chat" className="flex flex-col w-full max-w-4xl mx-auto px-4">
      <Messages messages={messages} />
      <form
        onSubmit={handleSubmit}
        className="mt-5 mb-5"
      >
        <input
          type="text"
          className="w-full p-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-blue-500"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
        />
      </form>
    </div>
  );
};

export default Chat;
