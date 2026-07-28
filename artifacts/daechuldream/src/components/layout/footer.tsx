const PURPLE = "#5B4BFF";

export function Footer() {
  return (
    <footer className="bg-[#1a2240] text-gray-400">
      {/* Main footer */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12">

          {/* Brand */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="fGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7B6BFF" />
                    <stop offset="100%" stopColor="#4534E0" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="9" fill="url(#fGrad)" />
                <path d="M5 23 Q16 7 27 23" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="4" y1="23" x2="28" y2="23" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="11" y1="23" x2="11" y2="17" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="16" y1="23" x2="16" y2="11.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="21" y1="23" x2="21" y2="17" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="text-white text-base font-bold">프라임브릿지</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-400 max-w-xs" style={{ fontWeight: 500 }}>
              사업자의 사업 현황을 분석하여<br />
              적합한 금융 상담을 연결해드리는<br />
              사업자 금융 컨설팅 서비스입니다.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8 md:gap-16">
            <div>
              <h4 className="text-xs font-bold text-gray-300 mb-3 tracking-widest uppercase">서비스</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#apply" className="hover:text-white transition-colors">무료 상담 신청</a></li>
                <li><span className="text-gray-500">사업자 금융 컨설팅</span></li>
                <li><span className="text-gray-500">개인사업자 대출 상담</span></li>
                <li><span className="text-gray-500">법인사업자 대출 상담</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-300 mb-3 tracking-widest uppercase">안내</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><span className="text-gray-500">100% 비대면 진행</span></li>
                <li><span className="text-gray-500">선입금 없음</span></li>
                <li><span className="text-gray-500">1:1 맞춤 상담</span></li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <h4 className="text-xs font-bold text-gray-300 mb-3 tracking-widest uppercase">상담 신청</h4>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              무료로 사업 현황을 검토하고<br />
              맞춤 금융 방향을 안내받으세요.
            </p>
            <a href="#apply">
              <button
                className="text-xs font-bold px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-80"
                style={{ background: PURPLE }}
              >
                무료 상담 신청하기 →
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700/50">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2026 프라임브릿지. All rights reserved.</p>
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            선입금, 수수료 선납, 작업비 등을 요구하는 업체는 이용하지 마세요. 프라임브릿지는 상담 전 어떠한 명목의 선입금도 요구하지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
