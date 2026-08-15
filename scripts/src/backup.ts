/**
 * DB 자동 백업 스크립트
 * 매일 오전 3시 (KST) 실행: pg_dump → Git 커밋 → GitHub 푸시
 */
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const ROOT = path.resolve(import.meta.dirname, "../..");

function kstDateString(): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/\. /g, "-")
    .replace(".", "");
}

function run(cmd: string, opts?: { cwd?: string; redact?: string }) {
  const display = opts?.redact ? cmd.replace(opts.redact, "***") : cmd;
  console.log(`▶ ${display}`);
  return execSync(cmd, { cwd: opts?.cwd ?? ROOT, encoding: "utf8", stdio: "pipe" });
}

export async function backupDb() {
  const databaseUrl = process.env.DATABASE_URL;
  const gitToken = process.env.GIT_TOKEN;

  if (!databaseUrl) throw new Error("DATABASE_URL 환경변수가 없습니다.");
  if (!gitToken) throw new Error("GIT_TOKEN 환경변수가 없습니다.");

  const date = kstDateString();
  const backupsDir = path.join(ROOT, "backups");
  const dumpFile = path.join(backupsDir, `db_dump_${date}.sql`);
  const latestFile = path.join(ROOT, "db_dump.sql");

  console.log(`\n📦 DB 백업 시작 (${date})`);

  // 1. backups/ 디렉토리 생성
  fs.mkdirSync(backupsDir, { recursive: true });

  // 2. pg_dump 실행
  run(
    `pg_dump "${databaseUrl}" --no-owner --no-acl --if-exists --clean -f "${dumpFile}"`
  );
  fs.copyFileSync(dumpFile, latestFile);
  console.log(`✅ 덤프 완료: ${dumpFile}`);

  // 3. 30일 이상 된 백업 삭제
  const files = fs.readdirSync(backupsDir);
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  for (const file of files) {
    const fp = path.join(backupsDir, file);
    if (fs.statSync(fp).mtimeMs < cutoff) {
      fs.unlinkSync(fp);
      console.log(`🗑 오래된 백업 삭제: ${file}`);
    }
  }

  // 4. GitHub 푸시
  const repoUrl = `https://salzajebal:${gitToken}@github.com/salzajebal/tjfdktjssueocnf.git`;
  run(`git config user.name "backup-bot"`);
  run(`git config user.email "backup@replit"`);
  run(`git remote set-url origin "${repoUrl}"`, { redact: gitToken });
  run(`git add backups/ db_dump.sql`);

  try {
    run(`git diff --staged --quiet`);
    console.log("ℹ️  변경사항 없음 — 커밋 건너뜀");
  } catch {
    // diff --staged --quiet 는 변경사항 있으면 exit 1
    // 다른 unstaged 변경사항 임시 보관
    try { run(`git stash --include-untracked`); } catch { /* 없으면 무시 */ }

    run(`git pull --rebase origin main`);

    // stash 복원
    try { run(`git stash pop`); } catch { /* 없으면 무시 */ }

    // 백업 파일만 다시 스테이징
    run(`git add backups/ db_dump.sql`);
    run(`git commit -m "chore: DB 백업 ${date}"`);
    run(`git push origin main`);
    console.log(`🚀 GitHub 푸시 완료`);
  }

  console.log("✅ 백업 완료\n");
}

// 직접 실행 시
backupDb().catch((err) => {
  console.error("❌ 백업 실패:", err.message);
  process.exit(1);
});
