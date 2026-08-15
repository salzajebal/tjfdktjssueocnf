/**
 * 백업 스케줄러 — 매일 오전 3시 KST에 실행
 * `pnpm --filter @workspace/scripts run backup:cron` 으로 시작
 * Replit VM 배포(항상 실행)로 등록해야 합니다.
 */
import { backupDb } from "./backup.js";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9
const BACKUP_HOUR_KST = 3; // 오전 3시 KST

function msUntilNextBackup(): number {
  const now = new Date();
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);

  const next = new Date(kstNow);
  next.setHours(BACKUP_HOUR_KST, 0, 0, 0);

  // 이미 지났으면 내일
  if (next <= kstNow) next.setDate(next.getDate() + 1);

  const diffMs = next.getTime() - kstNow.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);
  console.log(`⏰ 다음 백업까지 ${diffH}시간 ${diffM}분`);
  return diffMs;
}

async function scheduleNext() {
  const delay = msUntilNextBackup();
  setTimeout(async () => {
    try {
      await backupDb();
    } catch (err) {
      console.error("❌ 백업 실패:", err);
    }
    scheduleNext(); // 다음 날 예약
  }, delay);
}

console.log("🗄️  DB 백업 스케줄러 시작");
scheduleNext();

// 프로세스 유지
process.stdin.resume();
