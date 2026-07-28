import { Link } from "wouter";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 flex h-14 items-center justify-between">
        <Link href="/">
          <span className="flex items-center gap-2 cursor-pointer select-none">
            {/* Logo mark */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7B6BFF" />
                  <stop offset="100%" stopColor="#4534E0" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="9" fill="url(#logoGrad)" />
              {/* Arch */}
              <path d="M5 23 Q16 7 27 23" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              {/* Deck */}
              <line x1="4" y1="23" x2="28" y2="23" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              {/* Hangers */}
              <line x1="11" y1="23" x2="11" y2="17" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="16" y1="23" x2="16" y2="11.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="21" y1="23" x2="21" y2="17" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="text-lg text-gray-900" style={{ fontWeight: 700 }}>프라임브릿지</span>
          </span>
        </Link>
        <a href="#apply">
          <button className="bg-[#5B4BFF] text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-[#4a3aee] transition-colors">
            상담 신청
          </button>
        </a>
      </div>
    </header>
  );
}
