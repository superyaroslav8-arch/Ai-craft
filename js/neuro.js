/* Нейро — AI-помощник Ai крафт */
const Neuro = {
  name: 'Нейро',
  replies: {
    greet: [
      'Привет! Я Нейро — помощник Ai крафт. Могу помочь с сайтом, кодом, ссылками или просто поболтать.',
      'Здравствуй! Я Нейро. Спроси про создание сайта, редактор, деплой или настройки.'
    ],
    site: [
      'Чтобы создать сайт: открой «Создать сайт», опиши идею обычными словами и нажми «Собрать». Потом можно править в визуальном редакторе или в коде.',
      'Опиши нишу, стиль и что должно быть на страницах — я подскажу структуру. Например: «лендинг кофейни, тёплые тона, меню и контакты».'
    ],
    code: [
      'В редакторе кода вкладки HTML / CSS / JS. Позицию вкладок и тему можно сменить в Настройках. Сохрани и открой предпросмотр.',
      'Пиши код как в привычной IDE: несколько файлов-вкладок, live-preview справа. Акцентный цвет тоже настраивается.'
    ],
    links: [
      'В разделе «Ссылки» создай короткую ссылку: вставь URL, задай slug — получишь aicraft.link/твой-slug. Удобно для деплоя и шеринга.',
      'Короткие ссылки хранятся в кабинете. Можно удалять и копировать одним кликом.'
    ],
    deploy: [
      'После создания сайта выбери поддомен *.ai_craft.ru / .com / .dev и опубликуй. SSL выдаётся автоматически.',
      'Деплой: сохрани проект → укажи поддомен → «Опубликовать». Потом можно привязать свой домен.'
    ],
    theme: [
      'В Настройках: тёмная/светлая тема, акцентный цвет, вкладки сверху или снизу (по умолчанию снизу).',
      'Тема применяется сразу ко всему кабинету. Выбери акцент под свой бренд.'
    ],
    chat: [
      'Можем просто поболтать — я рядом. Или скажи, что делаешь на платформе, подскажу следующий шаг.',
      'Ок, я слушаю. Если понадобится помощь по сайту или коду — пиши прямо сюда.'
    ],
    default: [
      'Могу помочь с созданием сайта, кодом, ссылками, деплоем и настройками. Сформулируй задачу короче — отвечу конкретнее.',
      'Попробуй спросить: «как создать сайт», «как сменить тему», «как сделать ссылку» или «как опубликовать».'
    ]
  },
  detect(text) {
    const t = (text || '').toLowerCase();
    if (/прив|здрав|hello|hi\b|ку\b/.test(t)) return 'greet';
    if (/сайт|лендинг|страниц|создать|собрать|host/.test(t)) return 'site';
    if (/код|html|css|js|редактор|вкладк|github|файл/.test(t)) return 'code';
    if (/ссылк|link|коротк|slug/.test(t)) return 'links';
    if (/депло|публик|хост|домен|ssl|вылож/.test(t)) return 'deploy';
    if (/тем[аы]|цвет|акцент|настрой|светл|тёмн|темн/.test(t)) return 'theme';
    if (/поболт|как дела|что нового|скучн/.test(t)) return 'chat';
    return 'default';
  },
  reply(text) {
    const key = this.detect(text);
    const list = this.replies[key] || this.replies.default;
    return list[Math.floor(Math.random() * list.length)];
  },
  history(login) {
    try {
      const all = JSON.parse(localStorage.getItem(AC.KEYS.neuro) || '{}');
      return all[login] || [];
    } catch { return []; }
  },
  pushHistory(login, role, text) {
    const all = JSON.parse(localStorage.getItem(AC.KEYS.neuro) || '{}');
    const list = all[login] || [];
    list.push({ role, text, at: Date.now() });
    if (list.length > 80) list.splice(0, list.length - 80);
    all[login] = list;
    localStorage.setItem(AC.KEYS.neuro, JSON.stringify(all));
  },
  mount(container, login) {
    if (!container) return;
    container.innerHTML = `
      <div class="neuro-panel">
        <div class="neuro-head">
          <span class="neuro-avatar">✦</span>
          <div>
            <strong>Нейро</strong>
            <div class="neuro-sub">помощник Ai крафт</div>
          </div>
        </div>
        <div class="neuro-messages" id="neuroMessages"></div>
        <form class="neuro-form" id="neuroForm">
          <input type="text" id="neuroInput" placeholder="Спроси Нейро…" autocomplete="off" />
          <button type="submit" class="btn-primary btn-sm">→</button>
        </form>
      </div>`;
    const msgs = container.querySelector('#neuroMessages');
    const form = container.querySelector('#neuroForm');
    const input = container.querySelector('#neuroInput');
    const render = () => {
      const h = this.history(login);
      if (!h.length) {
        msgs.innerHTML = `<div class="neuro-bubble bot">${AC.escapeHtml(this.replies.greet[0])}</div>`;
        return;
      }
      msgs.innerHTML = h.map(m =>
        `<div class="neuro-bubble ${m.role === 'user' ? 'user' : 'bot'}">${AC.escapeHtml(m.text)}</div>`
      ).join('');
      msgs.scrollTop = msgs.scrollHeight;
    };
    render();
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      this.pushHistory(login, 'user', text);
      input.value = '';
      render();
      setTimeout(() => {
        const ans = this.reply(text);
        this.pushHistory(login, 'bot', ans);
        render();
      }, 400 + Math.random() * 400);
    });
  }
};
