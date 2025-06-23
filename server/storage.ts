import {
  projects,
  files,
  users,
  type Project,
  type InsertProject,
  type File,
  type InsertFile,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Interface para operações de armazenamento
export interface IStorage {
  // Operações de usuário (obrigatórias para autenticação)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Operações de projeto
  getProjects(userId?: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Operações de arquivo
  getFiles(projectId: number): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  getFileByPath(projectId: number, path: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Operações de usuário
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Operações de projeto
  async getProjects(userId?: string): Promise<Project[]> {
    if (userId) {
      return await db.select().from(projects).where(eq(projects.userId, userId));
    }
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  // Operações de arquivo
  async getFiles(projectId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.projectId, projectId));
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async getFileByPath(projectId: number, path: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.projectId, projectId), eq(files.path, path)));
    return file;
  }

  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db
      .insert(files)
      .values(file)
      .returning();
    return newFile;
  }

  async updateFile(id: number, file: Partial<InsertFile>): Promise<File | undefined> {
    const [updatedFile] = await db
      .update(files)
      .set({ ...file, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();