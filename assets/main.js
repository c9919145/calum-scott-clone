(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var PHOTOS = [];
  var trackLoops = [];
  (function preloadPhotoList() {
    for (var i = 1; i <= 74; i++) {
      PHOTOS.push('images/scotties/g' + i + '.jpg');
    }
  })();

  /* ---------- Preloader ---------- */
  var preloadScreen = document.getElementById('preload-screen');

  function hidePreloader() {
    if (!preloadScreen) return;
    requestAnimationFrame(function () {
      setTimeout(function () {
        preloadScreen.classList.add('off--ready');
      }, 1200);
    });
  }

  if (window.location.hash === '#skip-preload') {
    preloadScreen && preloadScreen.classList.add('off--ready');
  } else if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    preloadScreen && preloadScreen.classList.add('off--ready');
  } else {
    var heroVideo = document.querySelector('.hero__video');
    if (heroVideo && heroVideo.readyState >= 3) {
      hidePreloader();
    } else {
      window.addEventListener('load', hidePreloader);
      setTimeout(hidePreloader, 3000);
    }
  }

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById('menu-toggle');
  var menuClose = document.getElementById('menu-close');
  var drawer = document.getElementById('menu-drawer');
  var menuOverlay = document.getElementById('menu-overlay');

  function openMenu() {
    drawer && drawer.classList.add('open');
    menuOverlay && menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    drawer && drawer.classList.remove('open');
    menuOverlay && menuOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
  if (drawer) {
    drawer.querySelectorAll('.menu-drawer__nav a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Reveal on scroll (guaranteed to end visible) ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('in-view');
        io.unobserve(el);
      }
    });

    // Hard fallback: never let content stay hidden.
    setTimeout(function () {
      revealEls.forEach(function (el) {
        el.classList.add('in-view');
      });
    }, 2600);
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('in-view');
    });
  }

  /* ---------- Scotties marquee ---------- */
  var trackDefs = [
    { id: 'cs-t1', speed: 180, reverse: false },
    { id: 'cs-t2', speed: 320, reverse: true },
    { id: 'cs-t3', speed: 210, reverse: false }
  ];

  var widths = [160, 200, 140, 220, 170, 130, 190, 150, 180, 210];
  var mobileW = [100, 130, 90, 145, 110, 85, 125, 95, 115, 135];
  var isMobile = window.innerWidth <= 768;
  var wArr = isMobile ? mobileW : widths;

  function buildPhoto(src, w) {
    var div = document.createElement('div');
    div.className = 'cs-photo';
    div.style.width = w + 'px';
    if (src) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      div.appendChild(img);
    }
    return div;
  }

  function populateTracks(photos) {
    trackDefs.forEach(function (def, ti) {
      var el = document.getElementById(def.id);
      if (!el) return;
      var offset = ti * Math.floor(photos.length / 3);
      var ordered = photos.slice(offset).concat(photos.slice(0, offset));
      var doubled = ordered.concat(ordered);
      doubled.forEach(function (src, i) {
        el.appendChild(buildPhoto(src, wArr[i % wArr.length]));
      });
      animateTrack(el, def.speed, def.reverse);
    });
  }

  populateTracks(PHOTOS.slice());

  /* ---------- Overlays (search / language) ---------- */
  var searchOverlay = document.getElementById('search-overlay');
  var langOverlay = document.getElementById('lang-overlay');

  function openOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (overlay === searchOverlay) {
      var input = document.getElementById('search-input');
      if (input) setTimeout(function () { input.focus(); }, 120);
    }
  }

  function closeOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAllOverlays() {
    closeOverlay(searchOverlay);
    closeOverlay(langOverlay);
    if (closeMenu) closeMenu();
  }

  document.getElementById('search-toggle').addEventListener('click', function () {
    closeOverlay(langOverlay);
    openOverlay(searchOverlay);
  });
  document.getElementById('search-close').addEventListener('click', function () {
    closeOverlay(searchOverlay);
  });
  searchOverlay.addEventListener('click', function (e) {
    if (e.target === searchOverlay) closeOverlay(searchOverlay);
  });

  document.getElementById('lang-toggle').addEventListener('click', function () {
    closeOverlay(searchOverlay);
    openOverlay(langOverlay);
  });
  document.getElementById('lang-close').addEventListener('click', function () {
    closeOverlay(langOverlay);
  });
  langOverlay.addEventListener('click', function (e) {
    if (e.target === langOverlay) closeOverlay(langOverlay);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllOverlays();
    }
  });

  /* ---------- Search suggestions ---------- */
  var SEARCH_LINKS = [
    { label: 'Store', href: 'https://calumscott.com/collections/merch' },
    { label: 'Live', href: 'https://calumscott.com/pages/tour' },
    { label: 'Sign up', href: 'https://calumscott.lnk.to/textme' },
    { label: 'Scotties Gallery', href: '#scotties' },
    { label: 'Tees', href: 'https://calumscott.com/collections/tee' },
    { label: 'Hoods & Sweats', href: 'https://calumscott.com/collections/hoods-sweats' },
    { label: 'Hats', href: 'https://calumscott.com/collections/headwear' },
    { label: 'Shop All', href: 'https://calumscott.com/collections/merch' }
  ];

  var searchInput = document.getElementById('search-input');
  var suggestions = document.getElementById('search-suggestions');

  function renderSuggestions(q) {
    var list = SEARCH_LINKS;
    if (q) {
      var lower = q.toLowerCase();
      list = list.filter(function (item) {
        return item.label.toLowerCase().indexOf(lower) !== -1;
      });
    }
    suggestions.innerHTML = '';
    list.forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      li.appendChild(a);
      suggestions.appendChild(li);
    });
  }

  searchInput.addEventListener('input', function () {
    renderSuggestions(searchInput.value);
  });
  searchInput.addEventListener('focus', function () {
    renderSuggestions(searchInput.value);
  });
  renderSuggestions('');

  /* ---------- Language / region list ---------- */
  var COUNTRIES = [
    ['Afghanistan', '\u060bAFN'], ['Albania', 'LALL'], ['Andorra', '\u20acEUR'],
    ['Argentina', '\u00a3GBP'], ['Armenia', '\u0564\u0580.AMD'], ['Australia', '$AUD'],
    ['Austria', '\u20acEUR'], ['Azerbaijan', '\u20bcAZN'], ['Bangladesh', '\u09f3BDT'],
    ['Belarus', '\u00a3GBP'], ['Belgium', '\u20acEUR'], ['Bosnia & Herzegovina', '\u041a\u041cBAM'],
    ['Brazil', '\u00a3GBP'], ['British Indian Ocean Territory', '$USD'], ['Bulgaria', '\u20acEUR'],
    ['Canada', '$CAD'], ['Chile', '\u00a3GBP'], ['China', '\u00a5CNY'],
    ['Christmas Island', '$AUD'], ['Colombia', '\u00a3GBP'], ['Cook Islands', '$NZD'],
    ['Croatia', '\u20acEUR'], ['Cyprus', '\u20acEUR'], ['Czechia', 'K\u010dCZK'],
    ['Denmark', 'kr.DKK'], ['Ecuador', '$USD'], ['Estonia', '\u20acEUR'],
    ['Faroe Islands', 'kr.DKK'], ['Fiji', '$FJD'], ['Finland', '\u20acEUR'],
    ['France', '\u20acEUR'], ['French Polynesia', 'FrXPF'], ['French Southern Territories', '\u20acEUR'],
    ['Georgia', '\u00a3GBP'], ['Germany', '\u20acEUR'], ['Gibraltar', '\u00a3GBP'],
    ['Greece', '\u20acEUR'], ['Greenland', 'kr.DKK'], ['Hong Kong SAR', '$HKD'],
    ['Hungary', 'FtHUF'], ['Iceland', 'krISK'], ['India', '\u20b9INR'],
    ['Indonesia', 'RpIDR'], ['Ireland', '\u20acEUR'], ['Israel', '\u20aaILS'],
    ['Italy', '\u20acEUR'], ['Japan', '\u00a5JPY'], ['Kazakhstan', '\u20b8KZT'],
    ['Kiribati', '\u00a3GBP'], ['Kosovo', '\u20acEUR'], ['Kyrgyzstan', 'somKGS'],
    ['Laos', '\u20adLAK'], ['Latvia', '\u20acEUR'], ['Liechtenstein', 'CHFCHF'],
    ['Lithuania', '\u20acEUR'], ['Luxembourg', '\u20acEUR'], ['Macao SAR', 'PMOP'],
    ['Malaysia', 'RMMYR'], ['Malta', '\u20acEUR'], ['Mexico', '\u00a3GBP'],
    ['Moldova', 'LMDL'], ['Monaco', '\u20acEUR'], ['Montenegro', '\u20acEUR'],
    ['Morocco', '\u062f.\u0645.MAD'], ['Nauru', '$AUD'], ['Netherlands', '\u20acEUR'],
    ['New Caledonia', 'FrXPF'], ['New Zealand', '$NZD'], ['Nigeria', '\u20a6NGN'],
    ['Niue', '$NZD'], ['Norfolk Island', '$AUD'], ['North Macedonia', '\u0434\u0435\u043dMKD'],
    ['Norway', '\u00a3GBP'], ['Papua New Guinea', 'KPGK'], ['Pitcairn Islands', '$NZD'],
    ['Poland', 'z\u0142PLN'], ['Portugal', '\u20acEUR'], ['Romania', 'LeiRON'],
    ['Russia', '\u00a3GBP'], ['Samoa', 'TWST'], ['San Marino', '\u20acEUR'],
    ['Serbia', '\u0420\u0421\u0414RSD'], ['Singapore', '$SGD'], ['Slovakia', '\u20acEUR'],
    ['Slovenia', '\u20acEUR'], ['Solomon Islands', '$SBD'], ['South Africa', '\u00a3GBP'],
    ['South Korea', '\u20a9KRW'], ['Spain', '\u20acEUR'], ['Sweden', 'krSEK'],
    ['Switzerland', 'CHFCHF'], ['Taiwan', '$TWD'], ['Tajikistan', '\u0405\u041cTJS'],
    ['Thailand', '\u0e3fTHB'], ['Tokelau', '$NZD'], ['Tonga', 'T$TOP'],
    ['T\u00fcrkiye', '\u00a3GBP'], ['Turkmenistan', '\u00a3GBP'], ['Tuvalu', '$AUD'],
    ['Ukraine', '\u20b4UAH'], ['United Arab Emirates', '\u062f.\u0625AED'],
    ['United Kingdom', '\u00a3GBP'], ['United States', '$USD'], ['Uzbekistan', "so'mUZS"],
    ['Vatican City', '\u20acEUR']
  ];

  var langFilter = document.getElementById('lang-filter');
  var langList = document.getElementById('lang-list');
  var selectedCountry = 'United Kingdom';

  function renderCountries(q) {
    var lower = (q || '').toLowerCase().trim();
    langList.innerHTML = '';
    COUNTRIES.forEach(function (pair) {
      var name = pair[0];
      if (lower && name.toLowerCase().indexOf(lower) === -1) return;
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      if (name === selectedCountry) btn.classList.add('selected');
      var label = document.createElement('span');
      label.textContent = name;
      btn.appendChild(label);
      var cur = document.createElement('span');
      cur.className = 'cur';
      cur.textContent = pair[1];
      btn.appendChild(cur);
      btn.addEventListener('click', function () {
        selectedCountry = name;
        renderCountries(langFilter.value);
        closeOverlay(langOverlay);
      });
      li.appendChild(btn);
      langList.appendChild(li);
    });
  }

  langFilter.addEventListener('input', function () {
    renderCountries(langFilter.value);
  });
  renderCountries('');

  /* ---------- Admin overrides (edit via admin.html) ---------- */
  function animateTrack(el, speed, reverse) {
    var raf = null;
    var totalWidth = 0;
    var kids = el.children;
    var half = Math.floor(kids.length / 2);
    for (var i = 0; i < half; i++) {
      totalWidth += kids[i].offsetWidth + 5;
    }
    if (!totalWidth) totalWidth = 3000;

    var pos = reverse ? -totalWidth : 0;
    var last = null;
    var pxPerSec = totalWidth / speed;
    var prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function step(ts) {
      if (raf === null) return;
      if (prefersReduced) return;
      if (!last) last = ts;
      var delta = (ts - last) / 1000;
      last = ts;
      pos += reverse ? pxPerSec * delta : -pxPerSec * delta;
      if (!reverse && pos <= -totalWidth) pos = 0;
      if (reverse && pos >= 0) pos = -totalWidth;
      el.style.transform = 'translateX(' + pos + 'px)';
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    trackLoops.push(function () { raf = null; });
  }

  function getAdminData() {
    var data = null;
    try {
      var ls = localStorage.getItem('calum_admin_v1');
      if (ls) {
        var parsed = JSON.parse(ls);
        if (parsed && parsed.version) data = parsed;
      }
    } catch (e) {}

    // Published file (data/site.json) takes priority over the browser draft.
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/site.json', false);
        xhr.send();
        if (xhr.status === 200) {
          var pub = JSON.parse(xhr.responseText);
          if (pub && pub.version) data = pub;
        }
      } catch (e) {}
    }
    return data;
  }

  function applyOverrides(d) {
    if (!d) return;

    /* Hero */
    if (d.hero) {
      var heroEl = document.querySelector('.hero__video');
      if (heroEl) {
        if (heroEl.tagName === 'VIDEO') {
          var source = heroEl.querySelector('source');
          if (d.hero.video) {
            if (source) source.src = d.hero.video;
            if (typeof heroEl.load === 'function') {
              heroEl.load();
              var p = heroEl.play();
              if (p && typeof p.catch === 'function') p.catch(function () {});
            }
          }
          if (d.hero.poster) heroEl.poster = d.hero.poster;
        } else if (d.hero.poster) {
          heroEl.src = d.hero.poster;
        }
      }
      var heroLink = document.querySelector('.hero__link');
      if (heroLink && d.hero.link) heroLink.href = d.hero.link;
    }

    /* Decorative strips */
    if (d.strips) {
      var wine = document.querySelector('.strip--wine');
      if (wine) wine.style.display = d.strips.wine === false ? 'none' : '';
      document.querySelectorAll('.strip--peach').forEach(function (el) {
        el.style.display = d.strips.peach === false ? 'none' : '';
      });
    }

    /* Merch tiles */
    if (d.merch && Array.isArray(d.merch.tiles) && d.merch.tiles.length) {
      var grid = document.querySelector('.merch__grid');
      if (grid) {
        grid.innerHTML = '';
        d.merch.tiles.forEach(function (tile) {
          var a = document.createElement('a');
          a.className = 'merch__tile';
          a.href = tile.link || '#';
          var media = document.createElement('div');
          media.className = 'merch__media';
          var img = document.createElement('img');
          img.src = tile.image || 'images/tees.webp';
          img.alt = tile.title || '';
          img.loading = 'lazy';
          media.appendChild(img);
          var label = document.createElement('span');
          label.className = 'merch__label';
          label.textContent = tile.title || '';
          a.appendChild(media);
          a.appendChild(label);
          grid.appendChild(a);
        });
      }
    }

    /* Album */
    if (d.album) {
      var btn = document.querySelector('.album__button');
      var cover = document.querySelector('.album__cover');
      if (btn) {
        btn.textContent = d.album.text || '';
        if (d.album.link) btn.href = d.album.link;
      }
      if (cover) {
        if (d.album.link) cover.href = d.album.link;
        var coverImg = cover.querySelector('img');
        if (coverImg && d.album.image) coverImg.src = d.album.image;
      }
    }

    /* Scotties gallery */
    if (d.scotties) {
      var eyebrow = document.querySelector('.cs-eyebrow');
      var title = document.querySelector('.cs-title');
      var sub = document.querySelector('.cs-sub');
      var cta = document.querySelector('.cs-cta');
      if (eyebrow && d.scotties.eyebrow) eyebrow.textContent = d.scotties.eyebrow;
      if (title && d.scotties.title) title.textContent = d.scotties.title;
      if (sub && d.scotties.sub) sub.textContent = d.scotties.sub;
      if (cta) {
        if (d.scotties.cta) cta.textContent = d.scotties.cta;
        if (d.scotties.ctaLink) cta.href = d.scotties.ctaLink;
      }

      var list = d.scotties.photos;
      if (Array.isArray(list) && list.length && photosChanged(list)) {
        trackLoops.forEach(function (c) { if (c) c(); });
        trackLoops = [];
        trackDefs.forEach(function (def) {
          var el = document.getElementById(def.id);
          if (el) el.innerHTML = '';
        });
        populateTracks(list.slice());
      }
    }

    /* Footer */
    if (d.footer) {
      var socials = document.querySelector('.footer__social');
      if (socials && Array.isArray(d.footer.socials) && d.footer.socials.length) {
        socials.innerHTML = '';
        d.footer.socials.forEach(function (s) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = s.href || '#';
          a.target = '_blank';
          a.rel = 'noopener';
          a.className = 'social-fallback';
          a.title = s.label || '';
          a.setAttribute('aria-label', s.label || '');
          a.textContent = (s.label || '?').charAt(0).toUpperCase();
          li.appendChild(a);
          socials.appendChild(li);
        });
      }
      var cp = document.querySelector('.footer__copyright');
      if (cp) {
        var year = new Date().getFullYear();
        var text = (d.footer.copyright || '').replace(/\d{4}/, String(year));
        cp.innerHTML = '';
        cp.appendChild(document.createTextNode(text + ' | '));
        var pol = document.createElement('a');
        pol.href = d.footer.privacyLink || '#';
        pol.target = '_blank';
        pol.rel = 'noopener';
        pol.title = 'Privacy Policy';
        pol.textContent = d.footer.privacy || 'Privacy & Cookie Policy';
        cp.appendChild(pol);
      }
    }
  }

  function photosChanged(list) {
    if (list.length !== PHOTOS.length) return true;
    for (var i = 0; i < list.length; i++) {
      if (list[i] !== PHOTOS[i]) return true;
    }
    return false;
  }

  applyOverrides(getAdminData());
})();