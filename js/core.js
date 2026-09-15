/* Ai крафт — core */
const AC = {
  KEYS: {
    users: 'aicraft_users',
    session: 'aicraft_session',
    settings: 'aicraft_settings',
    links: 'aicraft_links',
    identity: 'aicraft_identity'
  },
  defaultSettings: { theme: 'dark', accent: '#8b5cf6' },
  getUsers() { try { return JSON.parse(localStorage.getItem(this.KEYS.users) || '{}'); } catch { return {}; } },
  saveUsers(u) { localStorage.setItem(this.KEYS.users, JSON.stringify(u)); },
  getSession() { try { return JSON.parse(localStorage.getItem(this.KEYS.session) || 'null'); } catch { return null; } },
  setSession(s) { localStorage.setItem(this.KEYS.session, JSON.stringify(s)); },
  clearSession() { localStorage.removeItem(this.KEYS.session); },
  getIdentity() { try { return JSON.parse(localStorage.getItem(this.KEYS.identity) || 'null'); } catch { return null; } },
  setIdentity(id) { localStorage.setItem(this.KEYS.identity, JSON.stringify(id)); },
  enterWithPhoto({ name, photoDataUrl }) {
    const login = (name || 'Гость').trim().slice(0, 32) || 'Гость';
    const key = 'photo_' + login.toLowerCase().replace(/\s+/g, '_');
    const users = this.getUsers();
    if (!users[key]) users[key] = { password: null, photoAuth: true, sites: [], name: login, photo: photoDataUrl || null };
    else { users[key].photo = photoDataUrl || users[key].photo; users[key].name = login; }
    this.saveUsers(users);
    this.setIdentity({ name: login, photo: photoDataUrl || null, at: Date.now() });
    this.setSession({ login: key, name: login, photoAuth: true });
    return this.getSession();
  },
  requireAuth(redirect = '../index.html') {
    const s = this.getSession();
    if (!s) { location.href = redirect; return null; }
    return s;
  },
  getSettings() {
    try { return { ...this.defaultSettings, ...JSON.parse(localStorage.getItem(this.KEYS.settings) || '{}') }; }
    catch { return { ...this.defaultSettings }; }
  },
  saveSettings(partial) {
    const next = { ...this.getSettings(), ...partial };
    localStorage.setItem(this.KEYS.settings, JSON.stringify(next));
    this.applyTheme(next);
    return next;
  },
  applyTheme(settings) {
    const s = settings || this.getSettings();
    document.documentElement.setAttribute('data-theme', s.theme || 'dark');
    document.documentElement.style.setProperty('--accent', s.accent || '#8b5cf6');
  },
  getUserSites(login) { return this.getUsers()[login]?.sites || []; },
  saveUserSites(login, sites) {
    const users = this.getUsers();
    if (!users[login]) users[login] = { sites: [], photoAuth: true };
    users[login].sites = sites;
    this.saveUsers(users);
  },
  createSite(login, data) {
    const sites = this.getUserSites(login);
    const id = 'site_' + Date.now();
    const site = {
      id, name: data.name || 'Новый сайт', subdomain: data.subdomain,
      domain: data.domain || 'ai_craft.ru', customDomain: data.customDomain || '',
      description: data.description || '', createdAt: new Date().toISOString(),
      files: data.files || {}, published: !!data.published
    };
    sites.unshift(site);
    this.saveUserSites(login, sites);
    return site;
  },
  updateSite(login, id, patch) {
    const sites = this.getUserSites(login).map(s => s.id === id ? { ...s, ...patch } : s);
    this.saveUserSites(login, sites);
    return sites.find(s => s.id === id);
  },
  deleteSite(login, id) { this.saveUserSites(login, this.getUserSites(login).filter(s => s.id !== id)); },
  getLinks(login) {
    try { const all = JSON.parse(localStorage.getItem(this.KEYS.links) || '{}'); return all[login] || []; }
    catch { return []; }
  },
  saveLinks(login, links) {
    const all = JSON.parse(localStorage.getItem(this.KEYS.links) || '{}');
    all[login] = links;
    localStorage.setItem(this.KEYS.links, JSON.stringify(all));
  },
  createLink(login, { title, url, slug }) {
    const links = this.getLinks(login);
    const short = (slug || Math.random().toString(36).slice(2, 8)).toLowerCase().replace(/[^a-z0-9-]/g, '');
    const item = { id: 'link_' + Date.now(), title: title || short, url, slug: short, shortUrl: 'aicraft.link/' + short, clicks: 0, createdAt: new Date().toISOString() };
    links.unshift(item);
    this.saveLinks(login, links);
    return item;
  },
  deleteLink(login, id) { this.saveLinks(login, this.getLinks(login).filter(l => l.id !== id)); },
  escapeHtml(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2200);
  },
  imageUrl(prompt, opts) {
    opts = opts || {};
    const w = opts.width || 768, h = opts.height || 512;
    const seed = opts.seed || Math.floor(Math.random() * 1e9);
    const q = encodeURIComponent(String(prompt).slice(0, 300));
    return 'https://image.pollinations.ai/prompt/' + q + '?width=' + w + '&height=' + h + '&seed=' + seed + '&nologo=true';
  },
  parseIdea(description) {
    const d = (description || '').toLowerCase();
    const sections = [];
    const add = (id, title) => { if (!sections.find(s => s.id === id)) sections.push({ id, title }); };
    add('hero', 'Главная');
    if (/о нас|о проекте|о компании|история|about/i.test(d)) add('about', 'О нас');
    if (/услуг|service|что делаем|предлаг/i.test(d)) add('services', 'Услуги');
    if (/меню|блюд|напит|кофе|еда|кухн/i.test(d)) add('menu', 'Меню');
    if (/портфолио|работ|кейс|проект/i.test(d)) add('portfolio', 'Работы');
    if (/цен|тариф|прайс|price/i.test(d)) add('pricing', 'Цены');
    if (/отзыв|review/i.test(d)) add('reviews', 'Отзывы');
    if (/команд|team/i.test(d)) add('team', 'Команда');
    add('contact', 'Контакты');
    let tone = 'neutral';
    if (/тёпл|уют|спокой|пауза|мягк/i.test(d)) tone = 'warm';
    if (/яркий|энерг|спорт|дерзк/i.test(d)) tone = 'bold';
    if (/дело|бизнес|строг|премиум/i.test(d)) tone = 'business';
    if (/миним|чист|воздух/i.test(d)) tone = 'minimal';
    const titleMatch = description.match(/^([^.\n!?]{3,48})/);
    const title = (titleMatch ? titleMatch[1] : 'Мой сайт').trim();
    return { title, sections, tone, description: description || '' };
  },
  generateSiteHTML(description, name) {
    const parsed = this.parseIdea(description);
    const title = name || parsed.title;
    const desc = this.escapeHtml(parsed.description.slice(0, 500));
    const t = this.escapeHtml(title);
    const sectionHtml = parsed.sections.map(s => {
      if (s.id === 'hero') return '';
      if (s.id === 'menu') return '<section id="menu" class="section"><div class="wrap"><h2>' + s.title + '</h2><div class="cards"><div class="item"><h3>Фирменный</h3><p>По вашему описанию.</p></div><div class="item"><h3>Классика</h3><p>Понятные позиции.</p></div><div class="item"><h3>Сезонное</h3><p>Меняется с настроением.</p></div></div></div></section>';
      if (s.id === 'services') return '<section id="services" class="section alt"><div class="wrap"><h2>' + s.title + '</h2><div class="cards"><div class="item"><h3>Основное</h3><p>' + desc.slice(0, 120) + '</p></div><div class="item"><h3>Дополнительно</h3><p>Под аудиторию.</p></div><div class="item"><h3>Поддержка</h3><p>Связь и ответы.</p></div></div></div></section>';
      if (s.id === 'contact') return '<section id="contact" class="section alt"><div class="wrap"><h2>' + s.title + '</h2><p>Напишите нам — ответим.</p></div></section>';
      return '<section id="' + s.id + '" class="section"><div class="wrap"><h2>' + s.title + '</h2><p>' + desc + '</p></div></section>';
    }).join('\n');
    const nav = parsed.sections.filter(s => s.id !== 'hero').map(s => '<a href="#' + s.id + '">' + s.title + '</a>').join('');
    return '<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + t + '</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body data-tone="' + parsed.tone + '">\n<header class="header"><div class="wrap"><strong class="brand">' + t + '</strong><nav>' + nav + '</nav></div></header>\n<section class="hero"><div class="wrap"><h1>' + t + '</h1><p>' + desc + '</p><a class="btn" href="#contact">Связаться</a></div></section>\n' + sectionHtml + '\n<footer class="footer"><div class="wrap">© ' + new Date().getFullYear() + ' ' + t + ' · Ai крафт</div></footer>\n<script src="script.js"></script>\n</body>\n</html>';
  },
  generateSiteCSS(tone) {
    const accents = { warm: '#c4a484', bold: '#ef4444', business: '#1e3a5f', minimal: '#52525b', neutral: '#8b5cf6' };
    const a = accents[tone] || accents.neutral;
    return '*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;line-height:1.6;color:#111;background:#fafafa}.wrap{max-width:960px;margin:0 auto;padding:0 20px}.header{border-bottom:1px solid #e5e5e5;background:#fff;position:sticky;top:0;z-index:10}.header .wrap{display:flex;justify-content:space-between;align-items:center;height:64px;gap:16px}.brand{font-size:18px;font-weight:700}nav{display:flex;flex-wrap:wrap;gap:8px 16px}nav a{color:#555;text-decoration:none;font-size:14px}.hero{padding:72px 0;text-align:center;background:linear-gradient(180deg,#fff,#f5f0ff)}.hero h1{font-size:clamp(28px,5vw,44px);margin-bottom:14px}.hero p{color:#555;max-width:540px;margin:0 auto 24px}.btn{display:inline-block;padding:12px 22px;background:' + a + ';color:#fff;border-radius:999px;text-decoration:none;font-weight:600}.section{padding:56px 0}.section.alt{background:#fff}.section h2{font-size:24px;margin-bottom:12px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:20px}.item{padding:16px;border:1px solid #eee;border-radius:12px;background:#fff}.item h3{font-size:15px;margin-bottom:6px}.item p{font-size:13px;color:#666}.footer{padding:24px 0;border-top:1px solid #e5e5e5;font-size:13px;color:#888}@media(max-width:640px){nav{display:none}}';
  }
};
document.addEventListener('DOMContentLoaded', () => { if (typeof AC !== 'undefined') AC.applyTheme(); });
