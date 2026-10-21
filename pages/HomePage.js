// Page Object главной страницы piro-portfolio.netlify.app
const LEAD_API = '**/.netlify/functions/lead';

class HomePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.header = page.locator('header.hd');
    this.nav = page.locator('#site-nav');
    this.menuButton = page.locator('.menu-btn');
    this.heroTitle = page.locator('#hero-title');
    this.footer = page.locator('footer.ft');

    // форма "Бесплатный разбор" (секция #audit)
    const form = page.locator('#audit form');
    this.auditForm = form;
    this.urlInput = form.getByLabel('Ссылка на сайт или Instagram');
    this.nameInput = form.getByLabel('Как к вам обращаться');
    this.contactInput = form.getByLabel('Telegram, почта или телефон');
    this.submitButton = form.getByRole('button', { name: /Получить разбор/ });
    this.formMessage = page.locator('#audit-msg');
  }

  async open() {
    await this.page.goto('/');
    await this.heroTitle.waitFor();
  }

  /** Ссылка основного меню по тексту */
  navLink(name) {
    return this.nav.getByRole('link', { name, exact: true });
  }

  /** Секция страницы по id (directions, cases, packages, audit, brief, faq) */
  section(id) {
    return this.page.locator(`section#${id}`);
  }

  /**
   * Перехват отправки заявки: реальный запрос не уходит.
   * Возвращает массив, куда складываются тела перехваченных запросов.
   */
  async mockLeadApi({ status = 200, body = { ok: true } } = {}) {
    const requests = [];
    await this.page.route(LEAD_API, async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ status, json: body });
    });
    return requests;
  }

  async fillAuditForm({ url = '', name = '', contact = '' }) {
    await this.urlInput.fill(url);
    await this.nameInput.fill(name);
    await this.contactInput.fill(contact);
  }

  async submit() {
    await this.submitButton.click();
  }
}

module.exports = { HomePage };
