"use client";

import { Message } from "ai";
import { useRef, useEffect } from "react";

export default function Messages({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <p>Start a conversation with PATHWAYAI</p>
          <p className="text-sm mt-2 text-gray-500">The AI assistant that helps you find your way</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
        >
          <div className={`message ${msg.role}`}>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
