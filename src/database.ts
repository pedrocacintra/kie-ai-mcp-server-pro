import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { TaskRecord } from './types.js';

export class TaskDatabase {
  private db: sqlite3.Database;
  
  constructor(dbPath: string = './tasks.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    
    await run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT UNIQUE NOT NULL,
        api_type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        result_url TEXT,
        error_message TEXT
      )
    `);

    await run(`
      CREATE INDEX IF NOT EXISTS idx_task_id ON tasks(task_id);
    `);

    await run(`
      CREATE INDEX IF NOT EXISTS idx_status ON tasks(status);
    `);
  }

  async createTask(taskData: Omit<TaskRecord, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    
    await run(
      `INSERT INTO tasks (task_id, api_type, status, result_url, error_message) 
       VALUES (?, ?, ?, ?, ?)`,
      [taskData.task_id, taskData.api_type, taskData.status, taskData.result_url, taskData.error_message]
    );
  }

  async getTask(taskId: string): Promise<TaskRecord | null> {
    const get = promisify(this.db.get.bind(this.db));
    
    const result = await get(
      `SELECT * FROM tasks WHERE task_id = ?`,
      [taskId]
    ) as TaskRecord | undefined;

    return result || null;
  }

  async updateTask(taskId: string, updates: Partial<TaskRecord>): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.status) {
      updateFields.push('status = ?');
      values.push(updates.status);
    }
    
    if (updates.result_url) {
      updateFields.push('result_url = ?');
      values.push(updates.result_url);
    }
    
    if (updates.error_message) {
      updateFields.push('error_message = ?');
      values.push(updates.error_message);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(taskId);
    
    if (updateFields.length > 1) { // More than just updated_at
      await run(
        `UPDATE tasks SET ${updateFields.join(', ')} WHERE task_id = ?`,
        values
      );
    }
  }

  async getAllTasks(limit: number = 100): Promise<TaskRecord[]> {
    const all = promisify(this.db.all.bind(this.db));
    
    const results = await all(
      `SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?`,
      [limit]
    ) as TaskRecord[];

    return results;
  }

  async getTasksByStatus(status: string, limit: number = 50): Promise<TaskRecord[]> {
    const all = promisify(this.db.all.bind(this.db));
    
    const results = await all(
      `SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC LIMIT ?`,
      [status, limit]
    ) as TaskRecord[];

    return results;
  }

  async close(): Promise<void> {
    const close = promisify(this.db.close.bind(this.db));
    await close();
  }
}