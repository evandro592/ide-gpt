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
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
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
