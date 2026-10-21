const { test, expect } = require('@playwright/test');
const { HomePage } = require('../../pages/HomePage');

// Тексты сообщений формы на сайте
const MSG = {
  needUrl: 'Вставьте ссылку на сайт или Instagram.',
  needContact: 'Оставьте контакт, чтобы я мог ответить.',
  sent: 'Заявка ушла. Отвечу в ближайшее время.',
  sendError: 'Не получилось отправить. Напишите напрямую в Telegram: @DMD_user.',
};

test.describe('Форма заявки «Бесплатный разбор»', () => {
  let home;
  let requests;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    // перехват ставим ДО открытия страницы: реальные заявки не уходят
    requests = await home.mockLeadApi();
    await home.open();
    await home.auditForm.scrollIntoViewIfNeeded();
  });

  test('пустая форма: просит ссылку, запрос не отправляется', async () => {
    await home.submit();
    await expect(home.formMessage).toHaveText(MSG.needUrl);
    await expect(home.urlInput).toBeFocused();
    expect(requests).toHaveLength(0);
  });

  test('без контакта: просит контакт, запрос не отправляется', async () => {
    await home.fillAuditForm({ url: 'https://example.com' });
    await home.submit();
    await expect(home.formMessage).toHaveText(MSG.needContact);
    await expect(home.contactInput).toBeFocused();
    expect(requests).toHaveLength(0);
  });

  test('успешная отправка: правильные данные и сообщение об успехе', async () => {
    await home.fillAuditForm({ url: 'https://example.com', name: 'QA Тест', contact: '@qa_test' });
    await home.submit();

    await expect(home.formMessage).toHaveText(MSG.sent);
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      kind: 'audit',
      url: 'https://example.com',
      name: 'QA Тест',
      contact: '@qa_test',
    });
    // после успеха форма очищается
    await expect(home.contactInput).toHaveValue('');
  });

  test('ошибка сервера: показывает сообщение об ошибке', async ({ page }) => {
    await page.unroute('**/.netlify/functions/lead');
    await home.mockLeadApi({ status: 500, body: { error: 'fail' } });

    await home.fillAuditForm({ url: 'https://example.com', contact: '@qa_test' });
    await home.submit();
    await expect(home.formMessage).toHaveText(MSG.sendError);
  });
});
