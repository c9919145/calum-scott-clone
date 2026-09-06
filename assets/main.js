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
    closeOverlay(checkoutOverlay);
    if (closeCart) closeCart();
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

    // Published file (data/site.json) = what admins ship to everyone.
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

    // This browser's unsaved drafts preview locally and win over the published build.
    try {
      var ls = localStorage.getItem('calum_admin_v1');
      if (ls) {
        var parsed = JSON.parse(ls);
        if (parsed && parsed.version) data = parsed;
      }
    } catch (e) {}

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
          var wrap = document.createElement('div');
          wrap.className = 'merch__tile';
          wrap.dataset.price = tile.price > 0 ? tile.price : 0;
          wrap.dataset.title = tile.title || '';
          var a = document.createElement('a');
          a.className = 'merch__tile-link';
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
          wrap.appendChild(a);
          grid.appendChild(wrap);
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

  /* ---------------- Shop: cart + gift-card checkout ---------------- */
  var CART_KEY = 'calum_cart_v1';
  var GC_USED_KEY = 'calum_gc_used';

  function shopEsc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function shopMoney(n) {
    n = Number(n) || 0;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function loadCart() {
    try {
      var c = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(c) ? c : [];
    } catch (e) { return []; }
  }

  var cart = loadCart();

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function cartTotals() {
    var raw = 0, qty = 0;
    cart.forEach(function (it) {
      raw += (Number(it.price) || 0) * it.qty;
      qty += it.qty;
    });
    return { raw: raw, qty: qty };
  }

  function renderCartBadge() {
    var badge = document.getElementById('cart-count');
    if (!badge) return;
    var qty = cartTotals().qty;
    badge.hidden = qty === 0;
    badge.textContent = qty;
  }

  function bindCartLineButtons() {
    document.querySelectorAll('#cart-items button[data-item]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.dataset.item, 10);
        if (isNaN(i) || !cart[i]) return;
        var op = btn.dataset.op;
        if (op === 'inc') cart[i].qty++;
        else if (op === 'dec') { if (cart[i].qty > 1) cart[i].qty--; else cart.splice(i, 1); }
        else if (op === 'del') cart.splice(i, 1);
        saveCart();
        renderCartItems();
        renderCartBadge();
      });
    });
  }

  function renderCartItems() {
    var items = document.getElementById('cart-items');
    var sub = document.getElementById('cart-subtotal');
    var checkoutBtn = document.getElementById('cart-checkout');
    var t = cartTotals();
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
    if (sub) sub.textContent = shopMoney(t.raw);
    if (!items) return;
    items.innerHTML = '';
    if (!cart.length) {
      items.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      return;
    }
    cart.forEach(function (it, i) {
      var row = document.createElement('div');
      row.className = 'cart-line';
      row.innerHTML =
        '<img class="cart-line__img" src="' + shopEsc(it.image) + '" alt="">' +
        '<div><div class="cart-line__title">' + shopEsc(it.title) + '</div><div class="cart-line__price">' + shopMoney(it.price) + ' each</div></div>' +
        '<div class="cart-line__right"><div class="cart-qty">' +
        '<button type="button" data-op="dec" data-item="' + i + '">−</button><span>' + it.qty + '</span><button type="button" data-op="inc" data-item="' + i + '">+</button>' +
        '</div><button type="button" class="cart-line__remove" data-op="del" data-item="' + i + '">Remove</button></div>';
      items.appendChild(row);
    });
    bindCartLineButtons();
  }

  function addToCartItem(title, price, image) {
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].title === title && Number(cart[i].price) === Number(price)) { existing = cart[i]; break; }
    }
    if (existing) existing.qty++;
    else cart.push({ title: title, price: Number(price), image: image, qty: 1 });
    saveCart();
    renderCartItems();
    renderCartBadge();
    openCart();
  }

  var cartDrawer = document.getElementById('cart-drawer');
  var shopOverlay = document.getElementById('shop-overlay');
  var checkoutOverlay = document.getElementById('checkout-overlay');
  var checkoutView = document.getElementById('checkout-view');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('open');
    if (shopOverlay) shopOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartItems();
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (shopOverlay) shopOverlay.classList.remove('open');
    if (!checkoutOverlay || !checkoutOverlay.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  /* ---- gift card + checkout state ---- */
  var siteCards = [];
  var gcUsed = [];
  var applied = { code: '', balance: 0, amount: 0, from: '' };

  function saveGcUsed() {
    try { localStorage.setItem(GC_USED_KEY, JSON.stringify(gcUsed)); } catch (e) {}
  }

  function openCheckout() {
    if (!checkoutOverlay) return;
    closeCart();
    applied = { code: '', balance: 0, amount: 0, from: '' };
    checkoutOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCheckout();
  }

  function closeCheckout() {
    if (!checkoutOverlay) return;
    checkoutOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderCheckout() {
    if (!checkoutView) return;
    var t = cartTotals();
    if (!cart.length) {
      checkoutView.innerHTML = '<div class="co-success"><p>Your cart is empty.</p></div>';
      return;
    }
    var rows = '';
    cart.forEach(function (it) {
      rows += '<div class="checkout__row"><span class="co-qty">' + it.qty + ' × ' + shopEsc(it.title) + '</span><span>' + shopMoney(it.price * it.qty) + '</span></div>';
    });
    var remaining = Math.max(0, t.raw - applied.amount);
    var covered = applied.amount > 0
      ? '<div class="co-covered"><span>Gift card ' + shopEsc(applied.code) + '</span><span>−' + shopMoney(applied.amount) + '</span></div>'
      : '<div class="co-covered" style="display:none"></div>';
    var payDisabled = !(applied.amount > 0) || remaining > 0;
    checkoutView.innerHTML =
      '<div class="co-items">' + rows + '</div>' +
      '<div class="co-totals">' +
      '<div><span>Subtotal</span><span>' + shopMoney(t.raw) + '</span></div>' +
      (applied.amount > 0 ? '<div><span>Gift card</span><span>−' + shopMoney(applied.amount) + '</span></div>' : '') +
      '<div class="co-total"><span>Total due</span><span>' + shopMoney(remaining) + '</span></div>' +
      '</div>' +
      '<div class="co-gc"><input id="gc-input" placeholder="Gift card code" maxlength="24" autocomplete="off"><button class="btn-apply" id="gc-apply" type="button">Apply</button></div>' +
      '<div class="co-gc-status" id="gc-status"></div>' +
      covered +
      '<button class="btn--checkout" id="co-pay" type="button"' + (payDisabled ? ' disabled' : '') + '>' +
      (remaining > 0 ? 'Pay remaining ' + shopMoney(remaining) : 'Pay with gift card') + '</button>' +
      '<p class="co-gift-note">Demo checkout — gift card codes are issued in the admin panel. No real payment is processed.</p>';

    var input = document.getElementById('gc-input');
    if (input) {
      input.focus();
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') applyGiftCode();
      });
    }
    document.getElementById('gc-apply').addEventListener('click', applyGiftCode);
    document.getElementById('co-pay').addEventListener('click', payWithGiftCard);
  }

  function applyGiftCode() {
    var input = document.getElementById('gc-input');
    var status = document.getElementById('gc-status');
    var code = (input.value || '').trim().toUpperCase();
    if (!code) {
      status.className = 'co-gc-status err';
      status.textContent = 'Enter a gift card code.';
      return;
    }
    var card = null;
    for (var i = 0; i < siteCards.length; i++) {
      if (String(siteCards[i].code).toUpperCase() === code) { card = siteCards[i]; break; }
    }
    if (!card) {
      status.className = 'co-gc-status err';
      status.textContent = 'Unknown code "' + shopEsc(code) + '". Codes are issued by the store admin.';
      return;
    }
    if ((Number(card.balance) || 0) <= 0) {
      status.className = 'co-gc-status err';
      status.textContent = 'That gift card has no balance left.';
      return;
    }
    if (gcUsed.indexOf(code) !== -1) {
      status.className = 'co-gc-status err';
      status.textContent = 'That gift card was already used in this browser.';
      return;
    }
    var t = cartTotals();
    applied = {
      code: code,
      balance: Number(card.balance),
      amount: Math.min(Number(card.balance), t.raw),
      from: card.label || ''
    };
    renderCheckout();
  }

  function payWithGiftCard() {
    var t = cartTotals();
    var remaining = Math.max(0, t.raw - applied.amount);
    if (!applied.code || remaining > 0) return;
    gcUsed.push(applied.code);
    saveGcUsed();
    var orderId = 'GC-' + Date.now().toString(36).toUpperCase();
    checkoutView.innerHTML =
      '<div class="co-success">' +
      '<div class="co-success__tick">✓</div>' +
      '<h3>Order placed</h3>' +
      '<p>Paid ' + shopMoney(t.raw) + ' with gift card ' + shopEsc(applied.code) + '.</p>' +
      (applied.from ? '<p>' + shopEsc(applied.from) + '</p>' : '') +
      '<span class="co-order-id">Order ' + shopEsc(orderId) + '</span>' +
      '<p>Demo checkout — nothing was actually charged, and your card balance was not reduced server-side.</p>' +
      '</div>';
    cart = [];
    saveCart();
    renderCartBadge();
  }

  function initShop() {
    var toggle = document.getElementById('cart-toggle');
    var closeBtn = document.getElementById('cart-close');
    var checkoutBtn = document.getElementById('cart-checkout');
    var coClose = document.getElementById('checkout-close');

    if (toggle) toggle.addEventListener('click', openCart);
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (shopOverlay) shopOverlay.addEventListener('click', closeCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
    if (coClose) coClose.addEventListener('click', closeCheckout);
    if (checkoutOverlay) checkoutOverlay.addEventListener('click', function (e) {
      if (e.target === checkoutOverlay) closeCheckout();
    });

    // Add-button on every priced merch tile (built or static)
    document.querySelectorAll('.merch__tile').forEach(function (tile) {
      var price = Number(tile.dataset.price);
      if (!(price > 0)) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'merch__add';
      btn.textContent = 'Add · ' + shopMoney(price);
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var img = tile.querySelector('.merch__media img');
        addToCartItem(tile.dataset.title || 'Item', price, img ? img.src : '');
      });
      tile.appendChild(btn);
    });

    renderCartBadge();
    renderCartItems();
  }

  var siteData = getAdminData();
  if (siteData && Array.isArray(siteData.giftCards)) {
    siteCards = siteData.giftCards;
  }
  try {
    var used = JSON.parse(localStorage.getItem(GC_USED_KEY) || '[]');
    if (Array.isArray(used)) gcUsed = used;
  } catch (e) {}

  applyOverrides(siteData);
  initShop();
})();