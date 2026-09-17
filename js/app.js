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

  /* ——— умный разбор описания ——— */
  detectType(desc) {
    const d = (desc || '').toLowerCase();
    if (/игр|game|гейм|arcade|платформер|шутер|головолом/.test(d)) return 'games';
    if (/кофе|cafe|кофейн|ресторан|еда|меню|пицц|бар|кухн/.test(d)) return 'cafe';
    if (/магазин|shop|store|товар|купить|каталог|одежд|бренд/.test(d)) return 'shop';
    if (/портфол|дизайн|фотограф|креатив|студи|агентств|кейсы/.test(d)) return 'portfolio';
    if (/блог|стать|новост|медиа|журнал/.test(d)) return 'blog';
    if (/школ|курс|обучен|урок|образован|репетитор/.test(d)) return 'school';
    if (/фитнес|спорт|йога|зал|тренир/.test(d)) return 'fitness';
    if (/медиц|клиник|врач|стомат|здоров/.test(d)) return 'clinic';
    if (/недвиж|квартир|риелтор|аренд/.test(d)) return 'realty';
    if (/салон|красот|стрижк|маникюр|spa/.test(d)) return 'beauty';
    return 'general';
  },

  suggestTitle(desc, type) {
    const raw = String(desc || '').trim();
    if (!raw) return 'Мой сайт';
    const first = raw.split(/[.!\n]/)[0].trim().slice(0, 48);
    let t = first.replace(/^(сайт|лендинг|страница|для|the|a|an|это)\s+/i, '').trim();
    if (t.length < 3) {
      const titles = {
        games: 'Игровая зона', cafe: 'Кофейня', shop: 'Магазин',
        portfolio: 'Портфолио', blog: 'Блог', school: 'Обучение',
        fitness: 'Фитнес', clinic: 'Клиника', realty: 'Недвижимость',
        beauty: 'Салон красоты', general: 'Мой проект'
      };
      t = titles[type] || 'Мой сайт';
    }
    return t.charAt(0).toUpperCase() + t.slice(1);
  },

  contentFor(type, desc, title) {
    const d = (desc || '').trim();
    const short = d.slice(0, 120);
    const packs = {
      games: {
        tagline: 'Играйте онлайн — бесплатно и без установки',
        about: 'Здесь собраны браузерные игры: аркады, головоломки и соревновательные режимы. Заходите, выбирайте жанр и начинайте партию за секунды.',
        features: [
          { t: 'Аркады', p: 'Быстрые уровни и рекорды. Идеально на пару минут.' },
          { t: 'Головоломки', p: 'Логика и внимательность — для тех, кто любит думать.' },
          { t: 'Мультиплеер', p: 'Играйте с друзьями или найдите соперника онлайн.' }
        ],
        cta: 'Играть сейчас',
        extraTitle: 'Популярные игры',
        extra: [
          { t: 'Space Run', p: 'Бесконечный раннер в космосе' },
          { t: 'Puzzle Box', p: '100 уровней сложности' },
          { t: 'Arena Clash', p: 'Быстрые дуэли 1 на 1' }
        ],
        nav: [['#games', 'Игры'], ['#about', 'О проекте'], ['#contact', 'Контакты']]
      },
      cafe: {
        tagline: 'Место, где хочется задержаться',
        about: short || 'Уютное пространство с хорошим кофе, свежей выпечкой и спокойной атмосферой. Приходите утром за эспрессо или вечером за десертом.',
        features: [
          { t: 'Кофе', p: 'Зёрна под обжарку, классика и авторские напитки.' },
          { t: 'Меню', p: 'Завтраки, сэндвичи и сезонные десерты.' },
          { t: 'Атмосфера', p: 'Мягкий свет, музыка и место для ноутбука.' }
        ],
        cta: 'Смотреть меню',
        extraTitle: 'Что попробовать',
        extra: [
          { t: 'Капучино', p: 'Классика с бархатной пенкой' },
          { t: 'Чизкейк', p: 'Домашний рецепт' },
          { t: 'Завтрак', p: 'До 12:00' }
        ],
        nav: [['#menu', 'Меню'], ['#about', 'О нас'], ['#contact', 'Контакты']]
      },
      shop: {
        tagline: 'Товары, которые хочется заказать',
        about: short || 'Каталог с понятными карточками, честными описаниями и быстрой доставкой. Соберите корзину за пару кликов.',
        features: [
          { t: 'Каталог', p: 'Категории и фильтры — сразу к нужному.' },
          { t: 'Доставка', p: 'По городу и в регионы.' },
          { t: 'Оплата', p: 'Удобные способы без лишних шагов.' }
        ],
        cta: 'В каталог',
        extraTitle: 'Популярное',
        extra: [
          { t: 'Новинки', p: 'Свежие поступления' },
          { t: 'Хиты', p: 'То, что берут чаще всего' },
          { t: 'Акции', p: 'Выгодные предложения' }
        ],
        nav: [['#catalog', 'Каталог'], ['#about', 'О магазине'], ['#contact', 'Контакты']]
      },
      portfolio: {
        tagline: 'Работы, которые говорят сами за себя',
        about: short || 'Подборка проектов: от идеи до готового результата. Смотрите кейсы и пишите, если хотите похожий подход.',
        features: [
          { t: 'Кейсы', p: 'Реальные задачи и решения.' },
          { t: 'Процесс', p: 'Как идём от брифа к запуску.' },
          { t: 'Стиль', p: 'Чистый визуал и внимание к деталям.' }
        ],
        cta: 'Смотреть работы',
        extraTitle: 'Направления',
        extra: [
          { t: 'Брендинг', p: 'Логотипы и айдентика' },
          { t: 'Веб', p: 'Сайты и интерфейсы' },
          { t: 'Контент', p: 'Визуалы и презентации' }
        ],
        nav: [['#work', 'Работы'], ['#about', 'Обо мне'], ['#contact', 'Связаться']]
      },
      school: {
        tagline: 'Учитесь в удобном темпе',
        about: short || 'Курсы и материалы, которые помогают освоить навык шаг за шагом. Теория, практика и поддержка.',
        features: [
          { t: 'Программы', p: 'Структура от простого к сложному.' },
          { t: 'Практика', p: 'Задания и разбор ошибок.' },
          { t: 'Поддержка', p: 'Ответы на вопросы по ходу обучения.' }
        ],
        cta: 'Выбрать курс',
        extraTitle: 'Курсы',
        extra: [
          { t: 'Старт', p: 'Для новичков' },
          { t: 'Профи', p: 'Углублённый уровень' },
          { t: 'Интенсив', p: 'Быстрый результат' }
        ],
        nav: [['#courses', 'Курсы'], ['#about', 'О школе'], ['#contact', 'Контакты']]
      },
      fitness: {
        tagline: 'Тренировки, которые вписываются в жизнь',
        about: short || 'Программы для зала и дома, понятные планы и мотивация без давления.',
        features: [
          { t: 'Программы', p: 'Под ваш уровень и цель.' },
          { t: 'Расписание', p: 'Группы и персональные слоты.' },
          { t: 'Тренеры', p: 'Опыт и внимание к технике.' }
        ],
        cta: 'Записаться',
        extraTitle: 'Направления',
        extra: [
          { t: 'Сила', p: 'База и прогресс' },
          { t: 'Кардио', p: 'Выносливость' },
          { t: 'Мобильность', p: 'Гибкость и восстановление' }
        ],
        nav: [['#programs', 'Программы'], ['#about', 'О зале'], ['#contact', 'Контакты']]
      },
      general: {
        tagline: short || 'Проект, собранный по вашему описанию',
        about: d.length > 20 ? d : 'Мы собрали структуру сайта под вашу идею: понятный первый экран, блоки с смыслом и место для контактов.',
        features: [
          { t: 'Идея', p: 'В центре — то, что вы описали.' },
          { t: 'Структура', p: 'Секции, которые ведут посетителя дальше.' },
          { t: 'Контакт', p: 'Легко связаться после знакомства с проектом.' }
        ],
        cta: 'Узнать больше',
        extraTitle: 'Что внутри',
        extra: [
          { t: 'Главное', p: 'Суть предложения' },
          { t: 'Детали', p: 'Как это устроено' },
          { t: 'Связь', p: 'Следующий шаг' }
        ],
        nav: [['#about', 'О проекте'], ['#features', 'Возможности'], ['#contact', 'Контакты']]
      }
    };
    const pack = packs[type] || packs.general;
    // подмешиваем фразы из описания, чтобы не было «чужого» текста
    if (d.length > 15 && type !== 'games') {
      pack.about = d.length > 200 ? d.slice(0, 280) + '…' : d;
    }
    if (type === 'games' && /дет|kids|child|школ/.test(d.toLowerCase())) {
      pack.tagline = 'Безопасные игры для детей — без рекламы и скачиваний';
      pack.about = 'Подборка простых и интересных игр для детей. Яркий интерфейс, понятные правила и возможность играть прямо в браузере.';
      pack.extra = [
        { t: 'Раскраски', p: 'Творчество онлайн' },
        { t: 'Пазлы', p: 'Лёгкие уровни' },
        { t: 'Гонки', p: 'Весёлые трассы' }
      ];
    }
    return pack;
  },

  buildHTML(desc, title, engine) {
    const type = this.detectType(desc);
    const t = this.esc(title || this.suggestTitle(desc, type));
    const pack = this.contentFor(type, desc, title);
    const eng = this.esc(engine || 'Host AI');
    const nav = (pack.nav || []).map(n => '<a href="' + n[0] + '">' + this.esc(n[1]) + '</a>').join('');
    const features = (pack.features || []).map(f =>
      '<div class="tile"><strong>' + this.esc(f.t) + '</strong><p>' + this.esc(f.p) + '</p></div>'
    ).join('');
    const extra = (pack.extra || []).map(f =>
      '<div class="tile"><strong>' + this.esc(f.t) + '</strong><p>' + this.esc(f.p) + '</p></div>'
    ).join('');

    return '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + t + '</title></head><body>' +
      '<header><div class="w row"><strong class="logo">' + t + '</strong><nav>' + nav + '</nav></div></header>' +
      '<section class="hero"><div class="w">' +
      '<p class="kicker">' + eng + '</p>' +
      '<h1>' + t + '</h1>' +
      '<p class="lead">' + this.esc(pack.tagline) + '</p>' +
      '<a class="cta" href="#contact">' + this.esc(pack.cta) + '</a>' +
      '</div></section>' +
      '<section class="block" id="features"><div class="w">' +
      '<p class="kicker">Возможности</p><h2>Что вас ждёт</h2>' +
      '<div class="grid3">' + features + '</div></div></section>' +
      '<section class="block soft" id="about"><div class="w">' +
      '<p class="kicker">О проекте</p><h2>Немного подробнее</h2>' +
      '<p class="lead">' + this.esc(pack.about) + '</p></div></section>' +
      '<section class="block" id="games"><div class="w">' +
      '<p class="kicker">Разделы</p><h2>' + this.esc(pack.extraTitle) + '</h2>' +
      '<div class="grid3">' + extra + '</div></div></section>' +
      '<section class="block" id="contact"><div class="w">' +
      '<p class="kicker">Контакты</p><h2>Напишите нам</h2>' +
      '<p class="muted">Готовы обсудить детали или задать вопрос — напишите.</p>' +
      '<a class="cta" href="mailto:hello@example.com">Связаться</a>' +
      '</div></section>' +
      '<footer><div class="w row"><span>© ' + new Date().getFullYear() + ' ' + t +
      '</span><span class="muted">Ai-craft · бесплатно</span></div></footer>' +
      '</body></html>';
  },

  buildCSS(type) {
    type = type || 'general';
    const themes = {
      games: { hero: '#0b1020', color: '#f8fafc', accent: '#6366f1' },
      cafe: { hero: '#f7f3ee', color: '#1c1917', accent: '#c2410c' },
      shop: { hero: '#0f172a', color: '#f8fafc', accent: '#22c55e' },
      portfolio: { hero: '#fafafa', color: '#171717', accent: '#171717' },
      school: { hero: '#eff6ff', color: '#1e3a8a', accent: '#2563eb' },
      fitness: { hero: '#0a0a0a', color: '#fafafa', accent: '#ef4444' },
      general: { hero: '#f7f3ee', color: '#1c1917', accent: '#c2410c' }
    };
    const th = themes[type] || themes.general;
    return '*{box-sizing:border-box;margin:0;padding:0}body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;line-height:1.55;color:#1c1917;background:#fff}' +
      '.w{max-width:960px;margin:0 auto;padding:0 24px}header{padding:18px 0;border-bottom:1px solid #ece7e1;position:sticky;top:0;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);z-index:5}' +
      '.row{display:flex;align-items:center;justify-content:space-between;gap:16px}.logo{font-size:15px;letter-spacing:-.02em}' +
      'header nav{display:flex;gap:18px;flex-wrap:wrap}header a{color:#78716c;text-decoration:none;font-size:14px}' +
      '.hero{padding:88px 0 72px;background:' + th.hero + ';color:' + th.color + '}' +
      '.kicker{font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.7;margin-bottom:12px}' +
      '.hero h1{font-size:clamp(36px,6vw,56px);line-height:1.05;letter-spacing:-.04em;font-weight:700;max-width:14ch;margin-bottom:16px}' +
      '.lead{font-size:18px;max-width:40ch;opacity:.9;margin-bottom:28px}' +
      '.cta{display:inline-block;padding:12px 20px;background:' + th.accent + ';color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px}' +
      '.block{padding:64px 0}.block.soft{background:#faf8f6}.block h2{font-size:clamp(24px,3vw,32px);letter-spacing:-.03em;margin-bottom:12px}' +
      '.muted{color:#78716c}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:28px}' +
      '.tile{border:1px solid #ece7e1;border-radius:16px;padding:18px;background:#fff}.tile strong{display:block;margin-bottom:6px;font-size:15px}.tile p{color:#57534e;font-size:14px}' +
      'footer{padding:28px 0;border-top:1px solid #ece7e1;font-size:13px;color:#78716c}' +
      '@media(max-width:700px){.grid3{grid-template-columns:1fr}header nav{display:none}}';
  },

  parse(desc) {
    return { type: this.detectType(desc), description: desc || '' };
  }
};
AK.applyTheme();
