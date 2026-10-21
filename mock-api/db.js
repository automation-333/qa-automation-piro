// Подключение к SQLite (встроенный модуль node:sqlite, Node 22.13+).
// Путь можно переопределить через DB_PATH.
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'leads.db');

function openDb({ readOnly = false } = {}) {
  const db = new DatabaseSync(DB_PATH, { readOnly });
  if (!readOnly) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL DEFAULT '',
        contact    TEXT    NOT NULL,
        task       TEXT    NOT NULL DEFAULT '',
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }
  return db;
}

module.exports = { openDb, DB_PATH };
