// Mock-сервис заявок: POST /leads и GET /leads/:id. Хранит данные в SQLite.
const express = require('express');
const { openDb } = require('./db');

const db = openDb();
const app = express();
app.use(express.json());

const isStr = (v) => typeof v === 'string';

// Проверка тела заявки. Возвращает текст ошибки или null.
function validate(body) {
  const { name = '', contact, task = '' } = body || {};
  if (!isStr(contact) || !contact.trim()) return 'contact is required';
  if (contact.length > 100) return 'contact is too long';
  if (!isStr(name) || name.length > 100) return 'name must be a string up to 100 chars';
  if (!isStr(task) || task.length > 1000) return 'task must be a string up to 1000 chars';
  return null;
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/leads', (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });

  const { name = '', contact, task = '' } = req.body;
  const { lastInsertRowid } = db
    .prepare('INSERT INTO leads (name, contact, task) VALUES (?, ?, ?)')
    .run(name.trim(), contact.trim(), task.trim());

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(lastInsertRowid);
  res.status(201).json(lead);
});

app.get('/leads/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'id must be a positive integer' });

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  if (!lead) return res.status(404).json({ error: 'lead not found' });
  res.json(lead);
});

// Битый JSON в теле запроса -> 400 вместо 500
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid JSON' });
  res.status(500).json({ error: 'internal error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mock API: http://localhost:${PORT}`));
