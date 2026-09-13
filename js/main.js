// ===== Cookie =====
function acceptCookies() {
  localStorage.setItem('ai_craft_cookies', '1');
  document.getElementById('cookieBanner')?.classList.add('hidden');
}
if (localStorage.getItem('ai_craft_cookies')) {
  document.getElementById('cookieBanner')?.classList.add('hidden');
}

// ===== Mobile menu =====
const mobileBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ===== Auth helpers =====
const AUTH_KEY = 'ai_craft_users';
const SESSION_KEY = 'ai_craft_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// ===== Register =====
function handleRegister(e) {
  e.preventDefault();
  const login = document.getElementById('login')?.value.trim();
  const password = document.getElementById('password')?.value;
  const errorEl = document.getElementById('authError');

  if (!login || !password) {
    showError(errorEl, 'Заполни логин и пароль');
    return;
  }
  if (login.length < 3) {
    showError(errorEl, 'Логин минимум 3 символа');
    return;
  }
  if (password.length < 4) {
    showError(errorEl, 'Пароль минимум 4 символа');
    return;
  }

  const users = getUsers();
  if (users[login]) {
    showError(errorEl, 'Такой логин уже занят');
    return;
  }

  users[login] = { password, sites: [] };
  saveUsers(users);
  setSession({ login });
  window.location.href = 'dashboard.html';
}

// ===== Login =====
function handleLogin(e) {
  e.preventDefault();
  const login = document.getElementById('login')?.value.trim();
  const password = document.getElementById('password')?.value;
  const errorEl = document.getElementById('authError');

  if (!login || !password) {
    showError(errorEl, 'Заполни логин и пароль');
    return;
  }

  const users = getUsers();
  const user = users[login];
  if (!user || user.password !== password) {
    showError(errorEl, 'Неверный логин или пароль');
    return;
  }

  setSession({ login });
  window.location.href = 'dashboard.html';
}

function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

function logout() {
  clearSession();
  window.location.href = '../index.html';
}

// ===== Sites management =====
function getUserSites(login) {
  const users = getUsers();
  return users[login]?.sites || [];
}

function saveUserSites(login, sites) {
  const users = getUsers();
  if (!users[login]) return;
  users[login].sites = sites;
  saveUsers(users);
}

function createSite(login, data) {
  const sites = getUserSites(login);
  const id = 'site_' + Date.now();
  const site = {
    id,
    name: data.name || 'Новый сайт',
    subdomain: data.subdomain,
    domain: data.domain || 'ai_craft.ru',
    description: data.description || '',
    createdAt: new Date().toISOString(),
    content: data.content || null
  };
  sites.push(site);
  saveUserSites(login, sites);
  return site;
}

function deleteSite(login, siteId) {
  let sites = getUserSites(login);
  sites = sites.filter(s => s.id !== siteId);
  saveUserSites(login, sites);
}

// ===== Create form =====
function handleCreateSite(e) {
  e.preventDefault();
  const session = getSession();
  if (!session) return;

  const description = document.getElementById('siteDescription')?.value.trim();
  const subdomain = document.getElementById('subdomain')?.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  const domainEl = document.querySelector('input[name="domain"]:checked');
  const domain = domainEl ? domainEl.value : 'ai_craft.ru';

  if (!description) {
    alert('Опиши идею сайта');
    return;
  }
  if (!subdomain || subdomain.length < 3) {
    alert('Поддомен минимум 3 символа (латиница, цифры, дефис)');
    return;
  }

  // Mock AI generation delay
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Генерируем...';
  }

  setTimeout(() => {
    const site = createSite(session.login, {
      name: subdomain,
      subdomain,
      domain,
      description,
      content: {
        html: generateMockHTML(description, subdomain),
        css: '/* Стили сгенерированы AI */\nbody { font-family: system-ui; }',
        js: '// Скрипты'
      }
    });
    window.location.href = 'dashboard.html';
  }, 1800);
}

function generateMockHTML(desc, name) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0a0a0c; color: #f0f0f5; line-height: 1.6; }
    .hero { min-height: 80vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; }
    h1 { font-size: clamp(32px, 6vw, 56px); margin-bottom: 16px; }
    p { color: #9898a6; max-width: 560px; margin: 0 auto 32px; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #7c6cff, #ff6bcb); color: #0a0a0c; font-weight: 600; border-radius: 999px; text-decoration: none; }
    section { padding: 60px 20px; max-width: 900px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="hero">
    <div>
      <h1>${name}</h1>
      <p>${desc.slice(0, 200)}${desc.length > 200 ? '...' : ''}</p>
      <a href="#contact" class="btn">Связаться</a>
    </div>
  </div>
  <section>
    <h2>О проекте</h2>
    <p>Этот сайт создан с помощью Ai крафт по описанию: «${desc.slice(0, 120)}...»</p>
  </section>
  <section id="contact">
    <h2>Контакты</h2>
    <p>Напиши нам — мы на связи.</p>
  </section>
</body>
</html>`;
}

// ===== Domain selector =====
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.domain-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.domain-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const input = opt.querySelector('input');
      if (input) input.checked = true;
    });
  });

  // Tabs on create page
  document.querySelectorAll('.create-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.create-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      const panel = document.getElementById(target);
      if (panel) panel.style.display = 'block';
    });
  });
});
