# Официальный образ Playwright: Node.js + браузеры уже внутри.
# Версия образа совпадает с версией @playwright/test в package.json.
FROM mcr.microsoft.com/playwright:v1.64.1-noble

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# по умолчанию гоняем все тесты (UI + API)
CMD ["npx", "playwright", "test"]
