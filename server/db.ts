import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as schema from "../shared/schema.js";

let db: any;

if (process.env.DATABASE_URL) {
  // Usar Neon em produção
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql);
} else {
  // Usar SQLite local para desenvolvimento
  const sqlite = new Database("ide-local.db");
  db = drizzleSqlite(sqlite, { schema });

  // Criar tabelas se não existirem
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      path TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'javascript',
      user_id TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      content TEXT,
      type TEXT NOT NULL DEFAULT 'file',
      language TEXT,
      size INTEGER DEFAULT 0,
      project_id INTEGER NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );
  `);
}

export { db };