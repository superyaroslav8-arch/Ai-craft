(function () {
  if (typeof AK === 'undefined') {
    document.body.innerHTML = '<div class="wrap center"><h1>Ai-craft</h1><p>Ctrl+F5</p></div>';
    return;
  }
  AK.applyTheme();
  var session = AK.session();
  var isReg = false, built = null, mode = 'sub', pendingDomain = null;

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
      showApp();
      location.hash = 'home';
    } catch (e) {
      err.textContent = e.message || 'Ошибка';
      err.style.display = 'block';
    }
  };
  document.getElementById('logout').onclick = function (e) {
    e.preventDefault();
    AK.clearSession();
    session = null;
    showGate();
  };

  function isLocallyTaken(domain) {
    domain = String(domain || '').toLowerCase();
    var users = AK.users();
    var keys = Object.keys(users);
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
      throw new Error('Зоны: .ru .com .dev или *.ai_craft.*');
    }
    var response = await fetch('https://dns.google/resolve?name=' + encodeURIComponent(domain) + '&type=NS');
    if (!response.ok) throw new Error('Сервис проверки не ответил');
    var data = await response.json();
    if (data.Status === 3) return { domain: domain, available: true, reason: 'dns' };
    if (data.Status === 0 && data.Answer && data.Answer.length) return { domain: domain, available: false, reason: 'dns' };
    return { domain: domain, available: true, reason: 'dns' };
  }

  function showResult(el, r) {
    if (r.available) {
      el.style.color = '#4ade80';
      el.innerHTML = '✓ <strong>' + AK.esc(r.domain) + '</strong> — доступен. ' +
        (r.reason === 'platform' ? 'Метка в Ai-craft.' : 'Проверка DNS, не покупка у регистратора.');
    } else {
      el.style.color = '#f87171';
      el.innerHTML = '✕ <strong>' + AK.esc(r.domain) + '</strong> — занят. Выберите другое имя.';
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
      el.innerHTML = '<p class="sub">Нет сайтов. <a href="#create">Создать</a></p>';
    } else {
      el.innerHTML = sites.map(function (s) {
        var addr = s.customDomain || ((s.subdomain || 'site') + '.' + (s.domain || 'ai_craft.ru'));
        return '<div class="card"><h3>' + AK.esc(s.name) + '</h3><div class="meta">' + AK.esc(addr) +
          '</div><p style="color:var(--muted);font-size:13px">' + AK.esc((s.description || '').slice(0, 100)) +
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
      dl.innerHTML = '<p class="sub">Нет доменов. <a href="#domains">Проверить</a></p>';
    } else {
      dl.innerHTML = domains.map(function (d) {
        return '<div class="card"><div class="meta">' + AK.esc(d.domain) +
          '</div><div class="actions"><button type="button" data-ddel="' + d.id + '">Удалить</button></div></div>';
      }).join('');
      dl.querySelectorAll('[data-ddel]').forEach(function (b) {
        b.onclick = function () {
          AK.saveDomains(session.login, AK.domains(session.login).filter(function (d) {
            return d.id !== b.getAttribute('data-ddel');
          }));
          renderHome();
        };
      });
    }
    renderLinks();
  }

  function renderLinks() {
    var links = AK.links(session.login);
    var el = document.getElementById('linkList');
    if (!links.length) { el.innerHTML = '<p class="sub">Нет ссылок</p>'; return; }
    el.innerHTML = links.map(function (l) {
      return '<div class="card"><div class="meta">ai-craft/' + AK.esc(l.slug) + '</div><div style="font-size:13px">' +
        AK.esc(l.url) + '</div><div class="actions"><button type="button" data-copy="ai-craft/' + AK.esc(l.slug) +
        '">Копировать</button> <button type="button" data-ldel="' + l.id + '">Удалить</button></div></div>';
    }).join('');
    el.querySelectorAll('[data-copy]').forEach(function (b) {
      b.onclick = function () {
        navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () { AK.toast('Скопировано'); });
      };
    });
    el.querySelectorAll('[data-ldel]').forEach(function (b) {
      b.onclick = function () {
        AK.saveLinks(session.login, AK.links(session.login).filter(function (l) {
          return l.id !== b.getAttribute('data-ldel');
        }));
        renderLinks();
        renderHome();
      };
    });
  }

  document.getElementById('btnLink').onclick = function () {
    var url = document.getElementById('linkUrl').value.trim();
    if (!url) return AK.toast('Укажите URL');
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
    AK.toast('Ссылка создана');
  };

  function showPreview(html, css) {
    var doc = html;
    if (doc.indexOf('</head>') !== -1) doc = doc.replace('</head>', '<style>' + css + '</style></head>');
    else doc = '<style>' + css + '</style>' + doc;
    document.getElementById('preview').srcdoc = doc;
  }

  document.getElementById('btnBuild').onclick = function () {
    var idea = document.getElementById('idea').value.trim();
    if (idea.length < 5) return AK.toast('Опишите подробнее');
    var p = AK.parse(idea);
    built = {
      name: p.title,
      description: idea,
      html: AK.buildHTML(idea, p.title),
      css: AK.buildCSS()
    };
    showPreview(built.html, built.css);
    document.getElementById('addrBox').style.display = 'block';
    if (!document.getElementById('sub').value) {
      document.getElementById('sub').value =
        (p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 16)) || 'site';
    }
    AK.toast('Собрано');
  };

  document.querySelectorAll('#addrBox .chip').forEach(function (c) {
    c.onclick = function () {
      mode = c.getAttribute('data-mode');
      document.querySelectorAll('#addrBox .chip').forEach(function (x) { x.classList.toggle('on', x === c); });
      document.getElementById('subRow').style.display = mode === 'sub' ? 'block' : 'none';
      document.getElementById('customRow').style.display = mode === 'custom' ? 'block' : 'none';
    };
  });

  document.getElementById('btnSave').onclick = function () {
    if (!built) return AK.toast('Сначала соберите сайт');
    var subdomain = '', domain = '', customDomain = '';
    if (mode === 'custom') {
      customDomain = document.getElementById('customDomain').value.trim().toLowerCase().replace(/^https?:\/\//, '');
      if (!customDomain || customDomain.indexOf('.') < 0) return AK.toast('Пример: shop.ru');
      subdomain = customDomain.split('.')[0];
      domain = customDomain;
    } else {
      subdomain = document.getElementById('sub').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      domain = document.getElementById('tld').value;
      if (subdomain.length < 2) return AK.toast('Укажите имя');
    }
    var full = customDomain || (subdomain + '.' + domain);
    if (isLocallyTaken(full)) return AK.toast('Адрес занят. Выберите другой.');
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
      createdAt: new Date().toISOString()
    });
    AK.saveSites(session.login, list);
    AK.toast('Сайт сохранён');
    location.hash = 'home';
  };

  document.getElementById('btnDomainCheck').onclick = async function () {
    var name = document.getElementById('domainName').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    var tld = document.getElementById('domainTld').value;
    var res = document.getElementById('domainResult');
    var btnSave = document.getElementById('btnDomainSave');
    btnSave.style.display = 'none';
    pendingDomain = null;
    if (!name) {
      res.style.color = '#f87171';
      res.textContent = 'Введите имя';
      return;
    }
    var domain = name + tld;
    res.style.color = 'var(--muted)';
    res.textContent = 'Проверяем…';
    try {
      var r = await checkDomain(domain);
      showResult(res, r);
      if (r.available) {
        pendingDomain = r.domain;
        btnSave.style.display = 'inline-block';
      }
    } catch (e) {
      res.style.color = '#f87171';
      res.textContent = e.message;
    }
  };

  document.getElementById('btnDomainSave').onclick = function () {
    if (!pendingDomain) return;
    if (isLocallyTaken(pendingDomain)) return AK.toast('Уже занят');
    var domains = AK.domains(session.login);
    domains.unshift({
      id: 'd_' + Date.now(),
      domain: pendingDomain,
      checkedAt: new Date().toISOString()
    });
    AK.saveDomains(session.login, domains);
    AK.toast('Домен сохранён');
    pendingDomain = null;
    document.getElementById('btnDomainSave').style.display = 'none';
    renderSavedDomains();
  };

  document.getElementById('btnAutoDomain').onclick = async function () {
    var name = document.getElementById('autoDomainName').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    var box = document.getElementById('autoDomainResults');
    if (!name) return AK.toast('Введите название');
    box.innerHTML = '<p class="sub">Проверяем .ru .com .dev…</p>';
    var tlds = ['.ru', '.com', '.dev'];
    var html = '';
    for (var i = 0; i < tlds.length; i++) {
      try {
        var r = await checkDomain(name + tlds[i]);
        html += '<div class="card" style="margin-bottom:8px"><strong>' + AK.esc(r.domain) + '</strong> — ' +
          (r.available ? '<span style="color:#4ade80">свободен</span>' : '<span style="color:#f87171">занят</span>');
        if (r.available) {
          html += ' <button type="button" class="chip" data-pick="' + AK.esc(r.domain) + '">Сохранить</button>';
        }
        html += '</div>';
      } catch (e) {
        html += '<div class="card">' + AK.esc(name + tlds[i]) + ': ошибка</div>';
      }
    }
    box.innerHTML = html;
    box.querySelectorAll('[data-pick]').forEach(function (b) {
      b.onclick = function () {
        var d = b.getAttribute('data-pick');
        if (isLocallyTaken(d)) return AK.toast('Занят');
        var domains = AK.domains(session.login);
        domains.unshift({ id: 'd_' + Date.now(), domain: d, checkedAt: new Date().toISOString() });
        AK.saveDomains(session.login, domains);
        AK.toast('Сохранено');
        renderSavedDomains();
      };
    });
  };

  function renderSavedDomains() {
    var domains = AK.domains(session.login);
    var el = document.getElementById('savedDomains');
    if (!domains.length) {
      el.innerHTML = '<p class="sub">Пока пусто</p>';
      return;
    }
    el.innerHTML = domains.map(function (d) {
      return '<div class="card"><div class="meta">' + AK.esc(d.domain) +
        '</div><div class="actions"><button type="button" data-ddel="' + d.id + '">Удалить</button></div></div>';
    }).join('');
    el.querySelectorAll('[data-ddel]').forEach(function (b) {
      b.onclick = function () {
        AK.saveDomains(session.login, AK.domains(session.login).filter(function (d) {
          return d.id !== b.getAttribute('data-ddel');
        }));
        renderSavedDomains();
      };
    });
  }

  function syncSettings() {
    var s = AK.settings();
    document.querySelectorAll('#lang .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-v') === (s.lang || 'ru'));
    });
    document.querySelectorAll('#theme .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-v') === s.theme);
    });
    document.querySelectorAll('#accent .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-v') === s.accent);
    });
  }
  document.querySelectorAll('#lang .chip').forEach(function (c) {
    c.onclick = function () { AK.saveSettings({ lang: c.getAttribute('data-v') }); syncSettings(); };
  });
  document.querySelectorAll('#theme .chip').forEach(function (c) {
    c.onclick = function () { AK.saveSettings({ theme: c.getAttribute('data-v') }); syncSettings(); };
  });
  document.querySelectorAll('#accent .chip').forEach(function (c) {
    c.onclick = function () { AK.saveSettings({ accent: c.getAttribute('data-v') }); syncSettings(); };
  });

  showPreview(AK.buildHTML('Превью', 'Ai-craft'), AK.buildCSS());
  if (session) showApp();
  else showGate();
})();
