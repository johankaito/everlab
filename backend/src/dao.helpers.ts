import sqlite3 from 'sqlite3';
import { SQLiteHelper } from './sqlite.helpers';

export class DAO<T> {
  private db: sqlite3.Database;
  private tableName: string;
  private dbPath = './data/everlab.db';

  constructor(tableName: string) {
    this.db = new sqlite3.Database(this.dbPath);
    this.tableName = tableName;
    this.initDatabase();
  }

  private initDatabase() {
    return SQLiteHelper.initDatabase(this.db, this.tableName);
  }

  async insertData(data: T): Promise<void> {
    return SQLiteHelper.insertData<T>(this.db, data, this.tableName);
  }

  async insertBulk(data: T[]): Promise<void> {
    return data.forEach(d => SQLiteHelper.insertData<T>(this.db, d, this.tableName));
  }

  async getData(): Promise<T[]> {
    return SQLiteHelper.getData(this.db, this.tableName);
  }
}
