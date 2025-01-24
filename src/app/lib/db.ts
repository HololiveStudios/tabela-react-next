// app/lib/db.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Database } from 'sqlite';

let db: Database | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: './data/data.db',
      driver: sqlite3.Database
    });
  }
  return db;
}