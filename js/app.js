const AK = {
  S: 'ak_session', U: 'ak_users', SET: 'ak_settings',
  session() { try { return JSON.parse(localStorage.getItem(this.S) || 'null'); } catch { return null; } },
  setSession(s) { localStorage.setItem(this.S, JSON.stringify(s)); },
  clearSession() { localStorage.removeItem(this.S); },
  users() { try { return JSON.parse(localStorage.getItem(this.U) || '{}'); } catch { return {}; } },
  saveUsers(u) { localStorage.setItem(this.U, JSON.stringify(u)); },
  settings() {
    try { return Object.assign({ theme: 'dark', lang: 'ru', accent: '#8b5cf6' }, JSON.parse(localStorage.getItem(this.SET) || '{}')); }
    catch { return { theme: 'dark', lang: 'ru', accent: '#8b5cf6' }; }
  },
  saveSettings(p) {
    const n = Object.assign(this.settings(), p);
    localStorage.setItem(this.SET, JSON.stringify(n));
    this.applyTheme(n);
    return n;
  },
  applyTheme(s) {
    s = s || this.settings();
    document.documentElement.setAttribute('data-theme', s.theme || 'dark');
    document.documentElement.style.setProperty('--accent', s.accent || '#8b5cf6');
  },
  async hash(text) {
    const data = new TextEncoder().encode(String(text));
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },
  validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '').trim());
  },
  async register({ email, password, name, photo }) {
    email = String(email || '').trim().toLowerCase();
    if (!this.validEmail(email)) throw new Error('Укажите корректную почту');
    if (!password || String(password).length < 6) throw new Error('Пароль не короче 6 символов');
    const users = this.users();
    if (users[email]) throw new Error('Эта почта уже зарегистрирована');
    const passHash = await this.hash(password + '|' + email);
    const display = (name || '').trim().slice(0, 32) || email.split('@')[0];
    users[email] = {
      email, passHash, name: display, photo: photo || null,
      sites: [], links: [], createdAt: new Date().toISOString()
    };
    this.saveUsers(users);
    this.setSession({ login: email, name: display, email });
    return this.session();
  },
  async login({ email, password }) {
    email = String(email || '').trim().toLowerCase();
    const users = this.users();
    const u = users[email];
    if (!u) throw new Error('Нет аккаунта с этой почтой');
    const passHash = await this.hash(password + '|' + email);
    if (u.passHash !== passHash) throw new Error('Неверный пароль');
    this.setSession({ login: email, name: u.name, email });
    return this.session();
  },
  sites(login) { return (this.users()[login] || {}).sites || []; },
  saveSites(login, sites) {
    const u = this.users();
    if (!u[login]) return;
    u[login].sites = sites;
    this.saveUsers(u);
  },
  links(login) { return (this.users()[login] || {}).links || []; },
  saveLinks(login, links) {
    const u = this.users();
    if (!u[login]) return;
    u[login].links = links;
    this.saveUsers(u);
  },
  esc(t) { const d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML; },
  toast(m) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = m; el.classList.add('on');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2200);
  },
  imageUrl(prompt) {
    const q = encodeURIComponent(String(prompt).slice(0, 300));
    const seed = Math.floor(Math.random() * 1e9);
    return 'https://image.pollinations.ai/prompt/' + q + '?width=768&height=512&seed=' + seed + '&nologo=true&model=flux';
  },
  parse(desc) {
    const d = (desc || '').toLowerCase();
    const sections = ['contact'];
    if (/о нас|about|история/.test(d)) sections.unshift('about');
    if (/меню|кофе|еда|напит/.test(d)) sections.unshift('menu');
    if (/услуг|service/.test(d)) sections.unshift('services');
    let tone = 'neutral';
    if (/тёпл|уют|пауза/.test(d)) tone = 'warm';
    if (/дело|бизнес|премиум/.test(d)) tone = 'business';
    if (/миним|чист/.test(d)) tone = 'minimal';
    const title = (desc.match(/^([^.\n!?]{3,40})/) || ['', 'Мой сайт'])[1].trim();
    return { title, sections, tone, description: desc || '' };
  },
  buildHTML(desc, title) {
    const p = this.parse(desc);
    const t = this.esc(title || p.title);
    const text = this.esc(p.description.slice(0, 400));
    let body = '';
    p.sections.forEach(id => {
      if (id === 'menu') body += '<section id="menu"><div class="w"><h2>Меню</h2><p>Позиции по описанию.</p></div></section>';
      else if (id === 'services') body += '<section id="services"><div class="w"><h2>Услуги</h2><p>' + text.slice(0, 120) + '</p></div></section>';
      else if (id === 'about') body += '<section id="about"><div class="w"><h2>О нас</h2><p>' + text + '</p></div></section>';
      else body += '<section id="contact"><div class="w"><h2>Контакты</h2><p>Напишите нам.</p></div></section>';
    });
    return '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
      t + '</title></head><body><header><div class="w"><strong>' + t + '</strong></div></header><section class="hero"><div class="w"><h1>' +
      t + '</h1><p>' + text + '</p></div></section>' + body + '<footer><div class="w">© ' + new Date().getFullYear() + ' ' + t +
      '</div></footer></body></html>';
  },
  buildCSS() {
    return '*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;line-height:1.6;color:#111;background:#fafafa}.w{max-width:900px;margin:0 auto;padding:0 20px}header{border-bottom:1px solid #eee;background:#fff;padding:16px 0}.hero{padding:64px 0;text-align:center;background:linear-gradient(180deg,#fff,#f5f0ff)}.hero h1{font-size:clamp(28px,5vw,42px);margin-bottom:12px}section{padding:48px 0}section h2{margin-bottom:10px}footer{padding:20px 0;border-top:1px solid #eee;font-size:13px;color:#888';
  }
};
