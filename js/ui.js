(function () {
  if (typeof AK === 'undefined') {
    document.body.innerHTML = '<div class="wrap center"><h1>Ai-craft</h1><p>Ctrl+F5</p></div>';
    return;
  }
  AK.applyTheme();
  var session = AK.session();
  var isReg = false, built = null, mode = 'sub', pendingDomain = null, pendingTarget = '';
  var engine = AK.settings().engine || 'Host AI';

  function showGate() {
    document.getElementById('gate').style.display = 'block';
    document.getElementById('shell').style.display = 'none';
  }
  function showApp() {
    document.getElementById('gate').style.display = 'none';
    document.getElementById('shell').style.display = 'flex';
    document.getElementById('who').textContent = session.name || session.email;
    applyCompact();
    route();
  }
  function setMode(reg) {
    isReg = reg;
    document.getElementById('tabLogin').classList.toggle('on', !reg);
    document.getElementById('tabReg').classList.toggle('on', reg);
    document.getElementById('regOnly').style.display = reg ? 'block' : 'none';
    document.getElementById('authBtn').textContent = reg ? 'Зарегистрироваться' : 'Войти';
  }
  document.getElementById('tabLogin').onclick = function () { setMode(false); };
  document.getElementById('tabReg').onclick = function () { setMode(true); };
  document.getElementById('authBtn').onclick = async function () {
    var err = document.getElementById('authErr');
    err.style.display = 'none';
    try {
      if (isReg) {
        session = await AK.register({
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
          name: document.getElementById('name').value
        });
      } else {
        session = await AK.login({
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        });
      }
      showApp(); location.hash = 'home';
    } catch (e) {
      err.textContent = e.message || 'Ошибка';
      err.style.display = 'block';
    }
  };

  function doLogout() { AK.clearSession(); session = null; showGate(); }
  document.getElementById('logoutSide').onclick = function (e) { e.preventDefault(); doLogout(); };
  document.getElementById('btnLogout').onclick = doLogout;
  document.getElementById('btnDeleteAcc').onclick = function () {
    if (!session) return;
    if (!confirm('Удалить все данные этого аккаунта на устройстве?')) return;
    AK.deleteAccount(session.login);
    session = null;
    showGate();
    notify('Данные удалены');
  };

  function notify(m) {
    if (AK.settings().toasts === 'off') return;
    AK.toast(m);
  }

  function applyCompact() {
    document.documentElement.setAttribute('data-compact', AK.settings().compact === 'on' ? 'on' : 'off');
  }

  // Engines
  function renderEngines() {
    var box = document.getElementById('engineChips');
    if (!box) return;
    engine = AK.settings().engine || 'Host AI';
    box.innerHTML = AK.ENGINES.map(function (e) {
      return '<span class="chip' + (e === engine ? ' on' : '') + '" data-engine="' + e + '">' + e + '</span>';
    }).join('');
    box.querySelectorAll('[data-engine]').forEach(function (c) {
      c.onclick = function () {
        engine = c.getAttribute('data-engine');
        AK.saveSettings({ engine: engine });
        box.querySelectorAll('.chip').forEach(function (x) {
          x.classList.toggle('on', x.getAttribute('data-engine') === engine);
        });
        var de = document.getElementById('defaultEngine');
        if (de) de.value = engine;
      };
    });
  }
  renderEngines();

  function isLocallyTaken(domain) {
    domain = String(domain || '').toLowerCase();
    var users = AK.users(), keys = Object.keys(users);
    for (var i = 0; i < keys.length; i++) {
      var u = users[keys[i]] || {};
      var sites = u.sites || [];
      for (var s = 0; s < sites.length; s++) {
        var a = (sites[s].customDomain || ((sites[s].subdomain || '') + '.' + (sites[s].domain || ''))).toLowerCase();
        if (a === domain) return true;
      }
      var domains = u.domains || [];
      for (var d = 0; d < domains.length; d++) {
        if (String(domains[d].domain || '').toLowerCase() === domain) return true;
      }
    }
    return false;
  }

  async function checkDomain(domain) {
    domain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain)) {
      throw new Error('Некорректное имя');
    }
    if (isLocallyTaken(domain)) return { domain: domain, available: false, reason: 'local' };
    if (/\.ai_craft\.(ru|com|dev)$/.test(domain)) return { domain: domain, available: true, reason: 'platform' };
    var tld = domain.split('.').slice(1).join('.');
    if (tld !== 'ru' && tld !== 'com' && tld !== 'dev') {
      return { domain: domain, available: true, reason: 'label' };
    }
    var response = await fetch('https://dns.google/resolve?name=' + encodeURIComponent(domain) + '&type=NS');
    if (!response.ok) throw new Error('Сервис проверки не ответил');
    var data = await response.json();
    if (data.Status === 3) return { domain: domain, available: true, reason: 'dns' };
    if (data.Status === 0 && data.Answer && data.Answer.length) return { domain: domain, available: false, reason: 'dns' };
    return { domain: domain, available: true, reason: 'dns' };
  }

  function normalizeUrl(url) {
    url = String(url || '').trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); return url; } catch (e) { return ''; }
  }

  function showResult(el, r) {
    if (r.available) {
      el.style.color = '#4ade80';
      el.innerHTML = '✓ <strong>' + AK.esc(r.domain) + '</strong> — имя свободно. Можно создать.';
    } else {
      el.style.color = '#f87171';
      el.innerHTML = '✕ <strong>' + AK.esc(r.domain) + '</strong> — занято. Другое имя.';
    }
  }

  function route() {
    var page = (location.hash || '#home').replace('#', '') || 'home';
    if (['home', 'create', 'domains', 'settings'].indexOf(page) < 0) page = 'home';
    document.querySelectorAll('.page').forEach(function (p) {
      p.classList.toggle('on', p.id === 'page-' + page);
    });
    document.querySelectorAll('[data-page]').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-page') === page);
    });
    if (page === 'home') renderHome();
    if (page === 'domains') renderSavedDomains();
    if (page === 'settings') syncSettings();
    if (page === 'create') renderEngines();
  }
  window.addEventListener('hashchange', route);

  function renderHome() {
    var sites = AK.sites(session.login);
    var domains = AK.domains(session.login);
    var links = AK.links(session.login);
    document.getElementById('statSites').textContent = sites.length;
    document.getElementById('statDomains').textContent = domains.length;
    document.getElementById('statLinks').textContent = links.length;

    var el = document.getElementById('siteList');
    if (!sites.length) {
      el.innerHTML = '<p class="sub">Пока нет сайтов. <a href="#create">Опишите идею →</a></p>';
    } else {
      el.innerHTML = sites.map(function (s) {
        var addr = s.customDomain || ((s.subdomain || 'site') + '.' + (s.domain || 'ai_craft.ru'));
        return '<div class="card"><h3>' + AK.esc(s.name) + '</h3><div class="meta">' + AK.esc(addr) +
          '</div><p style="color:var(--muted);font-size:12px">' + AK.esc(s.engine || '') +
          '</p><div class="actions"><button type="button" data-open="' + s.id + '">Открыть</button> ' +
          '<button type="button" data-del="' + s.id + '">Удалить</button></div></div>';
      }).join('');
      el.querySelectorAll('[data-open]').forEach(function (b) {
        b.onclick = function () {
          var s = AK.sites(session.login).find(function (x) { return x.id === b.getAttribute('data-open'); });
          if (!s || !s.html) return;
          var doc = s.html;
          if (doc.indexOf('</head>') !== -1) doc = doc.replace('</head>', '<style>' + (s.css || '') + '</style></head>');
          else doc = '<style>' + (s.css || '') + '</style>' + doc;
          var w = window.open('', '_blank');
          if (w) { w.document.write(doc); w.document.close(); }
        };
      });
      el.querySelectorAll('[data-del]').forEach(function (b) {
        b.onclick = function () {
          if (!confirm('Удалить сайт?')) return;
          AK.saveSites(session.login, AK.sites(session.login).filter(function (s) {
            return s.id !== b.getAttribute('data-del');
          }));
          renderHome();
        };
      });
    }

    var dl = document.getElementById('domainListHome');
    if (!domains.length) dl.innerHTML = '<p class="sub">Нет доменов. <a href="#domains">Создать →</a></p>';
    else {
      dl.innerHTML = domains.map(function (d) {
        return '<div class="card"><div class="meta">' + AK.esc(d.domain) + '</div>' +
          '<p style="font-size:12px;color:var(--muted)">' + AK.esc(d.target || '—') + '</p>' +
          '<div class="actions"><button type="button" data-dopen="' + d.id + '">Открыть сайт</button> ' +
          '<button type="button" data-ddel="' + d.id + '">Удалить</button></div></div>';
      }).join('');
      bindDomainActions(dl);
    }
    renderLinks();
  }

  function bindDomainActions(root) {
    root.querySelectorAll('[data-dopen]').forEach(function (b) {
      b.onclick = function () {
        var d = AK.domains(session.login).find(function (x) { return x.id === b.getAttribute('data-dopen'); });
        if (!d || !d.target) return notify('Нет целевой ссылки');
        window.open(d.target, '_blank', 'noopener');
      };
    });
    root.querySelectorAll('[data-ddel]').forEach(function (b) {
      b.onclick = function () {
        if (!confirm('Удалить домен?')) return;
        AK.saveDomains(session.login, AK.domains(session.login).filter(function (d) {
          return d.id !== b.getAttribute('data-ddel');
        }));
        renderHome();
        renderSavedDomains();
      };
    });
    root.querySelectorAll('[data-dcopy]').forEach(function (b) {
      b.onclick = function () {
        navigator.clipboard.writeText(b.getAttribute('data-dcopy')).then(function () { notify('Скопировано'); });
      };
    });
  }

  function renderLinks() {
    var links = AK.links(session.login);
    var el = document.getElementById('linkList');
    if (!links.length) { el.innerHTML = '<p class="sub">Пока нет ссылок</p>'; return; }
    el.innerHTML = links.map(function (l) {
      return '<div class="card"><strong>' + AK.esc(l.title) + '</strong><div class="meta">ai-craft/' + AK.esc(l.slug) +
        '</div><div style="font-size:13px;color:var(--muted)">' + AK.esc(l.url) +
        '</div><div class="actions"><button type="button" data-lopen="' + AK.esc(l.url) + '">Открыть</button> ' +
        '<button type="button" data-copy="ai-craft/' + AK.esc(l.slug) + '">Копировать</button> ' +
        '<button type="button" data-ldel="' + l.id + '">Удалить</button></div></div>';
    }).join('');
    el.querySelectorAll('[data-lopen]').forEach(function (b) {
      b.onclick = function () { window.open(b.getAttribute('data-lopen'), '_blank', 'noopener'); };
    });
    el.querySelectorAll('[data-copy]').forEach(function (b) {
      b.onclick = function () {
        navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () { notify('Скопировано'); });
      };
    });
    el.querySelectorAll('[data-ldel]').forEach(function (b) {
      b.onclick = function () {
        AK.saveLinks(session.login, AK.links(session.login).filter(function (l) {
          return l.id !== b.getAttribute('data-ldel');
        }));
        renderLinks(); renderHome();
      };
    });
  }

  document.getElementById('btnLink').onclick = function () {
    var url = normalizeUrl(document.getElementById('linkUrl').value);
    if (!url) return notify('Укажите корректный URL');
    var slug = Math.random().toString(36).slice(2, 8);
    var links = AK.links(session.login);
    links.unshift({
      id: 'l_' + Date.now(),
      title: document.getElementById('linkTitle').value.trim() || slug,
      url: url,
      slug: slug
    });
    AK.saveLinks(session.login, links);
    document.getElementById('linkTitle').value = '';
    document.getElementById('linkUrl').value = '';
    renderHome();
    notify('Ссылка создана');
  };

  function showPreview(html, css) {
    var doc = html;
    if (doc.indexOf('</head>') !== -1) doc = doc.replace('</head>', '<style>' + css + '</style></head>');
    else doc = '<style>' + css + '</style>' + doc;
    document.getElementById('preview').srcdoc = doc;
  }

  // NO default preview — only after build
  document.getElementById('afterBuild').style.display = 'none';

  document.getElementById('btnBuild').onclick = function () {
    var idea = document.getElementById('idea').value.trim();
    if (idea.length < 5) return notify('Опишите идею чуть подробнее');
    var p = AK.parse(idea);
    var html = AK.buildHTML(idea, p.title, engine);
    var css = AK.buildCSS(p.tone);
    built = { name: p.title, description: idea, html: html, css: css, engine: engine, tone: p.tone };
    document.getElementById('afterBuild').style.display = 'block';
    showPreview(html, css);
    if (!document.getElementById('sub').value) {
      document.getElementById('sub').value =
        (p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 16)) || 'site';
    }
    notify('Черновик готов — укажите адрес');
    document.getElementById('afterBuild').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  document.querySelectorAll('#afterBuild .chip[data-mode]').forEach(function (c) {
    c.onclick = function () {
      mode = c.getAttribute('data-mode');
      document.querySelectorAll('#afterBuild .chip[data-mode]').forEach(function (x) {
        x.classList.toggle('on', x === c);
      });
      document.getElementById('subRow').style.display = mode === 'sub' ? 'block' : 'none';
      document.getElementById('customRow').style.display = mode === 'custom' ? 'block' : 'none';
    };
  });

  document.getElementById('btnSave').onclick = function () {
    if (!built) return notify('Сначала соберите сайт');
    var subdomain = '', domain = '', customDomain = '';
    if (mode === 'custom') {
      customDomain = document.getElementById('customDomain').value.trim().toLowerCase().replace(/^https?:\/\//, '');
      if (!customDomain || customDomain.indexOf('.') < 0) return notify('Пример: shop.ru');
      subdomain = customDomain.split('.')[0];
      domain = customDomain;
    } else {
      subdomain = document.getElementById('sub').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      domain = document.getElementById('tld').value;
      if (subdomain.length < 2) return notify('Укажите имя');
    }
    var full = customDomain || (subdomain + '.' + domain);
    if (isLocallyTaken(full)) return notify('Адрес занят');
    var list = AK.sites(session.login);
    list.unshift({
      id: 's_' + Date.now(),
      name: built.name,
      description: built.description,
      subdomain: subdomain,
      domain: domain,
      customDomain: customDomain,
      html: built.html,
      css: built.css,
      engine: built.engine,
      createdAt: new Date().toISOString()
    });
    AK.saveSites(session.login, list);
    notify('Сайт сохранён');
    location.hash = 'home';
  };

  // Domains: target URL + name + tld
  document.getElementById('btnDomainCheck').onclick = async function () {
    var target = normalizeUrl(document.getElementById('domainTarget').value);
    var name = document.getElementById('domainName').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    var tld = document.getElementById('domainTld').value;
    var res = document.getElementById('domainResult');
    var btnSave = document.getElementById('btnDomainSave');
    btnSave.style.display = 'none';
    pendingDomain = null;
    pendingTarget = '';
    if (!target) { res.style.color = '#f87171'; res.textContent = 'Вставьте ссылку на существующий сайт'; return; }
    if (!name) { res.style.color = '#f87171'; res.textContent = 'Введите имя'; return; }
    var domain = name + tld;
    res.style.color = 'var(--muted)';
    res.textContent = 'Проверяем…';
    try {
      var r = await checkDomain(domain);
      showResult(res, r);
      if (r.available) {
        pendingDomain = r.domain;
        pendingTarget = target;
        btnSave.style.display = 'inline-block';
      }
    } catch (e) {
      res.style.color = '#f87171';
      res.textContent = e.message;
    }
  };

  document.getElementById('btnDomainSave').onclick = function () {
    if (!pendingDomain || !pendingTarget) return;
    if (isLocallyTaken(pendingDomain)) return notify('Имя занято');
    var domains = AK.domains(session.login);
    domains.unshift({
      id: 'd_' + Date.now(),
      domain: pendingDomain,
      target: pendingTarget,
      checkedAt: new Date().toISOString()
    });
    AK.saveDomains(session.login, domains);
    notify('Домен создан → «Открыть» ведёт на ваш сайт');
    pendingDomain = null;
    pendingTarget = '';
    document.getElementById('btnDomainSave').style.display = 'none';
    document.getElementById('domainName').value = '';
    document.getElementById('domainTarget').value = '';
    document.getElementById('domainResult').textContent = '';
    renderSavedDomains();
  };

  document.getElementById('domainSearch').oninput = function () {
    renderSavedDomains();
  };

  function renderSavedDomains() {
    var q = (document.getElementById('domainSearch').value || '').toLowerCase().trim();
    var domains = AK.domains(session.login).filter(function (d) {
      if (!q) return true;
      return (d.domain || '').toLowerCase().indexOf(q) >= 0 || (d.target || '').toLowerCase().indexOf(q) >= 0;
    });
    var el = document.getElementById('savedDomains');
    if (!domains.length) { el.innerHTML = '<p class="sub">Список пуст</p>'; return; }
    el.innerHTML = domains.map(function (d) {
      return '<div class="card">' +
        '<div class="meta">' + AK.esc(d.domain) + '</div>' +
        '<p style="font-size:13px;color:var(--muted);word-break:break-all">→ ' + AK.esc(d.target || 'нет URL') + '</p>' +
        '<div class="actions">' +
        '<button type="button" data-dopen="' + d.id + '">Открыть сайт</button> ' +
        '<button type="button" data-dcopy="' + AK.esc(d.domain) + '">Копировать имя</button> ' +
        '<button type="button" data-ddel="' + d.id + '">Удалить</button>' +
        '</div></div>';
    }).join('');
    bindDomainActions(el);
  }

  document.getElementById('btnCopyAllDomains').onclick = function () {
    var list = AK.domains(session.login).map(function (d) { return d.domain; }).join('\n');
    if (!list) return notify('Пусто');
    navigator.clipboard.writeText(list).then(function () { notify('Скопировано'); });
  };
  document.getElementById('btnExportDomains').onclick = function () {
    var data = JSON.stringify(AK.domains(session.login), null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ai-craft-domains.json';
    a.click();
  };
  document.getElementById('btnClearDomains').onclick = function () {
    if (!confirm('Удалить все домены?')) return;
    AK.saveDomains(session.login, []);
    renderSavedDomains();
    notify('Очищено');
  };

  function syncSettings() {
    var s = AK.settings();
    document.getElementById('accInfo').textContent =
      (session.name || '') + ' · ' + (session.email || session.login || '');

    var sel = document.getElementById('langSelect');
    if (sel && !sel.options.length && typeof AK_I18N !== 'undefined') {
      AK_I18N.world.forEach(function (pair) {
        var o = document.createElement('option');
        o.value = pair[0];
        o.textContent = pair[1] + ' (' + pair[0] + ')';
        sel.appendChild(o);
      });
    }
    if (sel) sel.value = s.lang || 'ru';

    var de = document.getElementById('defaultEngine');
    if (de && !de.options.length) {
      AK.ENGINES.forEach(function (e) {
        var o = document.createElement('option');
        o.value = e; o.textContent = e;
        de.appendChild(o);
      });
    }
    if (de) de.value = s.engine || 'Host AI';

    document.querySelectorAll('#theme .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-v') === s.theme);
    });
    document.querySelectorAll('#accent .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-v') === s.accent);
    });
    document.querySelectorAll('#compact .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-v') === (s.compact || 'off'));
    });
    document.querySelectorAll('#toasts .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-v') === (s.toasts || 'on'));
    });
  }

  document.getElementById('langSelect').onchange = function () {
    AK.saveSettings({ lang: this.value });
    if (typeof AK_I18N !== 'undefined') AK_I18N.apply();
    notify('Язык сохранён');
  };
  document.getElementById('defaultEngine').onchange = function () {
    AK.saveSettings({ engine: this.value });
    engine = this.value;
    renderEngines();
    notify('Движок по умолчанию: ' + this.value);
  };
  document.querySelectorAll('#theme .chip').forEach(function (c) {
    c.onclick = function () { AK.saveSettings({ theme: c.getAttribute('data-v') }); syncSettings(); };
  });
  document.querySelectorAll('#accent .chip').forEach(function (c) {
    c.onclick = function () { AK.saveSettings({ accent: c.getAttribute('data-v') }); syncSettings(); };
  });
  document.querySelectorAll('#compact .chip').forEach(function (c) {
    c.onclick = function () {
      AK.saveSettings({ compact: c.getAttribute('data-v') });
      applyCompact();
      syncSettings();
    };
  });
  document.querySelectorAll('#toasts .chip').forEach(function (c) {
    c.onclick = function () {
      AK.saveSettings({ toasts: c.getAttribute('data-v') });
      syncSettings();
    };
  });

  document.getElementById('btnExportAll').onclick = function () {
    if (!session) return;
    var u = AK.users()[session.login] || {};
    var blob = new Blob([JSON.stringify({ user: session, data: u, settings: AK.settings() }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ai-craft-backup.json';
    a.click();
  };
  document.getElementById('btnImportAll').onclick = function () {
    document.getElementById('importFile').click();
  };
  document.getElementById('importFile').onchange = function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (data.settings) AK.saveSettings(data.settings);
        if (data.data && session) {
          var users = AK.users();
          users[session.login] = Object.assign(users[session.login] || {}, data.data);
          AK.saveUsers(users);
        }
        notify('Импорт выполнен');
        route();
      } catch (err) {
        notify('Неверный JSON');
      }
    };
    reader.readAsText(f);
  };

  if (session) showApp();
  else showGate();
})();
