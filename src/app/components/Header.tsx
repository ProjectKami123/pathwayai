"use client";

import React from 'react';
import './styles.css';

export default function Header({ className = '' }: { className?: string }) {
  return (
    <header className={`header-container ${className}`}>
      <h1 className="shimmer-text">PATHWAYAI</h1>
    </header>
  );
}
