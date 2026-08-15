/**
 * DB 백업 스크립트
 * 배포된 API에서 프로덕션 데이터를 SQL로 받아 GitHub에 푸시합니다.
 * - 배포 서버: 프로덕션 DB 읽기 → SQL 반환
 * - 이 스크립트: SQL 저장 → git 커밋 → GitHub 푸시
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "../..");
// 배포 전 테스트 시: BACKUP_URL=http://localhost:8080 pnpm backup
const DEPLOYED_URL = process.env.BACKUP_URL ?? "https://prime874.com";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "daechuldream-admin-token-2024";
const GIT_TOKEN = process.env.GIT_TOKEN;

function run(cmd: string, opts?: { redact?: string }) {
  const display = opts?.redact ? cmd.replace(opts.redact, "***") : cmd;
  console.log(`▶ ${display}`);
  return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: "pipe" });
}

function kstDate(): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()).replace(/\. /g, "-").replace(".", "");
}

export async function backupDb() {
  if (!GIT_TOKEN) throw new Error("GIT_TOKEN 환경변수가 없습니다.");

  console.log(`\n📦 프로덕션 DB 백업 시작`);

  // 1. 배포된 API에서 SQL 덤프 수신
  console.log(`▶ GET ${DEPLOYED_URL}/api/admin/backup/dump`);
  const res = await fetch(`${DEPLOYED_URL}/api/admin/backup/dump`, {
    headers: { "x-admin-token": ADMIN_TOKEN },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API 오류 (${res.status}): ${body}`);
  }

  const sqlContent = await res.text();
  console.log(`✅ SQL 수신 완료 (${sqlContent.length.toLocaleString()} bytes)`);

  // 2. 파일 저장
  const date = kstDate();
  const backupsDir = path.join(ROOT, "backups");
  fs.mkdirSync(backupsDir, { recursive: true });

  const dumpFile = path.join(backupsDir, `db_dump_${date}.sql`);
  fs.writeFileSync(dumpFile, sqlContent, "utf8");
  fs.writeFileSync(path.join(ROOT, "db_dump.sql"), sqlContent, "utf8");
  console.log(`💾 저장: ${dumpFile}`);

  // 3. 30일 이상 된 백업 삭제
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  for (const file of fs.readdirSync(backupsDir)) {
    const fp = path.join(backupsDir, file);
    if (fs.statSync(fp).mtimeMs < cutoff) {
      fs.unlinkSync(fp);
      console.log(`🗑 삭제: ${file}`);
    }
  }

  // 4. GitHub 푸시
  const repoUrl = `https://salzajebal:${GIT_TOKEN}@github.com/salzajebal/tjfdktjssueocnf.git`;
  run(`git config user.name "backup-bot"`);
  run(`git config user.email "backup@replit"`);
  run(`git remote set-url origin "${repoUrl}"`, { redact: GIT_TOKEN });
  run(`git add backups/ db_dump.sql`);

  try {
    run(`git diff --staged --quiet`);
    console.log("ℹ️  변경사항 없음 — 커밋 건너뜀");
  } catch {
    try { run(`git stash --include-untracked`); } catch { /* 없으면 무시 */ }
    run(`git pull --rebase origin main`);
    try { run(`git stash pop`); } catch { /* 없으면 무시 */ }
    run(`git add backups/ db_dump.sql`);
    run(`git commit -m "chore: 프로덕션 DB 백업 ${date}"`);
    run(`git push origin main`);
    console.log(`🚀 GitHub 푸시 완료`);
  }

  console.log("✅ 백업 완료\n");
}

// 직접 실행 시 (import 시에는 실행 안 됨)
const isMain = process.argv[1]?.endsWith("backup.ts") || process.argv[1]?.endsWith("backup.js");
if (isMain) {
  backupDb().catch((err) => {
    console.error("❌ 백업 실패:", err.message);
    process.exit(1);
  });
}
