(function () {
  if (typeof AK === 'undefined') {
    document.body.innerHTML = '<div class="wrap center"><h1>Ai-craft</h1><p>Ctrl+F5</p></div>';
    return;
  }
  AK.applyTheme();
  var session = AK.session();
  var isReg = false, built = null, mode = 'sub', pendingDomain = null;
  var engine = AK.settings().engine || 'Host AI';

  function t(k) { return (typeof AK_I18N !== 'undefined') ? AK_I18N.t(k) : k; }
  function applyI18n() { if (typeof AK_I18N !== 'undefined') AK_I18N.apply(); }

  function showGate() {
    document.getElementById('gate').style.display = 'block';
    document.getElementById('shell').style.display = 'none';
  }
  function showApp() {
    document.getElementById('gate').style.display = 'none';
    document.getElementById('shell').style.display = 'flex';
    document.getElementById('who').textContent = session.name || session.email;
    applyI18n();
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

  function doLogout() {
    AK.clearSession();
    session = null;
    showGate();
  }
  document.getElementById('logoutSide').onclick = function (e) { e.preventDefault(); doLogout(); };
  document.getElementById('btnLogout').onclick = doLogout;
  document.getElementById('btnDeleteAcc').onclick = function () {
    if (!session) return;
    if (!confirm('Удалить все данные этого аккаунта на этом устройстве?')) return;
    AK.deleteAccount(session.login);
    session = null;
    showGate();
    AK.toast('Данные удалены');
  };

  // Engines
  (function renderEngines() {
    var box = document.getElementById('engineChips');
    if (!box) return;
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
      };
    });
  })();

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
    if (tld !== 'ru' && tld !== 'com' && tld !== 'dev') throw new Error('Зоны: .ru .com .dev или *.ai_craft.*');
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
      el.innerHTML = '✓ <strong>' + AK.esc(r.domain) + '</strong> — свободен. Можно сохранить.';
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
      el.innerHTML = '<p class="sub">' + t('noSites') + ' <a href="#create">→</a></p>';
    } else {
      el.innerHTML = sites.map(function (s) {
        var addr = s.customDomain || ((s.subdomain || 'site') + '.' + (s.domain || 'ai_craft.ru'));
        return '<div class="card"><h3>' + AK.esc(s.name) + '</h3><div class="meta">' + AK.esc(addr) +
          '</div><p style="color:var(--muted);font-size:12px">' + AK.esc(s.engine || '') +
          '</p><p style="color:var(--muted);font-size:13px">' + AK.esc((s.description || '').slice(0, 100)) +
          '</p><div class="actions"><button type="button" data-open="' + s.id + '">' + t('open') +
          '</button> <button type="button" data-del="' + s.id + '">' + t('del') + '</button></div></div>';
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
          if (!confirm(t('del') + '?')) return;
          AK.saveSites(session.login, AK.sites(session.login).filter(function (s) {
            return s.id !== b.getAttribute('data-del');
          }));
          renderHome();
        };
      });
    }
    var dl = document.getElementById('domainListHome');
    if (!domains.length) dl.innerHTML = '<p class="sub">—</p>';
    else {
      dl.innerHTML = domains.map(function (d) {
        return '<div class="card"><div class="meta">' + AK.esc(d.domain) +
          '</div><div class="actions"><button type="button" data-ddel="' + d.id + '">' + t('del') + '</button></div></div>';
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
    if (!links.length) { el.innerHTML = '<p class="sub">—</p>'; return; }
    el.innerHTML = links.map(function (l) {
      return '<div class="card"><strong>' + AK.esc(l.title) + '</strong><div class="meta">ai-craft/' + AK.esc(l.slug) +
        '</div><div style="font-size:13px;color:var(--muted)">' + AK.esc(l.url) +
        '</div><div class="actions"><button type="button" data-copy="ai-craft/' + AK.esc(l.slug) +
        '">Copy</button> <button type="button" data-ldel="' + l.id + '">' + t('del') + '</button></div></div>';
    }).join('');
    el.querySelectorAll('[data-copy]').forEach(function (b) {
      b.onclick = function () {
        navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () { AK.toast('OK'); });
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
    var url = document.getElementById('linkUrl').value.trim();
    if (!url) return AK.toast('URL');
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
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
    AK.toast(t('createLink'));
  };

  function showPreview(html, css) {
    var doc = html;
    if (doc.indexOf('</head>') !== -1) doc = doc.replace('</head>', '<style>' + css + '</style></head>');
    else doc = '<style>' + css + '</style>' + doc;
    document.getElementById('preview').srcdoc = doc;
  }

  document.getElementById('btnBuild').onclick = function () {
    var idea = document.getElementById('idea').value.trim();
    if (idea.length < 5) return AK.toast('Чуть подробнее');
    var p = AK.parse(idea);
    var html = AK.buildHTML(idea, p.title, engine);
    var css = AK.buildCSS(p.tone);
    built = { name: p.title, description: idea, html: html, css: css, engine: engine, tone: p.tone };
    showPreview(html, css);
    document.getElementById('addrBox').style.display = 'block';
    if (!document.getElementById('sub').value) {
      document.getElementById('sub').value =
        (p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 16)) || 'site';
    }
    AK.toast('Черновик готов → адрес');
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
    if (isLocallyTaken(full)) return AK.toast('Адрес занят');
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
    if (!name) { res.style.color = '#f87171'; res.textContent = 'Введите имя'; return; }
    var domain = name + tld;
    res.style.color = 'var(--muted)';
    res.textContent = '…';
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
    if (isLocallyTaken(pendingDomain)) return AK.toast('Занят');
    var domains = AK.domains(session.login);
    domains.unshift({ id: 'd_' + Date.now(), domain: pendingDomain, checkedAt: new Date().toISOString() });
    AK.saveDomains(session.login, domains);
    AK.toast('Домен сохранён');
    pendingDomain = null;
    document.getElementById('btnDomainSave').style.display = 'none';
    renderSavedDomains();
  };

  function renderSavedDomains() {
    var domains = AK.domains(session.login);
    var el = document.getElementById('savedDomains');
    if (!domains.length) { el.innerHTML = '<p class="sub">—</p>'; return; }
    el.innerHTML = domains.map(function (d) {
      return '<div class="card"><div class="meta">' + AK.esc(d.domain) +
        '</div><div class="actions"><button type="button" data-ddel="' + d.id + '">' + t('del') + '</button></div></div>';
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
    document.querySelectorAll('#theme .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-v') === s.theme);
    });
    document.querySelectorAll('#accent .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-v') === s.accent);
    });
  }

  document.getElementById('langSelect').onchange = function () {
    AK.saveSettings({ lang: this.value });
    applyI18n();
    syncSettings();
    if (session) renderHome();
  };
  document.querySelectorAll('#theme .chip').forEach(function (c) {
    c.onclick = function () {
      AK.saveSettings({ theme: c.getAttribute('data-v') });
      syncSettings();
    };
  });
  document.querySelectorAll('#accent .chip').forEach(function (c) {
    c.onclick = function () {
      AK.saveSettings({ accent: c.getAttribute('data-v') });
      syncSettings();
    };
  });

  var demo = AK.buildHTML('Сайт с воздухом и тёплым светом.', 'Превью', engine);
  showPreview(demo, AK.buildCSS('warm'));
  applyI18n();
  if (session) showApp();
  else showGate();
})();
