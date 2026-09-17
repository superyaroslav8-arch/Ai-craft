(function () {
  if (typeof AK === 'undefined') {
    document.body.innerHTML = '<div class="wrap center"><h1>Ai-craft</h1><p>Ctrl+F5</p></div>';
    return;
  }
  AK.applyTheme();
  var session = AK.session();
  var isReg = false, built = null, bindId = null;
  var engine = AK.settings().engine || 'Host AI';

  function showGate() {
    document.getElementById('gate').style.display = 'block';
    document.getElementById('shell').style.display = 'none';
  }
  function showApp() {
    document.getElementById('gate').style.display = 'none';
    document.getElementById('shell').style.display = 'flex';
    document.getElementById('who').textContent = session.name || session.email;
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
    if (!confirm('Удалить все данные на этом устройстве?')) return;
    AK.deleteAccount(session.login);
    session = null;
    showGate();
    AK.toast('Данные удалены');
  };

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

  function isTaken(domain) {
    domain = String(domain || '').toLowerCase();
    var users = AK.users(), keys = Object.keys(users);
    for (var i = 0; i < keys.length; i++) {
      var u = users[keys[i]] || {};
      var sites = u.sites || [];
      for (var s = 0; s < sites.length; s++) {
        var a = ((sites[s].subdomain || '') + '.' + (sites[s].domain || '')).toLowerCase();
        if (a === domain) return true;
      }
      var domains = u.domains || [];
      for (var d = 0; d < domains.length; d++) {
        if (String(domains[d].domain || '').toLowerCase() === domain) return true;
      }
    }
    return false;
  }

  function normalizeUrl(url) {
    url = String(url || '').trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); return url; } catch (e) { return ''; }
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
    document.getElementById('statSites').textContent = sites.length;
    document.getElementById('statDomains').textContent = domains.length;

    var el = document.getElementById('siteList');
    if (!sites.length) {
      el.innerHTML = '<p class="sub">Пока нет сайтов. <a href="#create">Создать →</a></p>';
    } else {
      el.innerHTML = sites.map(function (s) {
        var addr = (s.subdomain || 'site') + '.' + (s.domain || 'ai_craft.ru');
        return '<div class="card"><h3>' + AK.esc(s.name) + '</h3><div class="meta">' + AK.esc(addr) +
          '</div><p style="color:var(--muted);font-size:12px">' + AK.esc(s.engine || '') + ' · ' + AK.esc(s.type || '') +
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
          if (!confirm('Удалить?')) return;
          AK.saveSites(session.login, AK.sites(session.login).filter(function (s) {
            return s.id !== b.getAttribute('data-del');
          }));
          renderHome();
        };
      });
    }

    var dl = document.getElementById('domainListHome');
    if (!domains.length) {
      dl.innerHTML = '<p class="sub">Нет доменов. <a href="#domains">Создать →</a></p>';
    } else {
      dl.innerHTML = domains.slice(0, 5).map(function (d) {
        return '<div class="card"><div class="meta">' + AK.esc(d.domain) + '</div>' +
          '<p style="font-size:12px;color:var(--muted)">' + (d.target ? ('→ ' + AK.esc(d.target)) : 'Не привязан') + '</p></div>';
      }).join('');
    }
  }

  function showPreview(html, css) {
    var doc = html;
    if (doc.indexOf('</head>') !== -1) doc = doc.replace('</head>', '<style>' + css + '</style></head>');
    else doc = '<style>' + css + '</style>' + doc;
    document.getElementById('preview').srcdoc = doc;
  }

  document.getElementById('afterBuild').style.display = 'none';

  document.getElementById('btnBuild').onclick = function () {
    var idea = document.getElementById('idea').value.trim();
    if (idea.length < 5) return AK.toast('Опишите идею подробнее');
    var type = AK.detectType(idea);
    var manual = document.getElementById('siteTitle').value.trim();
    var title = manual || AK.suggestTitle(idea, type);
    if (!manual) document.getElementById('siteTitle').value = title;
    var html = AK.buildHTML(idea, title, engine);
    var css = AK.buildCSS(type);
    built = { name: title, description: idea, html: html, css: css, engine: engine, type: type };
    document.getElementById('afterBuild').style.display = 'block';
    showPreview(html, css);
    var slug = title.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-|-$/g, '').slice(0, 16);
    slug = slug.replace(/[а-яё]/gi, function (ch) {
      var map = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
      return map[ch.toLowerCase()] || '';
    }) || 'site';
    if (!document.getElementById('sub').value) document.getElementById('sub').value = slug;
    AK.toast('Собран тип: ' + type + ' · «' + title + '»');
    document.getElementById('afterBuild').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  document.getElementById('btnSave').onclick = function () {
    if (!built) return AK.toast('Сначала соберите сайт');
    var subdomain = document.getElementById('sub').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    var domain = document.getElementById('tld').value;
    if (subdomain.length < 2) return AK.toast('Укажите имя адреса');
    var full = subdomain + '.' + domain;
    if (isTaken(full)) return AK.toast('Адрес занят');
    var list = AK.sites(session.login);
    list.unshift({
      id: 's_' + Date.now(),
      name: built.name,
      description: built.description,
      subdomain: subdomain,
      domain: domain,
      html: built.html,
      css: built.css,
      engine: built.engine,
      type: built.type,
      createdAt: new Date().toISOString()
    });
    AK.saveSites(session.login, list);
    AK.toast('Сохранено');
    location.hash = 'home';
  };

  document.getElementById('btnDomainCreate').onclick = function () {
    var name = document.getElementById('domainName').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    var tld = document.getElementById('domainTld').value;
    var res = document.getElementById('domainResult');
    if (!name || name.length < 2) {
      res.style.color = '#f87171';
      res.textContent = 'Введите имя (от 2 символов)';
      return;
    }
    var domain = name + tld;
    if (isTaken(domain)) {
      res.style.color = '#f87171';
      res.textContent = '✕ ' + domain + ' занят';
      return;
    }
    var domains = AK.domains(session.login);
    var id = 'd_' + Date.now();
    domains.unshift({ id: id, domain: domain, target: '', note: '', createdAt: new Date().toISOString() });
    AK.saveDomains(session.login, domains);
    res.style.color = '#4ade80';
    res.textContent = '✓ ' + domain + ' создан';
    document.getElementById('domainName').value = '';
    bindId = id;
    document.getElementById('bindBox').style.display = 'block';
    document.getElementById('bindDomainLabel').textContent = domain;
    document.getElementById('domainTarget').value = '';
    renderSavedDomains();
    AK.toast('Домен создан');
  };

  document.getElementById('btnDomainBind').onclick = function () {
    if (!bindId) return;
    var url = normalizeUrl(document.getElementById('domainTarget').value);
    if (!url) return AK.toast('Укажите URL');
    var domains = AK.domains(session.login);
    for (var i = 0; i < domains.length; i++) {
      if (domains[i].id === bindId) { domains[i].target = url; break; }
    }
    AK.saveDomains(session.login, domains);
    AK.toast('Привязано');
    document.getElementById('bindBox').style.display = 'none';
    bindId = null;
    renderSavedDomains();
  };

  function renderSavedDomains() {
    var domains = AK.domains(session.login);
    var el = document.getElementById('savedDomains');
    if (!domains.length) { el.innerHTML = '<p class="sub">Пока пусто</p>'; return; }
    el.innerHTML = domains.map(function (d) {
      return '<div class="card"><div class="meta">' + AK.esc(d.domain) + '</div>' +
        '<p style="font-size:13px;color:var(--muted)">' + (d.target ? ('→ ' + AK.esc(d.target)) : 'Не привязан') +
        (d.note ? (' · ' + AK.esc(d.note)) : '') + '</p>' +
        '<div class="actions">' +
        (d.target ? '<button type="button" data-dopen="' + d.id + '">Открыть</button> ' : '') +
        '<button type="button" data-dbind="' + d.id + '">Привязать</button> ' +
        '<button type="button" data-dunbind="' + d.id + '">Отвязать</button> ' +
        '<button type="button" data-dnote="' + d.id + '">Заметка</button> ' +
        '<button type="button" data-ddup="' + d.id + '">Копия</button> ' +
        '<button type="button" data-dcopy="' + AK.esc(d.domain) + '">Копировать</button> ' +
        '<button type="button" data-ddel="' + d.id + '">Удалить</button>' +
        '</div></div>';
    }).join('');

    el.querySelectorAll('[data-dopen]').forEach(function (b) {
      b.onclick = function () {
        var d = AK.domains(session.login).find(function (x) { return x.id === b.getAttribute('data-dopen'); });
        if (d && d.target) window.open(d.target, '_blank', 'noopener');
      };
    });
    el.querySelectorAll('[data-dbind]').forEach(function (b) {
      b.onclick = function () {
        bindId = b.getAttribute('data-dbind');
        var d = AK.domains(session.login).find(function (x) { return x.id === bindId; });
        if (!d) return;
        document.getElementById('bindBox').style.display = 'block';
        document.getElementById('bindDomainLabel').textContent = d.domain;
        document.getElementById('domainTarget').value = d.target || '';
        document.getElementById('bindBox').scrollIntoView({ behavior: 'smooth' });
      };
    });
    el.querySelectorAll('[data-dunbind]').forEach(function (b) {
      b.onclick = function () {
        var domains = AK.domains(session.login);
        for (var i = 0; i < domains.length; i++) {
          if (domains[i].id === b.getAttribute('data-dunbind')) { domains[i].target = ''; break; }
        }
        AK.saveDomains(session.login, domains);
        renderSavedDomains();
        AK.toast('Отвязано');
      };
    });
    el.querySelectorAll('[data-dnote]').forEach(function (b) {
      b.onclick = function () {
        var note = prompt('Заметка к домену', '');
        if (note === null) return;
        var domains = AK.domains(session.login);
        for (var i = 0; i < domains.length; i++) {
          if (domains[i].id === b.getAttribute('data-dnote')) { domains[i].note = note.slice(0, 80); break; }
        }
        AK.saveDomains(session.login, domains);
        renderSavedDomains();
      };
    });
    el.querySelectorAll('[data-ddup]').forEach(function (b) {
      b.onclick = function () {
        var src = AK.domains(session.login).find(function (x) { return x.id === b.getAttribute('data-ddup'); });
        if (!src) return;
        var base = src.domain.split('.')[0];
        var tld = '.' + src.domain.split('.').slice(1).join('.');
        var n = 2, candidate = base + n + tld;
        while (isTaken(candidate) && n < 50) { n++; candidate = base + n + tld; }
        if (isTaken(candidate)) return AK.toast('Не удалось');
        var domains = AK.domains(session.login);
        domains.unshift({
          id: 'd_' + Date.now(),
          domain: candidate,
          target: src.target || '',
          note: src.note || '',
          createdAt: new Date().toISOString()
        });
        AK.saveDomains(session.login, domains);
        renderSavedDomains();
        AK.toast('Копия: ' + candidate);
      };
    });
    el.querySelectorAll('[data-dcopy]').forEach(function (b) {
      b.onclick = function () {
        navigator.clipboard.writeText(b.getAttribute('data-dcopy')).then(function () { AK.toast('Скопировано'); });
      };
    });
    el.querySelectorAll('[data-ddel]').forEach(function (b) {
      b.onclick = function () {
        if (!confirm('Удалить?')) return;
        AK.saveDomains(session.login, AK.domains(session.login).filter(function (d) {
          return d.id !== b.getAttribute('data-ddel');
        }));
        renderSavedDomains();
      };
    });
  }

  function syncSettings() {
    var s = AK.settings();
    document.getElementById('accInfo').textContent =
      (session.name || '') + ' · ' + (session.email || session.login || '');
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
  }

  document.getElementById('defaultEngine').onchange = function () {
    AK.saveSettings({ engine: this.value });
    engine = this.value;
    renderEngines();
  };
  document.querySelectorAll('#theme .chip').forEach(function (c) {
    c.onclick = function () { AK.saveSettings({ theme: c.getAttribute('data-v') }); syncSettings(); };
  });
  document.querySelectorAll('#accent .chip').forEach(function (c) {
    c.onclick = function () { AK.saveSettings({ accent: c.getAttribute('data-v') }); syncSettings(); };
  });

  if (session) showApp();
  else showGate();
})();
