import { useRef, useState } from "react";
import { useSubmitApplication } from "@workspace/api-client-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const PURPLE = "#5B4BFF";

/* ─── Reusable pill button ─── */
function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm border transition-all whitespace-nowrap"
      style={
        selected
          ? { background: PURPLE, borderColor: PURPLE, color: "#fff", fontWeight: 700 }
          : { background: "#fff", borderColor: "#d1d5db", color: "#374151", fontWeight: 500 }
      }
    >
      {label}
    </button>
  );
}

/* ─── Step indicator ─── */
function StepIndicator({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "개인정보" },
    { n: 2, label: "사업자 정보" },
    { n: 3, label: "매출·대출" },
    { n: 4, label: "희망 조건" },
  ];
  return (
    <div className="flex items-start justify-between px-1">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-start flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={
                step >= s.n
                  ? { background: PURPLE, color: "#fff" }
                  : { background: "#e5e7eb", color: "#9ca3af" }
              }
            >
              {s.n}
            </div>
            <span
              className="text-[10px] mt-1 text-center leading-tight"
              style={{ color: step >= s.n ? PURPLE : "#9ca3af", fontWeight: 600 }}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 flex items-start pt-4">
              <div
                className="w-full h-px"
                style={{ background: step > s.n ? PURPLE : "#e5e7eb" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Field wrapper ─── */
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-gray-800" style={{ fontWeight: 600 }}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─── Section heading ─── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-2 pb-1 border-b border-gray-100">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{children}</h3>
    </div>
  );
}

const REGIONS = [
  "서울특별시", "경기도", "인천광역시", "강원특별자치도", "충청북도",
  "충청남도", "대전광역시", "세종특별자치시", "전북특별자치도", "전라남도",
  "광주광역시", "경상북도", "경상남도", "대구광역시", "울산광역시",
  "부산광역시", "제주특별자치도",
];

/* ══════════════════════════════════════════════════
   Home
══════════════════════════════════════════════════ */
export function Home() {
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* Step 1 — 개인정보 */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [region, setRegion] = useState("");

  /* Step 2 — 사업자 기본 정보 */
  const [bizType, setBizType] = useState(""); // 개인 / 법인
  const [bizPeriod, setBizPeriod] = useState("");
  const [bizSector, setBizSector] = useState(""); // 업종
  const [bizCategory, setBizCategory] = useState(""); // 업태

  /* Step 3 — 매출·기존 대출 */
  const [rev2024, setRev2024] = useState("");
  const [rev2025, setRev2025] = useState("");
  const [monthlyRev, setMonthlyRev] = useState("");
  const [loanCount, setLoanCount] = useState("");
  const [loanBalance, setLoanBalance] = useState("");
  const [loanTypes, setLoanTypes] = useState<string[]>([]);
  const [delinquent, setDelinquent] = useState(""); // 현재 연체
  const [delinquent1y, setDelinquent1y] = useState(""); // 최근 1년 연체

  /* Step 4 — 희망 조건 */
  const [desiredAmount, setDesiredAmount] = useState("");
  const [purposes, setPurposes] = useState<string[]>([]);
  const [purposeOther, setPurposeOther] = useState("");

  const submitApplication = useSubmitApplication();

  /* helpers */
  const toggleMulti = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* validation */
  const validate1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = "성함을 입력해주세요.";
    if (!phone.trim() || phone.trim().length < 9) e.phone = "연락처를 입력해주세요.";
    if (!gender) e.gender = "성별을 선택해주세요.";
    if (!ageGroup) e.ageGroup = "연령대를 선택해주세요.";
    if (!region) e.region = "거주지역을 선택해주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate2 = () => {
    const e: Record<string, string> = {};
    if (!bizType) e.bizType = "사업자 유형을 선택해주세요.";
    if (!bizPeriod) e.bizPeriod = "사업 기간을 선택해주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate4 = () => {
    const e: Record<string, string> = {};
    if (!desiredAmount) e.desiredAmount = "희망 대출 금액을 선택해주세요.";
    if (purposes.length === 0) e.purposes = "자금 사용 용도를 하나 이상 선택해주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (validateFn: () => boolean, nextStep: number) => {
    if (validateFn()) {
      setErrors({});
      setStep(nextStep);
      scrollToForm();
    }
  };

  const handleSubmit = () => {
    if (!validate4()) return;

    const extra = {
      성별: gender,
      연령대: ageGroup,
      사업기간: bizPeriod,
      업종: bizSector,
      업태: bizCategory,
      "2024년매출": rev2024,
      월평균매출: monthlyRev,
      기존대출건수: loanCount,
      기존대출총잔액: loanBalance,
      대출종류: loanTypes.join(", "),
      현재연체: delinquent,
      "1년이내연체": delinquent1y,
      자금용도기타: purposeOther,
    };

    const purposeStr = [
      ...purposes.filter((p) => p !== "기타"),
      ...(purposes.includes("기타") && purposeOther ? [`기타: ${purposeOther}`] : []),
    ].join(", ");

    submitApplication.mutate(
      {
        data: {
          name: name.trim(),
          phone: phone.trim(),
          job_type: bizType,
          residence_type: region,
          loan_amount: desiredAmount,
          loan_purpose: purposeStr,
          annual_income: rev2025,
          credit_score: `현재연체:${delinquent}, 1년이내:${delinquent1y}`,
          message: JSON.stringify(extra),
        },
      },
      {
        onSuccess: () => {
          setStep(5);
          scrollToForm();
        },
        onError: () => alert("오류가 발생했습니다. 다시 시도해주세요."),
      }
    );
  };

  const PURPOSE_OPTIONS = [
    "운영자금", "여유자금 확보", "기존 대출 대환",
    "시설자금 (장비·기계 구입)", "인테리어 및 리모델링", "재고 확보",
    "급여 및 인건비", "임대료 및 고정비", "세금 납부",
    "신규 사업 및 사업 확장", "점포 이전·확장", "차량 구입 (사업용)", "기타",
  ];

  /* ─── render ─── */
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#f3f3fb",
        fontFamily:
          "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      }}
    >
      <Header />

      {/* Warning notice */}
      <div className="w-full py-2.5 px-4" style={{ background: "#fff8e1", borderBottom: "1px solid #ffe082" }}>
        <p className="text-xs text-amber-800 text-center leading-relaxed" style={{ fontWeight: 600 }}>
          선입금, 수수료 선납, 작업비 등을 요구하는 업체는 이용하지 마세요.<br />
          <span className="font-normal text-amber-700">프라임브릿지는 상담 전 어떠한 명목의 선입금도 요구하지 않습니다.</span>
        </p>
      </div>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="overflow-hidden" style={{ background: "#f3f3fb" }}>
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-0 md:gap-10">

              {/* Left: text */}
              <div className="flex-1 py-12 md:py-20 text-left">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border mb-5"
                  style={{ borderColor: PURPLE, color: PURPLE, background: "#eeebff" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: PURPLE }} />
                  사업자 금융 컨설팅 서비스
                </div>
                <h1
                  className="text-[26px] md:text-[38px] font-bold leading-snug text-gray-900 mb-4"
                  style={{ fontWeight: 800 }}
                >
                  사업자 자금,<br />어디서부터 시작해야<br />할지 고민되시나요?
                </h1>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-8" style={{ fontWeight: 500 }}>
                  사업 현황을 검토해 상담 가능한 금융 방향을 안내해드립니다.
                </p>
                <button
                  onClick={() => { scrollToForm(); }}
                  className="inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-md mb-8"
                  style={{ background: PURPLE }}
                >
                  무료 상담 신청하기 <span className="text-lg">›</span>
                </button>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#eeebff" }}>
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5 6.5-7" stroke={PURPLE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-xs text-gray-600 font-semibold">100% 비대면 상담</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#eeebff" }}>
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M8 2a4 4 0 100 8A4 4 0 008 2zM2 14c0-2.21 2.686-4 6-4s6 1.79 6 4" stroke={PURPLE} strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </div>
                    <span className="text-xs text-gray-600 font-semibold">사업자 맞춤 검토</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#eeebff" }}>
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none"><path d="M8 1v7l4 2" stroke={PURPLE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-xs text-gray-600 font-semibold">1:1 맞춤 상담</span>
                  </div>
                </div>
              </div>

              {/* Right: image */}
              <div className="w-full md:w-[420px] flex-shrink-0 self-end hidden md:block">
                <img
                  src="/hero-business.jpg"
                  alt="사업자 금융 컨설팅"
                  className="w-full h-[420px] object-cover object-top rounded-t-2xl"
                  style={{ display: "block" }}
                />
              </div>

            </div>
          </div>
        </section>

        {/* ── Application Form ── */}
        <section id="apply" className="py-10 md:py-14 bg-white border-t border-gray-100" ref={formRef}>
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <div className="text-center mb-8">
              <p className="text-xs font-bold tracking-widest mb-1" style={{ color: PURPLE }}>APPLY</p>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontWeight: 800 }}>
                무료 상담 신청서
              </h2>
            </div>

            {step < 5 && (
              <div className="mb-8">
                <StepIndicator step={step} />
              </div>
            )}

            {/* ── Step 1: 개인정보 ── */}
            {step === 1 && (
              <div className="space-y-5">
                <SectionHeading>개인정보</SectionHeading>

                <Field label="성함" required error={errors.name}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                    placeholder="실명을 입력해주세요"
                    className="w-full border border-gray-300 rounded-lg text-sm px-3.5 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ ["--tw-ring-color" as string]: PURPLE }}
                  />
                </Field>

                <Field label="연락처" required error={errors.phone}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                    placeholder="010-0000-0000"
                    className="w-full border border-gray-300 rounded-lg text-sm px-3.5 py-2.5 text-gray-700 focus:outline-none focus:ring-2"
                  />
                </Field>

                <Field label="성별" required error={errors.gender}>
                  <div className="flex flex-wrap gap-2">
                    {["남성", "여성"].map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={gender === v}
                        onClick={() => { setGender(gender === v ? "" : v); setErrors((p) => ({ ...p, gender: "" })); }}
                      />
                    ))}
                  </div>
                </Field>

                <Field label="연령대" required error={errors.ageGroup}>
                  <div className="flex flex-wrap gap-2">
                    {["20대 미만", "20대", "30대", "40대", "50대", "60대 이상"].map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={ageGroup === v}
                        onClick={() => { setAgeGroup(ageGroup === v ? "" : v); setErrors((p) => ({ ...p, ageGroup: "" })); }}
                      />
                    ))}
                  </div>
                </Field>

                <Field label="거주지역 (시/도)" required error={errors.region}>
                  <select
                    value={region}
                    onChange={(e) => { setRegion(e.target.value); setErrors((p) => ({ ...p, region: "" })); }}
                    className="w-full border border-gray-300 rounded-lg text-sm px-3.5 py-2.5 text-gray-700 focus:outline-none appearance-none bg-white"
                  >
                    <option value="">선택해주세요</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>

                <button
                  onClick={() => handleNext(validate1, 2)}
                  className="w-full py-3.5 rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity mt-2"
                  style={{ background: PURPLE }}
                >
                  다음 단계 →
                </button>
              </div>
            )}

            {/* ── Step 2: 사업자 기본 정보 ── */}
            {step === 2 && (
              <div className="space-y-5">
                <SectionHeading>사업자 기본 정보</SectionHeading>

                <Field label="사업자 유형" required error={errors.bizType}>
                  <div className="flex flex-wrap gap-2">
                    {["개인사업자", "법인사업자"].map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={bizType === v}
                        onClick={() => { setBizType(bizType === v ? "" : v); setErrors((p) => ({ ...p, bizType: "" })); }}
                      />
                    ))}
                  </div>
                </Field>

                <Field label="사업 기간" required error={errors.bizPeriod}>
                  <div className="flex flex-wrap gap-2">
                    {["6개월 미만", "6개월~1년", "1~2년", "2~3년", "3년 이상"].map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={bizPeriod === v}
                        onClick={() => { setBizPeriod(bizPeriod === v ? "" : v); setErrors((p) => ({ ...p, bizPeriod: "" })); }}
                      />
                    ))}
                  </div>
                </Field>

                <Field label="업종">
                  <input
                    type="text"
                    value={bizSector}
                    onChange={(e) => setBizSector(e.target.value)}
                    placeholder="예: 음식점업, 소매업, 제조업"
                    className="w-full border border-gray-300 rounded-lg text-sm px-3.5 py-2.5 text-gray-700 focus:outline-none"
                  />
                </Field>

                <Field label="업태">
                  <input
                    type="text"
                    value={bizCategory}
                    onChange={(e) => setBizCategory(e.target.value)}
                    placeholder="예: 한식, 의류, 전자부품"
                    className="w-full border border-gray-300 rounded-lg text-sm px-3.5 py-2.5 text-gray-700 focus:outline-none"
                  />
                </Field>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setStep(1); scrollToForm(); }}
                    className="flex-1 py-3 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => handleNext(validate2, 3)}
                    className="flex-[2] py-3 rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    style={{ background: PURPLE }}
                  >
                    다음 단계 →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: 매출·기존 대출 ── */}
            {step === 3 && (
              <div className="space-y-5">
                <SectionHeading>매출 정보</SectionHeading>

                <Field label="2024년 국세청 신고 매출액">
                  <input
                    type="text"
                    value={rev2024}
                    onChange={(e) => setRev2024(e.target.value)}
                    placeholder="예: 1억 2천만원"
                    className="w-full border border-gray-300 rounded-lg text-sm px-3.5 py-2.5 text-gray-700 focus:outline-none"
                  />
                </Field>

                <Field label="2025년 국세청 신고 매출액">
                  <input
                    type="text"
                    value={rev2025}
                    onChange={(e) => setRev2025(e.target.value)}
                    placeholder="예: 1억 5천만원"
                    className="w-full border border-gray-300 rounded-lg text-sm px-3.5 py-2.5 text-gray-700 focus:outline-none"
                  />
                </Field>

                <Field label="월평균 매출">
                  <input
                    type="text"
                    value={monthlyRev}
                    onChange={(e) => setMonthlyRev(e.target.value)}
                    placeholder="예: 1,200만원"
                    className="w-full border border-gray-300 rounded-lg text-sm px-3.5 py-2.5 text-gray-700 focus:outline-none"
                  />
                </Field>

                <SectionHeading>기존 대출</SectionHeading>

                <Field label="기존 대출 건수">
                  <div className="flex flex-wrap gap-2">
                    {["없음", "1건", "2건", "3건", "4건 이상"].map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={loanCount === v}
                        onClick={() => setLoanCount(loanCount === v ? "" : v)}
                      />
                    ))}
                  </div>
                </Field>

                <Field label="기존 대출 총잔액">
                  <div className="flex flex-wrap gap-2">
                    {["없음", "1,000만원 미만", "1,000~3,000만원", "3,000~5,000만원", "5,000만~1억원", "1억원 이상"].map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={loanBalance === v}
                        onClick={() => setLoanBalance(loanBalance === v ? "" : v)}
                      />
                    ))}
                  </div>
                </Field>

                <Field label="대출 종류 (복수 선택 가능)">
                  <div className="flex flex-wrap gap-2">
                    {["사업자대출", "개인신용대출", "담보대출", "카드론", "현금서비스"].map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={loanTypes.includes(v)}
                        onClick={() => toggleMulti(loanTypes, setLoanTypes, v)}
                      />
                    ))}
                  </div>
                </Field>

                <SectionHeading>연체 여부</SectionHeading>

                <Field label="현재 연체 중인 대출이 있나요?">
                  <div className="flex flex-wrap gap-2">
                    {["예", "아니오"].map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={delinquent === v}
                        onClick={() => setDelinquent(delinquent === v ? "" : v)}
                      />
                    ))}
                  </div>
                </Field>

                <Field label="최근 1년 내 연체 이력이 있나요?">
                  <div className="flex flex-wrap gap-2">
                    {["예", "아니오"].map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={delinquent1y === v}
                        onClick={() => setDelinquent1y(delinquent1y === v ? "" : v)}
                      />
                    ))}
                  </div>
                </Field>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setStep(2); scrollToForm(); }}
                    className="flex-1 py-3 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => { setErrors({}); setStep(4); scrollToForm(); }}
                    className="flex-[2] py-3 rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    style={{ background: PURPLE }}
                  >
                    다음 단계 →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 4: 희망 조건 ── */}
            {step === 4 && (
              <div className="space-y-5">
                <SectionHeading>희망 대출 금액</SectionHeading>

                <Field label="희망 금액을 선택해주세요" required error={errors.desiredAmount}>
                  <div className="flex flex-wrap gap-2">
                    {["1천만원 미만", "1천~3천만원", "3천~5천만원", "5천만원~1억원", "1억~3억원", "3억원 이상"].map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={desiredAmount === v}
                        onClick={() => { setDesiredAmount(desiredAmount === v ? "" : v); setErrors((p) => ({ ...p, desiredAmount: "" })); }}
                      />
                    ))}
                  </div>
                </Field>

                <SectionHeading>자금 사용 용도</SectionHeading>

                <Field label="용도를 선택해주세요 (복수 선택 가능)" required error={errors.purposes}>
                  <div className="flex flex-wrap gap-2">
                    {PURPOSE_OPTIONS.map((v) => (
                      <Pill
                        key={v}
                        label={v}
                        selected={purposes.includes(v)}
                        onClick={() => { toggleMulti(purposes, setPurposes, v); setErrors((p) => ({ ...p, purposes: "" })); }}
                      />
                    ))}
                  </div>
                  {purposes.includes("기타") && (
                    <input
                      type="text"
                      value={purposeOther}
                      onChange={(e) => setPurposeOther(e.target.value)}
                      placeholder="기타 용도를 직접 입력해주세요"
                      className="mt-2 w-full border border-gray-300 rounded-lg text-sm px-3.5 py-2.5 text-gray-700 focus:outline-none"
                    />
                  )}
                </Field>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setStep(3); scrollToForm(); }}
                    className="flex-1 py-3 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitApplication.isPending}
                    className="flex-[2] py-3 rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ background: PURPLE }}
                  >
                    {submitApplication.isPending ? "제출 중..." : "신청서 제출하기"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 5: 완료 ── */}
            {step === 5 && (
              <div className="py-8">
                {/* Header */}
                <div className="flex items-start gap-3 mb-6 p-5 rounded-xl" style={{ background: "#eeebff" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: PURPLE }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-snug" style={{ fontWeight: 800 }}>
                      상담 신청이 정상적으로 접수되었습니다.
                    </h3>
                    <p className="text-sm mt-1" style={{ color: PURPLE, fontWeight: 600 }}>프라임브릿지를 이용해 주셔서 감사합니다.</p>
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-5 text-sm text-gray-700 leading-relaxed" style={{ fontWeight: 500 }}>
                  <p>
                    제출해 주신 정보를 기반으로 고객님의 사업 현황과 상담 가능 여부를 검토한 후
                    담당 컨설턴트가 순차적으로 연락드릴 예정입니다.
                  </p>

                  <div className="rounded-xl p-5 border border-gray-200" style={{ background: "#f9f9ff" }}>
                    <p className="text-sm text-gray-800 mb-3" style={{ fontWeight: 700 }}>
                      정확한 상담을 위해 아래와 같은 추가 서류를 요청드릴 수 있습니다.
                    </p>
                    <ul className="space-y-2">
                      {[
                        "사업자등록증",
                        "부가가치세 신고서",
                        "재무제표 (법인사업자)",
                        "기타 상담에 필요한 서류",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PURPLE }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-400 mt-4">
                      ※ 추가 서류는 고객님의 상황에 따라 요청 여부가 달라질 수 있습니다.
                    </p>
                  </div>

                  <p className="text-sm text-gray-600">감사합니다.</p>
                  <p className="text-sm font-bold" style={{ color: PURPLE }}>프라임브릿지</p>
                </div>

                <button
                  onClick={() => {
                    setStep(1);
                    setName(""); setPhone(""); setGender(""); setAgeGroup(""); setRegion("");
                    setBizType(""); setBizPeriod(""); setBizSector(""); setBizCategory("");
                    setRev2024(""); setRev2025(""); setMonthlyRev("");
                    setLoanCount(""); setLoanBalance(""); setLoanTypes([]); setDelinquent(""); setDelinquent1y("");
                    setDesiredAmount(""); setPurposes([]); setPurposeOther("");
                    setErrors({});
                    scrollToForm();
                  }}
                  className="mt-8 w-full py-3 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  추가 신청하기
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── 이런 분들에게 추천합니다 ── */}
        <section className="bg-[#f3f3fb] py-10 md:py-14">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <p className="text-xs font-bold mb-1 tracking-widest" style={{ color: PURPLE }}>RECOMMEND</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-7" style={{ fontWeight: 800 }}>이런 분들에게 추천합니다</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "운영자금이 필요한 사업자",
                "기존 대출을 검토하거나 재구성을 고민하는 사업자",
                "신규 사업 확장 자금이 필요한 사업자",
                "여러 금융상품을 비교해 보고 싶은 사업자",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-4 border border-gray-100 bg-white">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                    style={{ background: PURPLE }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 진행 절차 ── */}
        <section className="py-10 md:py-14 bg-[#1c1c1e]">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <p className="text-xs font-bold mb-1 tracking-widest" style={{ color: PURPLE }}>PROCESS</p>
            <h2 className="text-2xl font-bold text-white mb-8" style={{ fontWeight: 800 }}>진행 절차</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { step: "①", label: "상담 신청서 제출" },
                { step: "②", label: "사업 현황 검토" },
                { step: "③", label: "상담 가능한 금융상품 검토" },
                { step: "④", label: "전문 상담 진행" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 flex flex-col gap-3"
                  style={{ background: "#2a2a2c" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                    style={{ background: PURPLE, color: "#fff" }}
                  >
                    {item.step}
                  </div>
                  <p className="text-sm text-gray-200 leading-snug" style={{ fontWeight: 600 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 고객 후기 ── */}
        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <p className="text-xs font-bold mb-1 tracking-widest" style={{ color: PURPLE }}>REVIEWS</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontWeight: 800 }}>고객 후기</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "김○○",
                  meta: "개인사업자 (카페 운영)",
                  badge: "승인금액 : 0원",
                  content: "처음에는 어디서부터 알아봐야 할지 몰라 여러 군데 문의만 하다가 시간을 많이 허비했습니다. 프라임브릿지에서는 제 사업 업력, 매출, 기존 대출 현황 등을 먼저 꼼꼼하게 확인한 후 상담 방향을 설명해 주셨습니다. 복잡한 금융 용어도 쉽게 알려주셔서 이해하기 편했고, 비대면으로 진행되어 매장을 비우지 않아도 상담을 받을 수 있었던 점이 가장 만족스러웠습니다.",
                },
                {
                  name: "박○○",
                  meta: "도소매업",
                  badge: "",
                  content: "운영자금이 필요해서 상담을 신청했는데 무조건 진행을 권하는 방식이 아니라 현재 상황에서 가능한 방법과 어려운 부분을 솔직하게 설명해 주셔서 신뢰가 갔습니다. 여러 금융상품을 비교해서 상담받을 수 있었고, 서류 준비도 하나씩 안내해 주셔서 처음 이용하는 입장에서도 부담 없이 진행할 수 있었습니다.",
                },
                {
                  name: "이○○",
                  meta: "법인사업자",
                  badge: "",
                  content: "법인이라 준비해야 할 서류가 많을 줄 알았는데 필요한 자료를 미리 정리해서 알려주셔서 수월하게 진행했습니다. 상담 과정도 체계적이었고 궁금한 사항을 문의할 때마다 빠르게 답변을 받을 수 있어 만족했습니다. 혼자 여러 금융사를 알아보는 것보다 훨씬 효율적이라는 느낌을 받았습니다.",
                },
                {
                  name: "최○○",
                  meta: "온라인 쇼핑몰 운영",
                  badge: "",
                  content: "기존 대출이 있어서 추가 상담이 가능할지 걱정이 많았는데 현재 상황을 먼저 검토한 후 현실적인 방향을 제시해 주셨습니다. 무리하게 가능하다고 말하지 않고 상담 가능한 부분과 어려운 부분을 구분해서 설명해 주셔서 오히려 믿음이 갔습니다.",
                },
                {
                  name: "정○○",
                  meta: "제조업",
                  badge: "",
                  content: "사업 확장을 위해 자금이 필요해 상담을 신청했습니다. 업종 특성과 사업 운영 기간까지 함께 고려해서 상담을 진행해 주셨고, 필요한 서류도 체크리스트 형태로 알려주셔서 준비하기 편했습니다.",
                },
                {
                  name: "한○○",
                  meta: "음식점 운영",
                  badge: "",
                  content: "예전에 다른 업체에서 선입금을 요구받은 적이 있어 걱정이 많았는데, 프라임브릿지는 상담 과정과 절차를 처음부터 명확하게 설명해 주셔서 안심할 수 있었습니다. 제 상황에 맞는 상담을 진행해 주려는 모습이 인상적이었고, 끝까지 믿고 상담을 받을 수 있었습니다.",
                },
              ].map((r) => (
                <div key={r.name} className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="#FBBF24">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                      </svg>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-sm font-bold text-gray-900">{r.name}</span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500">{r.meta}</span>
                    {r.badge && (
                      <>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs font-semibold" style={{ color: PURPLE }}>{r.badge}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

    </div>
  );
}
