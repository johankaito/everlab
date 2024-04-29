import sqlite3 from 'sqlite3';

interface MyData {
  id: number;
  data: string; // This could be any JSON structure
}

export class SQLiteHelper {
  static initDatabase(db: sqlite3.Database, tableName: string) {
    db.run(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id INTEGER PRIMARY KEY,
        data TEXT
      )
    `);
  }

  static async insertData<T>(
    db: sqlite3.Database,
    data: T,
    tableName: string,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT INTO ${tableName} (data) VALUES (?)`,
        JSON.stringify(data),
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  static async getData<T>(
    db: sqlite3.Database,
    tableName: string,
  ): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      db.all<MyData>(`SELECT * FROM ${tableName}`, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map((row) => JSON.parse(row.data) as T));
        }
      });
    });
  }

  static async clearData<T>(
    db: sqlite3.Database,
    tableName: string,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      db.run(`DELETE FROM ${tableName}`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
