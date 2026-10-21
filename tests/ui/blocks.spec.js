const { test, expect } = require('@playwright/test');
const { HomePage } = require('../../pages/HomePage');

// Ключевые блоки главной: id секции -> заголовок
const blocks = [
  ['directions', 'Что берём на себя'],
  ['cases', 'Работы'],
  ['packages', 'Пакеты'],
  ['audit', 'Бесплатный разбор'],
  ['brief', 'Опишите задачу своими словами'],
  ['faq', 'Частые вопросы'],
];

test.describe('Ключевые блоки главной', () => {
  let home;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.open();
  });

  for (const [id, title] of blocks) {
    test(`блок «${title}» есть на странице`, async () => {
      const section = home.section(id);
      await section.scrollIntoViewIfNeeded();
      await expect(section.getByRole('heading', { level: 2 })).toHaveText(title);
    });
  }

  test('в кейсах есть карточки со ссылками', async () => {
    const caseLinks = home.section('cases').locator('a[href^="/cases/"]');
    expect(await caseLinks.count()).toBeGreaterThanOrEqual(3);
  });

  test('в подвале есть контакты: Telegram, почта, GitHub', async () => {
    for (const name of ['Telegram', 'Почта', 'GitHub']) {
      await expect(home.footer.getByRole('link', { name, exact: true })).toBeVisible();
    }
  });
});
