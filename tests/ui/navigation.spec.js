const { test, expect } = require('@playwright/test');
const { HomePage } = require('../../pages/HomePage');

// Пункты основного меню и ожидаемый адрес страницы
const menu = [
  ['Направления', /\/services\/?$/],
  ['Кейсы', /\/cases\/?$/],
  ['Цены', /\/prices\/?$/],
  ['Как работаем', /\/process\/?$/],
  ['Контакты', /\/contact\/?$/],
];

test.describe('Навигация', () => {
  test('главная открывается, заголовок вкладки корректный', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await expect(page).toHaveTitle(/Piro/);
    await expect(home.heroTitle).toBeVisible();
  });

  for (const [name, url] of menu) {
    test(`пункт меню «${name}» ведёт на свою страницу`, async ({ page }) => {
      const home = new HomePage(page);
      await home.open();
      await home.navLink(name).click();
      await expect(page).toHaveURL(url);
      await expect(page.locator('h1')).toBeVisible();
    });
  }

  test('кнопка «Описать задачу» прокручивает к брифу', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await home.header.getByRole('link', { name: 'Описать задачу' }).first().click();
    await expect(page).toHaveURL(/#brief$/);
    await expect(home.section('brief')).toBeInViewport();
  });
});
