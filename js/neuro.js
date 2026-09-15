/* Нейро — ответы в стиле помощника (локально) */
const Neuro = {
  name: 'Нейро',
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  reply(kind, text) {
    const map = {
      general: [
        'Понял. Могу помочь с сайтом, кодом, ссылками или настройками Ai крафт. Уточни задачу — разберём по шагам.',
        'Ок. Если нужно собрать страницу: зайди в «Создать сайт» и опиши идею. Здесь могу подсказать структуру или код.',
        'Слушаю. Для кода переключи режим «Код», для сайта — «Сайт». Или просто пиши вопрос.'
      ],
      site: [
        'Схема: 1) «Создать сайт» → описание. 2) Поддомен и домен. 3) «Собрать» → правки в редакторе. 4) Открыть из проектов.\n\nОпиши нишу и стиль — предложу структуру блоков.',
        'Лендинг: шапка, герой, преимущества, отзывы, форма, подвал. Укажи ЦА и тон — соберу каркас.',
        'После сборки открой «Редактор кода»: HTML/CSS/JS и другие файлы. Превью справа обновляется сразу.'
      ],
      code: [
        'Опиши, что нужно: блок HTML, стили, скрипт или целый файл. Дам чистый пример без лишнего.',
        'В редакторе: html, css, js, ts, jsx, json, md, svg, py, php, sql, yml, vue и десятки других. Кнопка «+ Файл».',
        'Держи index.html + style.css + script.js; доп. страницы — отдельные .html. Так превью стабильнее.'
      ],
      explain: [
        'Пришли фрагмент кода или опиши, что непонятно — разложу по шагам.',
        'Могу объяснить HTML, CSS или JS. Вставь код в сообщение.'
      ]
    };
    const list = map[kind] || map.general;
    let base = this.pick(list);
    if (/привет|здравств|hello|hi\b/i.test(text || '')) base = 'Привет! Я Нейро. Помогу с сайтом, кодом или просто поболтаю. Что нужно?';
    if (/спасибо|благодар/i.test(text || '')) base = 'Пожалуйста. Если ещё что-то по сайту или коду — пиши.';
    return base;
  },
  answerCode(text) {
    const t = (text || '').toLowerCase();
    if (/кнопк/.test(t)) return 'Пример кнопки:\n\n```html\n<button class="btn">Нажми</button>\n```\n\n```css\n.btn { padding: 12px 20px; border: 0; border-radius: 999px; background: #8b5cf6; color: #fff; font-weight: 600; cursor: pointer; }\n```';
    if (/карточка|card/.test(t)) return 'Карточка:\n\n```html\n<article class="card"><h3>Заголовок</h3><p>Описание.</p></article>\n```\n\n```css\n.card { padding: 20px; border-radius: 16px; border: 1px solid #e5e5e5; background: #fff; }\n```';
    if (/навигац|меню|header/.test(t)) return 'Шапка:\n\n```html\n<header class="header"><strong>Бренд</strong><nav><a href="#about">О нас</a></nav></header>\n```';
    if (/форма|form/.test(t)) return 'Форма:\n\n```html\n<form><label>Имя<input name="name" required></label><button type="submit">Отправить</button></form>\n```';
    return null;
  }
};
