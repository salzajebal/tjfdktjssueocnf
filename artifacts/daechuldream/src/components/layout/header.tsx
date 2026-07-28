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
              {/* Rounded square background */}
              <rect width="32" height="32" rx="9" fill="url(#logoGrad)" />
              {/* Diamond / gem shape */}
              <polygon points="16,6 24,13 16,27 8,13" fill="none" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
              <line x1="8" y1="13" x2="24" y2="13" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="16" y1="6" x2="8" y2="13" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="16" y1="6" x2="24" y2="13" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
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
