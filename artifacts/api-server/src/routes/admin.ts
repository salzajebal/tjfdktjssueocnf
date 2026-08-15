import { Router } from "express";
import { db, applicationsTable, telegramSettingsTable, siteSettingsTable } from "@workspace/db";
import { eq, desc, count, sql, and, gte } from "drizzle-orm";
import {
  AdminLoginBody,
  GetAdminApplicationsQueryParams,
  DeleteApplicationParams,
  UpdateTelegramSettingsBody,
  DiscoverTelegramChatsBody,
} from "@workspace/api-zod";
import { discoverChats, sendTelegramNotification, getTelegramConfig } from "../lib/telegram";

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
// 프로덕션 DB의 모든 데이터를 SQL INSERT 형식으로 반환합니다.
// git 푸시는 백업 cron(개발 환경)이 담당합니다.
router.get("/admin/backup/dump", async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const [applications, siteSettings, telegramSettings] = await Promise.all([
      db.select().from(applicationsTable).orderBy(applicationsTable.id),
      db.select().from(siteSettingsTable),
      db.select().from(telegramSettingsTable),
    ]);

    const esc = (v: unknown): string => {
      if (v === null || v === undefined) return "NULL";
      if (v instanceof Date) return `'${v.toISOString()}'`;
      if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
      if (typeof v === "number") return String(v);
      return `'${String(v).replace(/'/g, "''")}'`;
    };

    const lines: string[] = [
      "-- ============================================================",
      `-- 프라임브릿지 프로덕션 DB 덤프`,
      `-- 생성: ${new Date().toISOString()}`,
      "-- ============================================================",
      "",
      "-- ── applications ──────────────────────────────────────────",
      "TRUNCATE TABLE applications RESTART IDENTITY CASCADE;",
    ];

    for (const row of applications) {
      lines.push(
        `INSERT INTO applications (id, name, phone, job_type, loan_amount, loan_purpose, residence_type, annual_income, credit_score, message, status, created_at) VALUES (${[
          row.id, row.name, row.phone, row.job_type, row.loan_amount,
          row.loan_purpose, row.residence_type, row.annual_income,
          row.credit_score, row.message, row.status, row.created_at,
        ].map(esc).join(", ")});`
      );
    }

    if (applications.length > 0) {
      const maxId = Math.max(...applications.map(a => a.id));
      lines.push(`SELECT setval('applications_id_seq', ${maxId});`);
    }

    lines.push("", "-- ── site_settings ─────────────────────────────────────────");
    lines.push("TRUNCATE TABLE site_settings RESTART IDENTITY CASCADE;");
    for (const row of siteSettings) {
      lines.push(
        `INSERT INTO site_settings (id, kakao_link, updated_at) VALUES (${[
          row.id, row.kakao_link, row.updated_at,
        ].map(esc).join(", ")});`
      );
    }

    lines.push("", "-- ── telegram_settings ──────────────────────────────────────");
    lines.push("TRUNCATE TABLE telegram_settings RESTART IDENTITY CASCADE;");
    for (const row of telegramSettings) {
      lines.push(
        `INSERT INTO telegram_settings (id, enabled, bot_token, chat_id, chat_name, updated_at) VALUES (${[
          row.id, row.enabled, row.bot_token, row.chat_id, row.chat_name, row.updated_at,
        ].map(esc).join(", ")});`
      );
    }

    lines.push("");
    const sql = lines.join("\n");

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(sql);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ 덤프 생성 실패:", message);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
