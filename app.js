(function () {
  'use strict';

  var C = window.APP_CONFIG;
  var app = document.getElementById('app');
  var items = [];
  var groups = [];
  var lastHash = '';

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function initials(s) {
    var t = String(s || '').trim();
    var w = t.split(/\s+/).filter(Boolean);
    return (w.length > 1 ? w[0].charAt(0) + w[1].charAt(0) : t.slice(0, 2)).toUpperCase();
  }

  function catByLabel(label) {
    var n = norm(label);
    for (var i = 0; i < C.categories.length; i++) {
      if (norm(C.categories[i].label) === n) return C.categories[i];
    }
    return null;
  }

  function catByName(name) {
    var n = norm(name);
    for (var i = 0; i < C.categories.length; i++) {
      var c = C.categories[i];
      for (var j = 0; j < c.patterns.length; j++) {
        if (n.indexOf(c.patterns[j]) !== -1) return c;
      }
    }
    return null;
  }

  function resolve(item) {
    var cat;
    if (item.category) {
      cat = catByLabel(item.category) || { label: item.category, rank: 99, initials: initials(item.category), custom: true };
    } else {
      cat = catByName(item.name) || { label: 'Sin clasificar', rank: 99, initials: '--', custom: true };
    }
    return Object.assign({}, item, { cat: cat });
  }

  function load() {
    items = [];
    if (C.data.sheetUrl) {
      return fetch(C.data.sheetUrl, { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (json) {
          items = (json.items || []).map(resolve);
        })
        .catch(function (err) {
          console.error('No se pudo cargar el catálogo', err);
          if (C.data.useSample) items = C.sample.items.map(resolve);
        });
    }
    if (C.data.useSample) {
      items = C.sample.items.map(function (i) {
        return resolve({ id: null, category: i.category, name: i.name, duration: i.duration });
      });
    }
    return Promise.resolve();
  }

  function buildGroups() {
    var map = {};
    for (var i = 0; i < items.length; i++) {
      var key = items[i].cat.label;
      (map[key] = map[key] || []).push(items[i]);
    }
    var out = [];
    for (var k in map) {
      var cat = catByLabel(k) || { label: k, rank: 99, initials: initials(k), custom: true };
      out.push({ cat: cat, list: map[k], count: map[k].length });
    }
    out.sort(function (a, b) {
      return (a.cat.rank || 99) - (b.cat.rank || 99) || a.cat.label.localeCompare(b.cat.label, 'es');
    });
    return out;
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function topbar(showBack) {
    var back = showBack
      ? '<button class="btn-back" id="btn-back"><span>←</span> Volver</button>'
      : '';
    return (
      back +
      '<header class="topbar">' +
      '<img class="crest" src="' + esc(C.club.logo) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
      '<div class="titles">' +
      '<h1>' + esc(C.club.name) + '</h1>' +
      '<p>' + esc(C.club.tagline) + '</p>' +
      '</div></header>'
    );
  }

  function thumb(id) {
    return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w400';
  }

  function homeView() {
    var html = topbar(false);
    html +=
      '<div class="hero"><h2>Videoteca ABP</h2><p>Elige un tipo de jugada para ver las acciones del equipo.</p></div>';

    if (!C.data.sheetUrl && C.data.useSample) {
      html +=
        '<div class="notice"><b>Vista previa con datos de ejemplo.</b> Conecta tu catálogo de Google Sheets (guía en README.md) y pon <b>useSample: false</b> en config.js para ver los vídeos reales.</div>';
    } else if (!C.data.sheetUrl && !C.data.useSample) {
      html +=
        '<div class="notice"><b>Catálogo sin configurar.</b> Añade la URL de tu hoja en <b>data.sheetUrl</b> de config.js. Mira el README.md.</div>';
    }

    if (groups.length === 0) {
      html +=
        '<div class="empty-state"><div class="big">/</div>No hay jugadas todavía.<br>Cuando añadas vídeos en la hoja aparecerán aquí.</div>';
    } else {
      html += '<div class="section-title">Tipos de ABP</div><div class="grid">';
      for (var i = 0; i < groups.length; i++) {
        var g = groups[i];
        html +=
          '<button class="tile" data-cat="' + esc(g.cat.label) + '">' +
          '<span class="label">' + esc(g.cat.label) + '</span>' +
          '<span class="count">' + g.count + ' jugada' + (g.count === 1 ? '' : 's') + '</span>' +
          '</button>';
      }
      html += '</div>';
    }

    html += '<footer>' + esc(C.club.name) + ' · Videoteca a balón parado</footer>';
    app.innerHTML = html;
    attachHome();
  }

  function attachHome() {
    var tiles = app.querySelectorAll('.tile[data-cat]');
    for (var i = 0; i < tiles.length; i++) {
      (function (t) {
        t.addEventListener('click', function () {
          location.hash = '#/cat/' + encodeURIComponent(t.getAttribute('data-cat'));
        });
      })(tiles[i]);
    }
  }

  function catView(catLabel) {
    var g = findGroup(catLabel);
    if (!g) return homeView();
    var html = topbar(true);
    html += '<span class="chip">' + esc(g.cat.label) + ' · ' + g.count + ' jugadas</span>';
    html += '<div class="section-title">Jugadas</div><div class="vlist">';
    for (var i = 0; i < g.list.length; i++) {
      html += videoItem(g.list[i]);
    }
    html += '</div>';
    app.innerHTML = html;
    attachBack();
    attachVideos();
  }

  function videoItem(it) {
    var sub = it.duration ? '<span>⏱ ' + esc(it.duration) + '</span>' : '';
    if (it.id) {
      return (
        '<div class="vitem" data-id="' + esc(it.id) + '">' +
        '<div class="vthumb"><img loading="lazy" src="' + thumb(it.id) + '" alt="" onerror="this.remove()"></div>' +
        '<div class="meta"><div class="video-label">' + esc(it.name) + '</div><div class="sub">' + sub + '</div></div>' +
        '<span class="chev">›</span></div>'
      );
    }
    return (
      '<div class="vitem" data-id="demo">' +
      '<div class="vthumb">MP4</div>' +
      '<div class="meta"><div class="video-label">' + esc(it.name) + '</div><div class="sub">' + sub + '</div></div>' +
      '<span class="chev">›</span></div>'
    );
  }

  function playView(id) {
    var it = null;
    for (var i = 0; i < items.length; i++) {
      if (String(items[i].id) === id) it = items[i];
    }
    if (!it) {
      if (id === 'demo' && items.length) it = items[0];
    }
    if (!it) return homeView();

    var html = topbar(true);
    html += '<div class="player-wrap">';
    if (it.id) {
      html +=
        '<iframe class="player-frame" src="https://drive.google.com/file/d/' +
        encodeURIComponent(it.id) +
        '/preview" allow="autoplay" allowfullscreen></iframe>';
    } else {
      html +=
        '<div class="player-frame" style="display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:0.9rem;padding:16px;text-align:center">Vista previa con datos de ejemplo.<br>Conecta tu catálogo para reproducir vídeos reales.</div>';
    }
    html += '</div>';
    if (it.id) {
      html +=
        '<p class="player-note">Si el vídeo no se carga, asegúrate de que la carpeta de Drive está compartida para "Cualquier persona con el enlace" y vuelve a intentarlo.</p>';
    }
    html += '<div class="chip">' + esc(it.cat.label) + '</div>';
    html += '<div class="doc-title">' + esc(it.name) + '</div>';
    app.innerHTML = html;
    attachBack();
  }

  function attachBack() {
    var b = document.getElementById('btn-back');
    if (b) b.addEventListener('click', function () { history.back(); });
  }

  function attachVideos() {
    var vs = app.querySelectorAll('.vitem[data-id]');
    for (var i = 0; i < vs.length; i++) {
      (function (v) {
        v.addEventListener('click', function () {
          location.hash = '#/play/' + encodeURIComponent(v.getAttribute('data-id'));
        });
      })(vs[i]);
    }
  }

  function findGroup(label) {
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].cat.label === label) return groups[i];
    }
    return null;
  }

  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('/');
    var seg = parts[0];
    var arg = parts.slice(1).join('/');
    groups = buildGroups();
    if (seg === 'cat' && arg) return catView(decodeURIComponent(arg));
    if (seg === 'play' && arg) return playView(decodeURIComponent(arg));
    return homeView();
  }

  window.addEventListener('hashchange', function () {
    if (location.hash === lastHash && items.length) return;
    lastHash = location.hash;
    route();
  });

  load().then(function () { route(); });
})();