import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const schema = "prisma/schema.prisma";

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = line.match(/^DATABASE_URL=["']?([^"']+)["']?$/);
    if (match && !process.env.DATABASE_URL) {
      process.env.DATABASE_URL = match[1];
    }
  }
}

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

function sqlitePathFromUrl(url) {
  if (!url.startsWith("file:")) {
    throw new Error("db:push fallback only supports SQLite file URLs.");
  }

  const rawPath = url.slice("file:".length);
  if (path.isAbsolute(rawPath)) return rawPath;
  return path.resolve("prisma", rawPath);
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
    env: { ...process.env, ...options.env },
    input: options.input,
  });
}

try {
  run("npx", ["prisma", "db", "push"], { stdio: "inherit" });
} catch {
  const dbPath = sqlitePathFromUrl(databaseUrl);
  const fromArgs = existsSync(dbPath)
    ? ["--from-url", `file:${dbPath}`]
    : ["--from-empty"];

  const sql = run("npx", [
    "prisma",
    "migrate",
    "diff",
    ...fromArgs,
    "--to-schema-datamodel",
    schema,
    "--script",
  ]);

  if (!sql.includes("This is an empty migration")) {
    run("sqlite3", [dbPath], { input: sql });
  }

  run("npx", ["prisma", "generate"], { stdio: "inherit" });
}
