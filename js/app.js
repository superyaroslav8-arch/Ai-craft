const AK = {
  S: 'ak_session', U: 'ak_users', SET: 'ak_settings',
  ENGINES: ['Host AI', 'lovable', 'Replit', 'Grok 4.6', 'ChatGPT 5.0', 'mottorable'],
  session() { try { return JSON.parse(localStorage.getItem(this.S) || 'null'); } catch { return null; } },
  setSession(s) { localStorage.setItem(this.S, JSON.stringify(s)); },
  clearSession() { localStorage.removeItem(this.S); },
  users() { try { return JSON.parse(localStorage.getItem(this.U) || '{}'); } catch { return {}; } },
  saveUsers(u) { localStorage.setItem(this.U, JSON.stringify(u)); },
  settings() {
    try {
      return Object.assign({ theme: 'dark', accent: '#6ea8ff', engine: 'Host AI' },
        JSON.parse(localStorage.getItem(this.SET) || '{}'));
    } catch { return { theme: 'dark', accent: '#6ea8ff', engine: 'Host AI' }; }
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
    document.documentElement.style.setProperty('--accent', s.accent || '#6ea8ff');
  },
  async hash(text) {
    const data = new TextEncoder().encode(String(text));
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },
  validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '').trim()); },
  async register({ email, password, name }) {
    email = String(email || '').trim().toLowerCase();
    if (!this.validEmail(email)) throw new Error('Укажите корректную почту');
    if (!password || String(password).length < 6) throw new Error('Пароль не короче 6 символов');
    const users = this.users();
    if (users[email]) throw new Error('Эта почта уже зарегистрирована');
    const passHash = await this.hash(password + '|' + email);
    const display = (name || '').trim().slice(0, 32) || email.split('@')[0];
    users[email] = { email, passHash, name: display, sites: [], domains: [], createdAt: new Date().toISOString() };
    this.saveUsers(users);
    this.setSession({ login: email, name: display, email });
    return this.session();
  },
  async login({ email, password }) {
    email = String(email || '').trim().toLowerCase();
    const u = this.users()[email];
    if (!u) throw new Error('Нет аккаунта с этой почтой');
    if (u.passHash !== await this.hash(password + '|' + email)) throw new Error('Неверный пароль');
    this.setSession({ login: email, name: u.name, email });
    return this.session();
  },
  deleteAccount(login) {
    const u = this.users();
    delete u[login];
    this.saveUsers(u);
    this.clearSession();
  },
  sites(login) { return (this.users()[login] || {}).sites || []; },
  saveSites(login, sites) { const u = this.users(); if (!u[login]) return; u[login].sites = sites; this.saveUsers(u); },
  domains(login) { return (this.users()[login] || {}).domains || []; },
  saveDomains(login, domains) { const u = this.users(); if (!u[login]) return; u[login].domains = domains; this.saveUsers(u); },
  esc(t) { const d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML; },
  toast(m) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = m; el.classList.add('on');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2400);
  },
  suggestTitle(desc) {
    const raw = String(desc || '').trim();
    if (!raw) return 'Мой сайт';
    const first = raw.split(/[.!\n]/)[0].trim();
    let t = first.slice(0, 48);
    t = t.replace(/^(сайт|лендинг|страница|для|the|a|an)\s+/i, '').trim();
    if (t.length < 2) t = first.slice(0, 40) || 'Мой сайт';
    return t.charAt(0).toUpperCase() + t.slice(1);
  },
  parse(desc) {
    const d = (desc || '').toLowerCase();
    const sections = [];
    if (/меню|menu|кофе|еда|напит|кухн|блюд/.test(d)) sections.push('menu');
    if (/услуг|service|работ|тариф/.test(d)) sections.push('services');
    if (/о нас|about|история|команд|кто мы/.test(d)) sections.push('about');
    if (/цен|price|стоим|прайс/.test(d)) sections.push('prices');
    if (/портфол|работ|кейс|project|gallery|галере/.test(d)) sections.push('work');
    if (!sections.length) sections.push('about');
    sections.push('contact');
    let tone = 'warm';
    if (/дело|бизнес|премиум|corporate|strict/.test(d)) tone = 'business';
    if (/миним|чист|minimal|white|прост/.test(d)) tone = 'minimal';
    if (/ярк|bold|неон|креатив/.test(d)) tone = 'bold';
    return { sections, tone, description: desc || '' };
  },
  buildHTML(desc, title, engine) {
    const p = this.parse(desc);
    const t = this.esc(title || this.suggestTitle(desc));
    const text = this.esc((desc || '').slice(0, 480));
    const eng = this.esc(engine || 'Host AI');
    const lines = (desc || '').split(/[.!\n]/).map(s => s.trim()).filter(s => s.length > 8).slice(0, 4);
    let body = '';
    p.sections.forEach(id => {
      if (id === 'menu') {
        body += '<section class="block" id="menu"><div class="w"><p class="kicker">Меню</p><h2>Что попробовать</h2>' +
          '<div class="grid3">' +
          '<div class="tile"><strong>Основное</strong><p>Блюда и позиции по вашему описанию.</p></div>' +
          '<div class="tile"><strong>Напитки</strong><p>Кофе и напитки — из идеи проекта.</p></div>' +
          '<div class="tile"><strong>Ещё</strong><p>Десерты и дополнения.</p></div>' +
          '</div></div></section>';
      } else if (id === 'services') {
        body += '<section class="block" id="services"><div class="w"><p class="kicker">Услуги</p><h2>Чем помогаем</h2><p class="lead">' +
          this.esc(lines[0] || text.slice(0, 160)) + '</p><div class="grid3">' +
          '<div class="tile"><strong>01</strong><p>' + this.esc(lines[0] || 'Основное направление') + '</p></div>' +
          '<div class="tile"><strong>02</strong><p>' + this.esc(lines[1] || 'Дополнительно') + '</p></div>' +
          '<div class="tile"><strong>03</strong><p>' + this.esc(lines[2] || 'Поддержка') + '</p></div>' +
          '</div></div></section>';
      } else if (id === 'about') {
        body += '<section class="block soft" id="about"><div class="w"><p class="kicker">О нас</p><h2>Немного о проекте</h2><p class="lead">' +
          text + '</p></div></section>';
      } else if (id === 'prices') {
        body += '<section class="block" id="prices"><div class="w"><p class="kicker">Цены</p><h2>Прозрачно</h2>' +
          '<div class="grid3"><div class="tile"><strong>Старт</strong><p>Базовый набор</p></div>' +
          '<div class="tile"><strong>Стандарт</strong><p>Оптимальный выбор</p></div>' +
          '<div class="tile"><strong>Максимум</strong><p>Полный пакет</p></div></div></div></section>';
      } else if (id === 'work') {
        body += '<section class="block" id="work"><div class="w"><p class="kicker">Работы</p><h2>Примеры</h2>' +
          '<p class="muted">Раздел под ваши кейсы и проекты.</p></div></section>';
      } else {
        body += '<section class="block" id="contact"><div class="w"><p class="kicker">Контакты</p><h2>Напишите нам</h2>' +
          '<p class="muted">Связь и адрес можно уточнить после публикации.</p>' +
          '<a class="cta" href="mailto:hello@example.com">Связаться</a></div></section>';
      }
    });
    return '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + t + '</title></head><body>' +
      '<header><div class="w row"><strong class="logo">' + t + '</strong>' +
      '<nav><a href="#about">О нас</a><a href="#contact">Контакты</a></nav></div></header>' +
      '<section class="hero"><div class="w"><p class="kicker">' + eng + '</p><h1>' + t + '</h1>' +
      '<p class="lead">' + text + '</p><a class="cta" href="#contact">Узнать больше</a></div></section>' +
      body +
      '<footer><div class="w row"><span>© ' + new Date().getFullYear() + ' ' + t +
      '</span><span class="muted">Ai-craft · бесплатно</span></div></footer></body></html>';
  },
  buildCSS(tone) {
    tone = tone || 'warm';
    const heroBg = tone === 'business' ? '#0f172a' : tone === 'minimal' ? '#fafafa' : tone === 'bold' ? '#1a0a2e' : '#f7f3ee';
    const heroColor = (tone === 'business' || tone === 'bold') ? '#f8fafc' : '#1c1917';
    const accent = tone === 'business' ? '#3b82f6' : tone === 'bold' ? '#c084fc' : tone === 'minimal' ? '#171717' : '#c2410c';
    return '*{box-sizing:border-box;margin:0;padding:0}body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;line-height:1.55;color:#1c1917;background:#fff}' +
      '.w{max-width:960px;margin:0 auto;padding:0 24px}header{padding:18px 0;border-bottom:1px solid #ece7e1;position:sticky;top:0;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);z-index:5}' +
      '.row{display:flex;align-items:center;justify-content:space-between;gap:16px}.logo{font-size:15px;letter-spacing:-.02em}' +
      'header nav{display:flex;gap:18px}header a{color:#78716c;text-decoration:none;font-size:14px}' +
      '.hero{padding:88px 0 72px;background:' + heroBg + ';color:' + heroColor + '}' +
      '.kicker{font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.7;margin-bottom:12px}' +
      '.hero h1{font-size:clamp(36px,6vw,56px);line-height:1.05;letter-spacing:-.04em;font-weight:700;max-width:14ch;margin-bottom:16px}' +
      '.lead{font-size:18px;max-width:38ch;opacity:.88;margin-bottom:28px}' +
      '.cta{display:inline-block;padding:12px 20px;background:' + accent + ';color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px}' +
      '.block{padding:64px 0}.block.soft{background:#faf8f6}.block h2{font-size:clamp(24px,3vw,32px);letter-spacing:-.03em;margin-bottom:12px}' +
      '.muted{color:#78716c}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:28px}' +
      '.tile{border:1px solid #ece7e1;border-radius:16px;padding:18px;background:#fff}.tile strong{display:block;margin-bottom:6px}' +
      'footer{padding:28px 0;border-top:1px solid #ece7e1;font-size:13px;color:#78716c}' +
      '@media(max-width:700px){.grid3{grid-template-columns:1fr}header nav{display:none}}';
  }
};
AK.applyTheme();
