/**
 * DB 백업 스크립트
 * 배포된 API 서버의 /api/admin/backup 엔드포인트를 호출합니다.
 * 배포 서버는 프로덕션 DATABASE_URL에 접근 가능하므로 실제 프로덕션 데이터가 백업됩니다.
 */

const DEPLOYED_URL = "https://prime874.com";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "daechuldream-admin-token-2024";

export async function backupDb() {
  console.log(`\n📦 프로덕션 DB 백업 시작`);
  console.log(`▶ POST ${DEPLOYED_URL}/api/admin/backup`);

  const res = await fetch(`${DEPLOYED_URL}/api/admin/backup`, {
    method: "POST",
    headers: {
      "x-admin-token": ADMIN_TOKEN,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json() as { success: boolean; message?: string; file?: string; error?: string };

  if (!res.ok || !data.success) {
    throw new Error(`백업 실패 (${res.status}): ${data.error ?? data.message}`);
  }

  console.log(`✅ ${data.message}`);
  if (data.file) console.log(`📁 ${data.file}`);
  console.log("✅ 백업 완료\n");
}

// 직접 실행 시
backupDb().catch((err) => {
  console.error("❌ 백업 실패:", err.message);
  process.exit(1);
});
