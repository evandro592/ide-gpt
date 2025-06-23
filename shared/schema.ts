<<<<<<< HEAD
import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content"),
  isDirectory: boolean("is_directory").notNull().default(false),
  parentId: integer("parent_id"),
  size: integer("size").default(0),
  lastModified: text("last_modified"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
  metadata: jsonb("metadata"),
});

export const projectSettings = pgTable("project_settings", {
  id: serial("id").primaryKey(),
  theme: text("theme").notNull().default("dark"),
  fontSize: integer("font_size").notNull().default(14),
  autoSave: boolean("auto_save").notNull().default(true),
  language: text("language").notNull().default("pt"),
  settings: jsonb("settings"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
=======
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de sessões (obrigatória para autenticação)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Tabela de usuários
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de projetos
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  path: varchar("path", { length: 500 }).notNull(),
  userId: varchar("user_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  language: varchar("language", { length: 50 }).default("javascript"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de arquivos
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  content: text("content"),
  projectId: serial("project_id").references(() => projects.id),
  type: varchar("type", { length: 50 }).default("file"), // file, folder
  language: varchar("language", { length: 50 }),
  size: serial("size").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Esquemas de inserção
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
>>>>>>> 796ea9e3a6d38e397dfb71035ce80b292c042103
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
<<<<<<< HEAD
  lastModified: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertProjectSettingsSchema = createInsertSchema(projectSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertProjectSettings = z.infer<typeof insertProjectSettingsSchema>;
export type ProjectSettings = typeof projectSettings.$inferSelect;
=======
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// Tipos
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
>>>>>>> 796ea9e3a6d38e397dfb71035ce80b292c042103
