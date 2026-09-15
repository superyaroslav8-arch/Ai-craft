/* Ai крафт — core */
const AC = {
  KEYS: {
    users: 'aicraft_users',
    session: 'aicraft_session',
    settings: 'aicraft_settings',
    links: 'aicraft_links',
    neuro: 'aicraft_neuro_history'
  },
  FILE_TYPES: [
    { ext: 'html', name: 'HTML' }, { ext: 'css', name: 'CSS' }, { ext: 'js', name: 'JavaScript' },
    { ext: 'ts', name: 'TypeScript' }, { ext: 'jsx', name: 'JSX' }, { ext: 'tsx', name: 'TSX' },
    { ext: 'json', name: 'JSON' }, { ext: 'md', name: 'Markdown' }, { ext: 'txt', name: 'Text' },
    { ext: 'svg', name: 'SVG' }, { ext: 'xml', name: 'XML' }, { ext: 'py', name: 'Python' },
    { ext: 'php', name: 'PHP' }, { ext: 'sql', name: 'SQL' }, { ext: 'yml', name: 'YAML' },
    { ext: 'yaml', name: 'YAML' }, { ext: 'scss', name: 'SCSS' }, { ext: 'less', name: 'LESS' },
    { ext: 'vue', name: 'Vue' }, { ext: 'svelte', name: 'Svelte' }
  ],
  defaultSettings: {
    theme: 'dark', accent: '#8b5cf6', tabsPosition: 'bottom', fontSize: 14,
    wordWrap: true, autoSave: true, showPreview: true, animations: true
  },
  getUsers() { try { return JSON.parse(localStorage.getItem(this.KEYS.users) || '{}'); } catch { return {}; } },
  saveUsers(u) { localStorage.setItem(this.KEYS.users, JSON.stringify(u)); },
  getSession() { try { return JSON.parse(localStorage.getItem(this.KEYS.session) || 'null'); } catch { return null; } },
  setSession(s) { localStorage.setItem(this.KEYS.session, JSON.stringify(s)); },
  clearSession() { localStorage.removeItem(this.KEYS.session); },
  requireAuth(redirect = 'login.html') {
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
    document.documentElement.setAttribute('data-tabs', s.tabsPosition || 'bottom');
    document.documentElement.style.setProperty('--editor-font-size', (s.fontSize || 14) + 'px');
    if (!s.animations) document.documentElement.classList.add('no-anim');
    else document.documentElement.classList.remove('no-anim');
  },
  getUserSites(login) { return this.getUsers()[login]?.sites || []; },
  saveUserSites(login, sites) {
    const users = this.getUsers();
    if (!users[login]) return;
    users[login].sites = sites;
    this.saveUsers(users);
  },
  createSite(login, data) {
    const sites = this.getUserSites(login);
    const id = 'site_' + Date.now();
    const site = {
      id, name: data.name || 'Новый сайт', subdomain: data.subdomain,
      domain: data.domain || 'ai_craft.ru', description: data.description || '',
      createdAt: new Date().toISOString(),
      files: data.files || { 'index.html': data.html || '', 'style.css': data.css || '', 'script.js': data.js || '' },
      published: false
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
    const id = 'link_' + Date.now();
    const short = (slug || Math.random().toString(36).slice(2, 8)).toLowerCase().replace(/[^a-z0-9-]/g, '');
    const item = { id, title: title || short, url, slug: short, shortUrl: `aicraft.link/${short}`, clicks: 0, createdAt: new Date().toISOString() };
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
  generateSiteHTML(description, name) {
    const title = name || 'Мой сайт';
    const desc = (description || 'Сайт создан в Ai крафт').slice(0, 400);
    return `<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${title}</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<header class="header"><div class="wrap"><strong class="brand">${title}</strong><nav><a href="#about">О проекте</a><a href="#contact">Контакты</a></nav></div></header>\n<section class="hero"><div class="wrap"><h1>${title}</h1><p>${desc}</p><a class="btn" href="#contact">Связаться</a></div></section>\n<section id="about" class="section"><div class="wrap"><h2>О проекте</h2><p>${desc}</p></div></section>\n<section id="contact" class="section alt"><div class="wrap"><h2>Контакты</h2><p>Напишите нам.</p></div></section>\n<footer class="footer"><div class="wrap">© ${new Date().getFullYear()} ${title}</div></footer>\n<script src="script.js"></script>\n</body>\n</html>`;
  },
  generateSiteCSS() {
    return `*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;line-height:1.6;color:#111;background:#fafafa}.wrap{max-width:960px;margin:0 auto;padding:0 20px}.header{border-bottom:1px solid #e5e5e5;background:#fff;position:sticky;top:0}.header .wrap{display:flex;justify-content:space-between;align-items:center;height:64px}.brand{font-size:18px}nav a{margin-left:20px;color:#555;text-decoration:none;font-size:14px}.hero{padding:80px 0;text-align:center;background:linear-gradient(180deg,#fff,#f3f0ff)}.hero h1{font-size:clamp(32px,5vw,48px);margin-bottom:16px}.hero p{color:#666;max-width:560px;margin:0 auto 28px}.btn{display:inline-block;padding:12px 24px;background:#8b5cf6;color:#fff;border-radius:999px;text-decoration:none;font-weight:600}.section{padding:64px 0}.section.alt{background:#fff}.footer{padding:24px 0;border-top:1px solid #e5e5e5;font-size:13px;color:#888}`;
  }
};
document.addEventListener('DOMContentLoaded', () => AC.applyTheme());
