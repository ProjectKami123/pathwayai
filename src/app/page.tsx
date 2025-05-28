"use client";

import React, { useEffect } from "react";
import Header from "@/app/components/Header";
import Chat from "@/app/components/Chat";
import "./globals.css";

const Page: React.FC = () => {
  // Add animation for the gradient rotation
  useEffect(() => {
    const root = document.documentElement;
    const updateRotate = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      root.style.setProperty('--rotate', `${x * 720}deg`);
    };

    window.addEventListener('mousemove', updateRotate);
    return () => window.removeEventListener('mousemove', updateRotate);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Header />
        <div className="mt-8">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Page;
