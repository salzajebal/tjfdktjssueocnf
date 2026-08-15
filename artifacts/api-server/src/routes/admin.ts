import { Router } from "express";
import { db, applicationsTable, telegramSettingsTable } from "@workspace/db";
import { eq, desc, count, sql, and, gte } from "drizzle-orm";
import {
  AdminLoginBody,
  GetAdminApplicationsQueryParams,
  DeleteApplicationParams,
  UpdateTelegramSettingsBody,
  DiscoverTelegramChatsBody,
} from "@workspace/api-zod";
import { discoverChats, sendTelegramNotification, getTelegramConfig } from "../lib/telegram";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "355jako00!";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "daechuldream-admin-token-2024";

function requireAdmin(req: import("express").Request, res: import("express").Response): boolean {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  res.json({ success: true, token: ADMIN_TOKEN });
});

router.get("/admin/applications", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const paramsParsed = GetAdminApplicationsQueryParams.safeParse({
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
    job_type: req.query.job_type,
  });

  const page = paramsParsed.success ? (paramsParsed.data.page ?? 1) : 1;
  const limit = paramsParsed.success ? (paramsParsed.data.limit ?? 20) : 20;
  const jobType = paramsParsed.success ? paramsParsed.data.job_type : undefined;

  const offset = (page - 1) * limit;

  const whereClause = jobType ? eq(applicationsTable.job_type, jobType) : undefined;

  const [apps, totalResult] = await Promise.all([
    db.select()
      .from(applicationsTable)
      .where(whereClause)
      .orderBy(desc(applicationsTable.created_at))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() })
      .from(applicationsTable)
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;

  res.json({
    applications: apps.map((app) => ({
      ...app,
      created_at: app.created_at.toISOString(),
    })),
    total,
    page,
    limit,
  });
});

router.delete("/admin/applications/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const parsed = DeleteApplicationParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const deleted = await db.delete(applicationsTable)
    .where(eq(applicationsTable.id, parsed.data.id))
    .returning();

  if (deleted.length === 0) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json({ success: true });
});

router.get("/admin/stats", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalResult, todayResult, byJobType, recent] = await Promise.all([
    db.select({ count: count() }).from(applicationsTable),
    db.select({ count: count() })
      .from(applicationsTable)
      .where(gte(applicationsTable.created_at, todayStart)),
    db.select({ job_type: applicationsTable.job_type, count: count() })
      .from(applicationsTable)
      .groupBy(applicationsTable.job_type),
    db.select().from(applicationsTable).orderBy(desc(applicationsTable.created_at)).limit(5),
  ]);

  res.json({
    total: totalResult[0]?.count ?? 0,
    today: todayResult[0]?.count ?? 0,
    by_job_type: byJobType.map((r) => ({ job_type: r.job_type, count: r.count })),
    recent: recent.map((app) => ({ ...app, created_at: app.created_at.toISOString() })),
  });
});

router.get("/admin/telegram", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const settings = await getTelegramConfig();
  if (!settings) {
    res.json({ enabled: false, bot_token: null, chat_id: null, chat_name: null });
    return;
  }

  res.json({
    enabled: settings.enabled,
    bot_token: settings.bot_token ?? null,
    chat_id: settings.chat_id ?? null,
    chat_name: settings.chat_name ?? null,
  });
});

router.put("/admin/telegram", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const parsed = UpdateTelegramSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { enabled, bot_token, chat_id, chat_name } = parsed.data;

  const existing = await getTelegramConfig();
  let result;

  if (existing) {
    const [updated] = await db.update(telegramSettingsTable)
      .set({
        enabled,
        bot_token: bot_token ?? existing.bot_token,
        chat_id: chat_id ?? existing.chat_id,
        chat_name: chat_name ?? existing.chat_name,
        updated_at: new Date(),
      })
      .where(eq(telegramSettingsTable.id, existing.id))
      .returning();
    result = updated;
  } else {
    const [created] = await db.insert(telegramSettingsTable)
      .values({
        enabled,
        bot_token: bot_token ?? null,
        chat_id: chat_id ?? null,
        chat_name: chat_name ?? null,
      })
      .returning();
    result = created;
  }

  res.json({
    enabled: result.enabled,
    bot_token: result.bot_token ?? null,
    chat_id: result.chat_id ?? null,
    chat_name: result.chat_name ?? null,
  });
});

router.post("/admin/telegram/discover", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const parsed = DiscoverTelegramChatsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    const chats = await discoverChats(parsed.data.bot_token);
    res.json({ chats });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message, chats: [] });
  }
});

router.post("/admin/telegram/test", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const settings = await getTelegramConfig();
  if (!settings || !settings.enabled || !settings.bot_token || !settings.chat_id) {
    res.status(400).json({ success: false, message: "Telegram이 설정되지 않았습니다." });
    return;
  }

  try {
    const fakeApp = {
      id: 0,
      name: "테스트",
      phone: "010-0000-0000",
      job_type: "직장인",
      loan_amount: "1,000만원",
      loan_purpose: "생활비",
      residence_type: null,
      annual_income: null,
      credit_score: null,
      message: "이것은 테스트 알림입니다.",
      status: "pending",
      created_at: new Date(),
    };
    await sendTelegramNotification(fakeApp);
    res.json({ success: true, message: "테스트 알림이 전송되었습니다." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ success: false, message });
  }
});

// ── DB 백업 엔드포인트 ────────────────────────────────────────
router.post("/admin/backup", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const databaseUrl = process.env.DATABASE_URL;
  const gitToken = process.env.GIT_TOKEN;

  if (!databaseUrl || !gitToken) {
    res.status(500).json({ error: "DATABASE_URL 또는 GIT_TOKEN 환경변수 없음" });
    return;
  }

  const ROOT = path.resolve(import.meta.dirname, "../../..");
  const date = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date()).replace(/\. /g, "-").replace(".", "");

  const backupsDir = path.join(ROOT, "backups");
  const dumpFile = path.join(backupsDir, `db_dump_${date}.sql`);
  const latestFile = path.join(ROOT, "db_dump.sql");

  function run(cmd: string, opts?: { redact?: string }) {
    const display = opts?.redact ? cmd.replace(opts.redact, "***") : cmd;
    console.log(`▶ ${display}`);
    return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: "pipe" });
  }

  try {
    fs.mkdirSync(backupsDir, { recursive: true });

    // 1. pg_dump (프로덕션 DATABASE_URL 사용)
    run(`pg_dump "${databaseUrl}" --no-owner --no-acl --if-exists --clean -f "${dumpFile}"`,
      { redact: databaseUrl });
    fs.copyFileSync(dumpFile, latestFile);

    // 2. 30일 이상 된 백업 삭제
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const file of fs.readdirSync(backupsDir)) {
      const fp = path.join(backupsDir, file);
      if (fs.statSync(fp).mtimeMs < cutoff) fs.unlinkSync(fp);
    }

    // 3. GitHub 푸시
    const repoUrl = `https://salzajebal:${gitToken}@github.com/salzajebal/tjfdktjssueocnf.git`;
    run(`git config user.name "backup-bot"`);
    run(`git config user.email "backup@replit"`);
    run(`git remote set-url origin "${repoUrl}"`, { redact: gitToken });
    run(`git add backups/ db_dump.sql`);

    try {
      run(`git diff --staged --quiet`);
      res.json({ success: true, message: `변경사항 없음 (${date})` });
      return;
    } catch {
      try { run(`git stash --include-untracked`); } catch { /* 없으면 무시 */ }
      run(`git pull --rebase origin main`);
      try { run(`git stash pop`); } catch { /* 없으면 무시 */ }
      run(`git add backups/ db_dump.sql`);
      run(`git commit -m "chore: 프로덕션 DB 백업 ${date}"`);
      run(`git push origin main`);
    }

    console.log(`✅ 백업 완료: ${date}`);
    res.json({ success: true, message: `백업 완료 (${date})`, file: `backups/db_dump_${date}.sql` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ 백업 실패:", message);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
