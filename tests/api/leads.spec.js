const { test, expect } = require('@playwright/test');
const { openDb } = require('../../mock-api/db');

// Прямое чтение из SQLite - проверяем, что API действительно сохранило данные.
// Базу открываем в beforeAll: к этому моменту mock-сервер уже создал файл.
let db;
const countLeads = () => db.prepare('SELECT COUNT(*) AS n FROM leads').get().n;

test.beforeAll(() => { db = openDb({ readOnly: true }); });
test.afterAll(() => db.close());

test.describe('POST /leads', () => {
  test('создаёт заявку и сохраняет её в базе', async ({ request }) => {
    const lead = { name: 'Анна', contact: '@anna', task: 'Нужен лендинг' };
    const res = await request.post('/leads', { data: lead });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject(lead);
    expect(body.id).toEqual(expect.any(Number));

    // SQL-проверка: запись есть и совпадает с отправленной
    const row = db.prepare('SELECT name, contact, task FROM leads WHERE id = ?').get(body.id);
    expect(row).toEqual(lead);
  });

  test('обрезает пробелы, необязательные поля по умолчанию пустые', async ({ request }) => {
    const res = await request.post('/leads', { data: { contact: '  test@mail.ru  ' } });
    expect(res.status()).toBe(201);

    const row = db.prepare('SELECT * FROM leads WHERE id = ?').get((await res.json()).id);
    expect(row).toMatchObject({ contact: 'test@mail.ru', name: '', task: '' });
  });

  const invalid = [
    ['без contact', { name: 'Анна' }],
    ['пустой contact', { contact: '   ' }],
    ['contact не строка', { contact: 12345 }],
    ['слишком длинный contact', { contact: 'a'.repeat(101) }],
    ['name не строка', { contact: '@anna', name: ['x'] }],
  ];

  for (const [title, data] of invalid) {
    test(`400 и ничего не пишет в базу: ${title}`, async ({ request }) => {
      const before = countLeads();
      const res = await request.post('/leads', { data });

      expect(res.status()).toBe(400);
      expect(await res.json()).toHaveProperty('error');
      expect(countLeads()).toBe(before);
    });
  }

  test('400 на битый JSON', async ({ request }) => {
    const res = await request.post('/leads', {
      headers: { 'content-type': 'application/json' },
      data: '{"contact": ',
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('GET /leads/:id', () => {
  test('возвращает созданную заявку', async ({ request }) => {
    const created = await (await request.post('/leads', { data: { contact: '+79990000000' } })).json();

    const res = await request.get(`/leads/${created.id}`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(created);
  });

  test('404 для несуществующего id', async ({ request }) => {
    const res = await request.get('/leads/999999999');
    expect(res.status()).toBe(404);
  });

  test('400 для некорректного id', async ({ request }) => {
    const res = await request.get('/leads/abc');
    expect(res.status()).toBe(400);
  });
});
