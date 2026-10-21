// Запускается в проекте "mobile" (ширина 375px)
const { test, expect } = require('@playwright/test');
const { HomePage } = require('../../pages/HomePage');

test.describe('Адаптив 375px', () => {
  let home;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.open();
  });

  test('нет горизонтальной прокрутки', async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('меню открывается по кнопке «Меню»', async () => {
    await expect(home.menuButton).toBeVisible();
    await expect(home.navLink('Кейсы')).toBeHidden();

    await home.menuButton.click();
    await expect(home.menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(home.navLink('Кейсы')).toBeVisible();
  });

  test('форма заявки помещается в экран по ширине', async ({ page }) => {
    await home.auditForm.scrollIntoViewIfNeeded();
    const box = await home.auditForm.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
  });
});
