# qa-automation-piro

> Учебный пет-проект по QA-автоматизации. Цель — показать базовые навыки: UI- и API-тесты на Playwright, Page Object, работа с SQL, Docker и CI.

[![tests](https://github.com/automation-333/qa-automation-piro/actions/workflows/tests.yml/badge.svg)](https://github.com/automation-333/qa-automation-piro/actions/workflows/tests.yml)

**Стек:** Playwright Test, JavaScript, Express, SQLite, Docker, GitHub Actions.

## Что тестируется

**UI** — сайт [piro-portfolio.netlify.app](https://piro-portfolio.netlify.app):
- навигация по меню;
- ключевые блоки главной (направления, кейсы, пакеты, FAQ, подвал);
- адаптив на ширине 375px (нет горизонтального скролла, мобильное меню);
- форма заявки: валидация и успешная отправка.

Запросы формы перехватываются через `page.route` — реальные заявки **не отправляются**.

**API** — маленький mock-сервис на Express + SQLite (`mock-api/`):
- `POST /leads` — создать заявку;
- `GET /leads/:id` — получить заявку.

Позитивные и негативные проверки + сверка данных в базе SQL-запросом.

Полный список кейсов: [docs/checklist.md](docs/checklist.md).

## Структура

```
pages/          Page Object главной страницы
tests/ui/       UI-тесты (desktop + mobile 375px)
tests/api/      API-тесты
mock-api/       mock-сервис (Express + SQLite)
docs/           чек-лист тест-кейсов
```

## Как запустить

**Локально** (нужен Node.js 22.13+, SQLite встроен в Node — `node:sqlite`):

```bash
npm install
npx playwright install chromium
npm test
```

Mock-API поднимается автоматически. Отдельно: `npm run test:ui`, `npm run test:api`. Отчёт: `npm run report`.

**В Docker** (одной командой):

```bash
docker build -t qa-piro . && docker run --rm -v "$PWD/playwright-report:/app/playwright-report" qa-piro
```

**CI:** GitHub Actions запускает тесты на каждый push, HTML-отчёт лежит в артефактах прогона (`playwright-report`).
