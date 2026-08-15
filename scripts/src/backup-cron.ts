/**
 * 백업 스케줄러 — 매일 오전 0시, 오후 12시 KST 실행
 * `pnpm --filter @workspace/scripts run backup:cron` 으로 시작
 */
import { backupDb } from "./backup.js";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9
const BACKUP_HOURS_KST = [0, 12]; // 자정(00:00), 정오(12:00)

function msUntilNextBackup(): { ms: number; nextTime: string } {
  const nowUtcMs = Date.now();
  const kstNow = new Date(nowUtcMs + KST_OFFSET_MS);

  let minMs = Infinity;
  let nextTimeStr = "";

  for (const hour of BACKUP_HOURS_KST) {
    const candidate = new Date(kstNow);
    candidate.setHours(hour, 0, 0, 0);
    if (candidate <= kstNow) candidate.setDate(candidate.getDate() + 1);

    const diffMs = candidate.getTime() - kstNow.getTime();
    if (diffMs < minMs) {
      minMs = diffMs;
      const h = String(hour).padStart(2, "0");
      nextTimeStr = `${h}:00 KST`;
    }
  }

  const diffH = Math.floor(minMs / 3600000);
  const diffM = Math.floor((minMs % 3600000) / 60000);
  console.log(`⏰ 다음 백업: ${nextTimeStr} (${diffH}시간 ${diffM}분 후)`);
  return { ms: minMs, nextTime: nextTimeStr };
}

async function scheduleNext() {
  const { ms } = msUntilNextBackup();
  setTimeout(async () => {
    try {
      await backupDb();
    } catch (err) {
      console.error("❌ 백업 실패:", err);
    }
    scheduleNext(); // 다음 회차 예약
  }, ms);
}

console.log("🗄️  DB 백업 스케줄러 시작 (매일 00:00 · 12:00 KST)");
scheduleNext();

// 프로세스 유지
process.stdin.resume();
