"use client";

import React from "react";
import Header from "@/components/Header";
import Chat from "@/components/Chat";

const Page: React.FC = () => {
  return (
    <div className="flex flex-col justify-between h-screen bg-gray-800 p-2 mx-auto max-w-full">
      <Header className="my-5" />
      <div className="flex w-full flex-grow overflow-hidden relative">
        <Chat/>
      </div>
    </div>
  );
};

export default Page;
