import { useState } from "react";
import { useSubmitApplication, useGetKakaoLink } from "@workspace/api-client-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const PURPLE = "#5B4BFF";

function StepIndicator({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "직업" },
    { n: 2, label: "인적사항" },
    { n: 3, label: "심사정보" },
    { n: 4, label: "결과" },
  ];
  return (
    <div className="flex items-start justify-between px-2 pt-3 pb-1">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-start flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={
                step >= s.n
                  ? { background: PURPLE, color: "#fff" }
                  : { background: "#d1d5db", color: "#9ca3af" }
              }
            >
              {s.n}
            </div>
            <span className="text-[10px] mt-1" style={{ color: step >= s.n ? PURPLE : "#9ca3af", fontWeight: 600 }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 flex items-start pt-3.5">
              <div className="w-full h-px" style={{ background: step > s.n ? PURPLE : "#d1d5db" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Home() {
  const [step, setStep] = useState(1);
  const [jobType, setJobType] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitApplication = useSubmitApplication();
  const { data: kakaoData } = useGetKakaoLink();

  const validate1 = () => {
    if (!jobType) { setErrors({ jobType: "직업구분을 선택해주세요." }); return false; }
    setErrors({}); return true;
  };
  const validate2 = () => {
    const e: Record<string, string> = {};
    if (!name || name.length < 2) e.name = "이름을 정확히 입력해주세요.";
    if (!phone || phone.length < 10) e.phone = "연락처를 정확히 입력해주세요.";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    submitApplication.mutate(
      { data: { name, phone, job_type: jobType, loan_amount: loanAmount, loan_purpose: loanPurpose, credit_score: creditScore } },
      { onSuccess: () => setStep(4), onError: () => alert("오류가 발생했습니다. 다시 시도해주세요.") }
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f3f3fb", fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-8 md:py-14" style={{ background: "#f3f3fb" }}>
          <div className="max-w-5xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-start gap-6 md:gap-10">
            {/* Left */}
            <div className="flex-1 space-y-5 pt-2">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border" style={{ borderColor: PURPLE, color: PURPLE, background: "#eeebff" }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: PURPLE }} />
                금융감독원 정식 등록
              </div>
              <h1 className="text-[28px] md:text-4xl font-bold leading-snug text-gray-900" style={{ fontWeight: 800 }}>
                대출드림<br />누구나 가능한 맞춤 대출
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed" style={{ fontWeight: 500 }}>
                직장인·사업자·주부·무직자 누구나<br />
                1분 만에 대출 가능 여부를 확인하세요
              </p>
              <div style={{ color: PURPLE }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </div>
              <div className="flex gap-10 pt-2">
                <div>
                  <p className="text-2xl font-bold" style={{ color: PURPLE, fontWeight: 800 }}>5,000만</p>
                  <p className="text-xs text-gray-500 mt-0.5" style={{ fontWeight: 600 }}>최대 한도</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: PURPLE, fontWeight: 800 }}>6.9%~</p>
                  <p className="text-xs text-gray-500 mt-0.5" style={{ fontWeight: 600 }}>최저 금리</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: PURPLE, fontWeight: 800 }}>당일</p>
                  <p className="text-xs text-gray-500 mt-0.5" style={{ fontWeight: 600 }}>입금</p>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="w-full lg:w-[380px] flex-shrink-0" id="apply">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Card Header */}
                <div className="py-3 text-center text-white text-sm font-bold" style={{ background: PURPLE }}>
                  무료 한도조회
                </div>

                <div className="p-5">
                  {step === 1 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>직업구분</label>
                        <select
                          value={jobType}
                          onChange={(e) => { setJobType(e.target.value); setErrors({}); }}
                          className="w-full border border-gray-300 rounded text-sm px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-1 appearance-none bg-white"
                          style={{ accentColor: PURPLE }}
                        >
                          <option value="">선택</option>
                          <option value="직장인">직장인</option>
                          <option value="사업자">사업자</option>
                          <option value="주부">주부</option>
                          <option value="무직자">무직자</option>
                        </select>
                        {errors.jobType && <p className="text-xs text-red-500 mt-1">{errors.jobType}</p>}
                      </div>
                      <button
                        onClick={() => { if (validate1()) setStep(2); }}
                        className="w-full py-3 rounded text-white text-sm font-bold flex items-center justify-center gap-1 mt-2 hover:opacity-90 transition-opacity"
                        style={{ background: PURPLE }}
                      >
                        다음 <span>›</span>
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>이름</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => { setName(e.target.value); setErrors({}); }}
                          placeholder="본명 입력"
                          className="w-full border border-gray-300 rounded text-sm px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-1"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>연락처</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setErrors({}); }}
                          placeholder="010-0000-0000"
                          className="w-full border border-gray-300 rounded text-sm px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-1"
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                          이전
                        </button>
                        <button
                          onClick={() => { if (validate2()) setStep(3); }}
                          className="flex-[2] py-2.5 rounded text-white text-sm font-bold hover:opacity-90 transition-opacity"
                          style={{ background: PURPLE }}
                        >
                          다음 ›
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>희망 대출금액</label>
                        <select
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="w-full border border-gray-300 rounded text-sm px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-1 appearance-none bg-white"
                        >
                          <option value="">선택</option>
                          <option value="300만원 이하">300만원 이하</option>
                          <option value="300만~1,000만원">300만~1,000만원</option>
                          <option value="1,000만~3,000만원">1,000만~3,000만원</option>
                          <option value="3,000만원 이상">3,000만원 이상</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>자금 용도</label>
                        <select
                          value={loanPurpose}
                          onChange={(e) => setLoanPurpose(e.target.value)}
                          className="w-full border border-gray-300 rounded text-sm px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-1 appearance-none bg-white"
                        >
                          <option value="">선택</option>
                          <option value="생활자금">생활자금</option>
                          <option value="사업자금">사업자금</option>
                          <option value="대환대출">대환대출</option>
                          <option value="기타">기타</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>신용등급</label>
                        <select
                          value={creditScore}
                          onChange={(e) => setCreditScore(e.target.value)}
                          className="w-full border border-gray-300 rounded text-sm px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-1 appearance-none bg-white"
                        >
                          <option value="">선택</option>
                          <option value="1~2등급">1~2등급 (매우 우량)</option>
                          <option value="3~4등급">3~4등급 (우량)</option>
                          <option value="5~6등급">5~6등급 (보통)</option>
                          <option value="7~8등급">7~8등급 (주의)</option>
                          <option value="9~10등급">9~10등급 (위험)</option>
                        </select>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                          이전
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={submitApplication.isPending}
                          className="flex-[2] py-2.5 rounded text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
                          style={{ background: PURPLE }}
                        >
                          {submitApplication.isPending ? "신청 중..." : "다음 ›"}
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="py-6 text-center">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#eeebff" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={PURPLE} strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">신청이 완료되었습니다!</h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-5">
                        담당자가 확인 후<br />10분 내에 연락드리겠습니다.
                      </p>
                      <button
                        onClick={() => { setStep(1); setJobType(""); setName(""); setPhone(""); setLoanAmount(""); setLoanPurpose(""); setCreditScore(""); }}
                        className="w-full py-2.5 rounded text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        추가 신청하기
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step indicator — separate slide below the card */}
              <div className="bg-white rounded-lg shadow-sm mt-3 px-3 py-1">
                <StepIndicator step={step} />
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="bg-white border-t border-b border-gray-200 py-3 md:py-4">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-0">
              {[
                { icon: "shield", label: "선입금 절대 없음" },
                { icon: "phone", label: "100% 비대면" },
                { icon: "lock", label: "개인정보 보호" },
                { icon: "bolt", label: "당일 심사·입금" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-center gap-1.5 text-sm text-gray-600 py-1" style={{ fontWeight: 600 }}>
                  {item.icon === "shield" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                  {item.icon === "phone" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  {item.icon === "lock" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                  {item.icon === "bolt" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <p className="text-xs font-bold mb-1 tracking-widest" style={{ color: PURPLE }}>PRODUCTS</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontWeight: 800 }}>맞춤 대출 상품</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { badge: "연체자", title: "대출드림 연체자", sub: "1개월 이상 연체 지속 중인 분", limit: "최대 2,000만", rate: "연 9.9%~", term: "12~60개월" },
                { badge: "저신용자", title: "대출드림 저신용자", sub: "신용등급 7등급 이하", limit: "최대 1,500만", rate: "연 12.9%~", term: "12~48개월" },
                { badge: "주부", title: "대출드림 주부", sub: "만 19세 이상 주부", limit: "최대 1,000만", rate: "연 14.9%~", term: "12~36개월" },
                { badge: "무직자", title: "대출드림 무직자", sub: "만 19세 이상 누구나", limit: "최대 500만", rate: "연 17.9%~", term: "12~24개월" },
              ].map((prod) => (
                <div key={prod.badge} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-sm transition-shadow">
                  <p className="text-xs font-semibold mb-1.5" style={{ color: PURPLE }}>{prod.badge}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5" style={{ fontWeight: 800 }}>{prod.title}</h3>
                  <p className="text-xs text-gray-500 mb-5" style={{ fontWeight: 500 }}>{prod.sub}</p>
                  <div className="flex gap-6 mb-5">
                    <div>
                      <p className="text-xs text-gray-500 mb-1" style={{ fontWeight: 600 }}>한도</p>
                      <p className="text-base text-gray-900" style={{ fontWeight: 700 }}>{prod.limit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1" style={{ fontWeight: 600 }}>금리</p>
                      <p className="text-base text-gray-900" style={{ fontWeight: 700 }}>{prod.rate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1" style={{ fontWeight: 600 }}>상환</p>
                      <p className="text-base text-gray-900" style={{ fontWeight: 700 }}>{prod.term}</p>
                    </div>
                  </div>
                  <a href="#apply">
                    <button className="w-full py-2.5 rounded text-white text-sm font-bold hover:opacity-90 transition-opacity" style={{ background: PURPLE }}>
                      신청하기
                    </button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dark Section */}
        <section className="py-10 md:py-14 bg-[#1c1c1e]">
          <div className="max-w-5xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-8 md:gap-12">
            <div className="flex-shrink-0">
              <h2 className="text-2xl font-bold text-white leading-snug" style={{ fontWeight: 800 }}>
                이런 고민,<br />대출드림이<br />해결합니다
              </h2>
            </div>
            <div className="flex-[2] space-y-4">
              {[
                "급하게 자금이 필요한데 입금이 늦어지고 있어요",
                "서류가 많아서 중간에 포기하게 돼요",
                "여러 곳에서 상담받았지만 번번이 부결이에요",
                "연체 이력 때문에 어디서도 안 받아줘요",
                "소득이 없어 신청 자체가 막혀 있어요",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-gray-700 pb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                    style={{ background: PURPLE }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm text-gray-300" style={{ fontWeight: 500 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-10 md:py-14 bg-[#f3f3fb]">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
              {[
                {
                  label: "선입금 없음",
                  desc: "선입금 요구 없음",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={PURPLE} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  label: "100% 비대면",
                  desc: "방문 없이 모바일 완료",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={PURPLE} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  label: "정보 보호",
                  desc: "법적 기준 안전 관리",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={PURPLE} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                },
                {
                  label: "당일 입금",
                  desc: "심사 완료 즉시 입금",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={PURPLE} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-2 md:gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center" style={{ background: "#e8e5ff" }}>
                    {f.icon}
                  </div>
                  <p className="text-xs md:text-sm text-gray-800" style={{ fontWeight: 700 }}>{f.label}</p>
                  <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed" style={{ fontWeight: 500 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <p className="text-xs font-bold mb-1 tracking-widest" style={{ color: PURPLE }}>REVIEWS</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontWeight: 800 }}>고객 후기</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "믿을 수 있는 곳이에요",
                  highlight: "정식 등록 업체라",
                  content: " 걱정 없이 진행했습니다. 상담도 진심하고 만족하니다.",
                  meta: "김** 님 · 45세 · 주부",
                },
                {
                  title: "간편하게 해결했어요",
                  highlight: "급한 생활자금이",
                  content: " 필요했는데, 복잡한 절차 없이 빠르게 받았습니다.",
                  meta: "이** 님 · 37세 · 무직",
                },
                {
                  title: "다른 곳에서 안 됐는데",
                  highlight: "여러 번 거절당한",
                  content: " 뒤 여기서 가능하다고 해서 놀랐습니다.",
                  meta: "박** 님 · 38세 · 직장인",
                },
                {
                  title: "속도가 빠르네요",
                  highlight: "오전에 신청하고",
                  content: " 오후에 입금까지 완료. 정말 빨랐습니다.",
                  meta: "최** 님 · 54세 · 사업자",
                },
              ].map((r) => (
                <div key={r.title} className="border border-gray-200 rounded-lg p-5">
                  <h4 className="text-base text-gray-900 mb-2" style={{ fontWeight: 800 }}>{r.title}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed" style={{ fontWeight: 500 }}>
                    <span style={{ color: PURPLE, fontWeight: 600 }}>{r.highlight}</span>
                    {r.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-3" style={{ fontWeight: 500 }}>{r.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* KakaoTalk Float */}
      <div className="fixed bottom-5 right-4 md:right-5 z-50">
        {kakaoData?.kakao_link ? (
          <a
            href={kakaoData.kakao_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full shadow-lg px-3 py-2 md:px-4 md:py-2.5 text-sm font-bold"
            style={{ background: "#FAE100", color: "#3C1E1E" }}
          >
            <span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#3C1E1E" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#FAE100" d="M12 3C6.48 3 2 6.72 2 11.28c0 2.88 1.62 5.43 4.1 7.02l-.71 2.64c-.11.43.16.43.34.31l2.56-1.74c.7.13 1.42.2 1.71.2 5.52 0 10-3.72 10-8.43S17.52 3 12 3z"/>
              </svg>
            </span>
            카카오톡 상담
          </a>
        ) : (
          <button
            className="flex items-center gap-2 rounded-full shadow-lg px-3 py-2 md:px-4 md:py-2.5 text-sm font-bold cursor-default"
            style={{ background: "#FAE100", color: "#3C1E1E" }}
          >
            <span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#3C1E1E" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#FAE100" d="M12 3C6.48 3 2 6.72 2 11.28c0 2.88 1.62 5.43 4.1 7.02l-.71 2.64c-.11.43.16.43.34.31l2.56-1.74c.7.13 1.42.2 1.71.2 5.52 0 10-3.72 10-8.43S17.52 3 12 3z"/>
              </svg>
            </span>
            카카오톡 상담
          </button>
        )}
      </div>
    </div>
  );
}
