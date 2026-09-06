/* Admin panel for the Calum Scott clone.
   Data model keys match what /assets/main.js applies to index.html. */

var DEFAULT_PHOTOS = Array.from({ length: 74 }, function (_, i) {
  return "images/scotties/g" + (i + 1) + ".jpg";
});

var DEFAULT = {
  version: 1,
  hero: {
    poster: "images/hero-poster.jpg",
    link: "https://calumscott.com/pages/live"
  },
  strips: { wine: true, peach: true },
  merch: {
    tiles: [
      { title: "Tees", image: "images/tees.webp", link: "https://calumscott.com/collections/tee", price: 26 },
      { title: "Hoods & Sweats", image: "images/hoods.webp", link: "https://calumscott.com/collections/hoods-sweats", price: 55 },
      { title: "Hats", image: "images/hats.webp", link: "https://calumscott.com/collections/headwear", price: 24 },
      { title: "Shop All", image: "images/shopall.webp", link: "https://calumscott.com/collections/merch", price: 0 }
    ]
  },
  album: {
    text: "THE NEW ALBUM",
    link: "https://shop.calumscott.com/",
    image: "images/album-cover.webp"
  },
  scotties: {
    eyebrow: "Official fan gallery",
    title: "Scotties",
    sub: "Real fans \u00b7 Real moments",
    cta: "View gallery",
    ctaLink: "https://calumscott.com/pages/scotties-gallery",
    photos: DEFAULT_PHOTOS.slice()
  },
  footer: {
    copyright: "\u00a9 2026 Calum Scott",
    privacy: "Privacy & Cookie Policy",
    privacyLink: "https://calumscott.com/pages/privacy-policy",
    socials: [
      { label: "X (Twitter)", href: "https://x.com/" },
      { label: "Instagram", href: "https://www.instagram.com/" },
      { label: "YouTube", href: "https://www.youtube.com/" },
      { label: "TikTok", href: "https://www.tiktok.com/" },
      { label: "Facebook", href: "https://www.facebook.com/" }
    ]
  },
  giftCards: []
};

var STORAGE_KEY = "calum_admin_v1";
var PUBLISH_KEY = "calum_pub_settings";
var PUBLISH_PATH = "data/site.json";

var pub = { token: "", owner: "", repo: "" };

function loadPub() {
  try {
    var raw = localStorage.getItem(PUBLISH_KEY);
    if (raw) pub = Object.assign(pub, JSON.parse(raw));
  } catch (e) {}
  $("#pub-token").value = pub.token;
  $("#pub-owner").value = pub.owner;
  $("#pub-repo").value = pub.repo;
}

function savePub() {
  pub.token = $("#pub-token").value.trim();
  pub.owner = $("#pub-owner").value.trim();
  pub.repo = $("#pub-repo").value.trim();
  try { localStorage.setItem(PUBLISH_KEY, JSON.stringify(pub)); } catch (e) {}
  refreshPublishStatus();
  toast("Publish details saved", "ok");
}

function refreshPublishStatus() {
  var el = $("#publish-status");
  if (!el) return;
  el.textContent =
    pub.token && pub.owner && pub.repo
      ? "Ready to publish to " + pub.owner + "/" + pub.repo
      : "Add your GitHub details to enable publishing";
}

function publishSiteJson() {
  if (!pub.token || !pub.owner || !pub.repo) {
    toast("Add your GitHub token, owner and repo first", "err");
    return;
  }
  var payload = JSON.stringify(collectForSave(), null, 2);
  function b64(s) {
    return btoa(unescape(encodeURIComponent(s)));
  }

  var url = "https://api.github.com/repos/" + pub.owner + "/" + pub.repo + "/contents/" + PUBLISH_PATH;
  var body = JSON.stringify({
    message: "Publish site config from admin",
    content: b64(payload),
    branch: "main"
  });

  function put(withSha) {
    if (withSha) {
      body = body.replace(/^\{"message":/, '{"message":');
      var parsed = JSON.parse(body);
      parsed.sha = withSha;
      body = JSON.stringify(parsed);
    }
    return fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": "token " + pub.token,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: body
    });
  }

  put(false).then(function (r) {
    if (r.status === 422) {
      return fetch(url, {
        method: "GET",
        headers: { "Authorization": "token " + pub.token, "Accept": "application/vnd.github+json" }
      }).then(function (g) { return g.json(); }).then(function (meta) {
        return put(meta.sha);
      });
    }
    if (!r.ok) return r.json().then(function (e) { throw new Error(e.message || r.status); });
    return r.json();
  }).then(function () {
    toast("Published — visible on the site in ~1 min", "ok");
    downloadSiteJson(payload);
  }).catch(function (e) {
    toast("Publish failed: " + e.message, "err");
  });
}

function downloadSiteJson(payload) {
  if (!payload) payload = JSON.stringify(collectForSave(), null, 2);
  var blob = new Blob([payload], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "site.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

var state = null;

function clone(o) { return JSON.parse(JSON.stringify(o || null)); }
function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function emptyPhotos() {
  return DEFAULT_PHOTOS.map(function (p) { return { url: p, included: true }; });
}

function loadFromStorage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.version) return parsed;
    }
  } catch (e) {}
  return null;
}

function normalizeState(saved) {
  if (!saved) return clone(DEFAULT);
  var d = clone(DEFAULT);
  d.hero = Object.assign({}, d.hero, saved.hero || {});
  d.strips = Object.assign({}, d.strips, saved.strips || {});
  d.merch = {
    tiles: Array.isArray(saved.merch && saved.merch.tiles) ? saved.merch.tiles : d.merch.tiles
  };
  d.album = Object.assign({}, d.album, saved.album || {});
  d.scotties = Object.assign({}, d.scotties, saved.scotties || {});
  if (!Array.isArray(d.scotties.photos) || !d.scotties.photos.length) {
    d.scotties.photos = DEFAULT_PHOTOS.slice();
  }
  d.footer = Object.assign({}, d.footer, saved.footer || {});
  if (!Array.isArray(d.footer.socials)) d.footer.socials = [];
  d.giftCards = Array.isArray(saved.giftCards) ? saved.giftCards : [];
  return d;
}

function loadState() {
  var saved = loadFromStorage();
  state = normalizeState(saved);
  state.photosEdit = photoEditFromUrls(state.scotties.photos);
}

function photoEditFromUrls(urls) {
  var known = {};
  DEFAULT_PHOTOS.forEach(function (p) { known[p] = true; });
  var list = [];
  var included = 0;
  urls.forEach(function (url) {
    var inc = true;
    if (url && url.trim()) {
      list.push({ url: url.trim(), included: true });
      included++;
    }
  });
  // make sure every default is present in the editor (excluded ones stay for toggling)
  DEFAULT_PHOTOS.forEach(function (p) {
    if (!list.some(function (it) { return it.url === p; })) {
      list.push({ url: p, included: false });
    }
  });
  /* Preserve order of server images then appended customs on top,
     but keep default photos sorted g{n} and customs at the end. */
  var defaults = list.filter(function (it) { return known[it.url]; });
  var customs = list.filter(function (it) { return !known[it.url]; });
  defaults.sort(function (a, b) {
    var na = parseInt(a.url.match(/g(\d+)/)[1], 10);
    var nb = parseInt(b.url.match(/g(\d+)/)[1], 10);
    return na - nb;
  });
  return defaults.concat(customs);
}

function urlsFromEdit() {
  return state.photosEdit.filter(function (it) { return it.included; }).map(function (it) { return it.url; });
}

/* ---------------- toast ---------------- */
var toastTimer = null;
function toast(msg, type) {
  var el = $("#toast");
  el.textContent = msg;
  el.className = "toast show" + (type ? " " + type : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.className = "toast"; }, 2600);
}

/* ---------------- tabs ---------------- */
function bindTabs() {
  $all(".tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $all(".tab").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      $all(".page").forEach(function (p) { p.classList.remove("active"); });
      $(".page[data-page=" + btn.getAttribute("data-tab") + "]").classList.add("active");
    });
  });
}

/* ---------------- merch editor ---------------- */
function renderMerchList() {
  var host = $("#merch-list");
  host.innerHTML = "";
  state.merch.tiles.forEach(function (tile, i) {
    var row = document.createElement("div");
    row.className = "list-row";
    row.innerHTML =
      '<img class="lr-img" src="' + esc(tile.image) + '" alt="">' +
      '<div class="lr-body">' +
      '<input data-f="title" value="' + esc(tile.title) + '" placeholder="Title">' +
      '<input data-f="price" type="number" min="0" step="0.01" value="' + esc(tile.price || "") + '" placeholder="Price $">' +
      '<input data-f="image" style="grid-column:1/-1" value="' + esc(tile.image) + '" placeholder="Image URL / path">' +
      '<input data-f="link" style="grid-column:1/-1" value="' + esc(tile.link) + '" placeholder="Link URL">' +
      "</div>" +
      '<div class="lr-actions">' +
      '<button data-act="up" title="Move up">↑</button>' +
      '<button data-act="down" title="Move down">↓</button>' +
      '<button data-act="del" class="del" title="Delete">×</button>' +
      "</div>";

    host.appendChild(row);
    var img = row.querySelector(".lr-img");
    var imgInput = row.querySelector('[data-f="image"]');
    imgInput.addEventListener("input", function () { img.src = imgInput.value; tile.image = imgInput.value; renderMerchPreview(); });
    row.querySelector('[data-f="title"]').addEventListener("input", function () { tile.title = this.value; renderMerchPreview(); });
    row.querySelector('[data-f="link"]').addEventListener("input", function () { tile.link = this.value; });
    row.querySelector('[data-f="price"]').addEventListener("input", function () {
      var n = parseFloat(this.value);
      tile.price = isNaN(n) || n < 0 ? 0 : n;
      renderMerchPreview();
    });

    row.querySelector('[data-act="up"]').addEventListener("click", function () {
      if (i > 0) {
        var t = state.merch.tiles[i - 1];
        state.merch.tiles[i - 1] = state.merch.tiles[i];
        state.merch.tiles[i] = t;
        renderMerchList();
      }
    });
    row.querySelector('[data-act="down"]').addEventListener("click", function () {
      if (i < state.merch.tiles.length - 1) {
        var t = state.merch.tiles[i + 1];
        state.merch.tiles[i + 1] = state.merch.tiles[i];
        state.merch.tiles[i] = t;
        renderMerchList();
      }
    });
    row.querySelector('[data-act="del"]').addEventListener("click", function () {
      state.merch.tiles.splice(i, 1);
      renderMerchList();
    });
  });
  renderMerchPreview();
}

function renderMerchPreview() {
  var host = $("#merch-preview");
  host.innerHTML = "";
  state.merch.tiles.forEach(function (tile) {
    var t = document.createElement("div");
    t.className = "pre-tile";
    t.innerHTML =
      '<img src="' + esc(tile.image) + '" alt="">' +
      "<span>" + esc(tile.title || "Tile") + "</span>" +
      (tile.price > 0 ? '<em class="pre-price">$' + money(tile.price) + "</em>" : "");
    host.appendChild(t);
  });
}

function money(n) {
  n = Number(n) || 0;
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------------- social editor ---------------- */
function renderSocialList() {
  var host = $("#social-list");
  host.innerHTML = "";
  state.footer.socials.forEach(function (soc, i) {
    var row = document.createElement("div");
    row.className = "list-row";
    row.innerHTML =
      '<div class="lr-body" style="grid-template-columns:1fr 1.6fr">' +
      '<input data-f="label" value="' + esc(soc.label) + '" placeholder="Label (e.g. Instagram)">' +
      '<input data-f="href" value="' + esc(soc.href) + '" placeholder="URL">' +
      "</div>" +
      '<div class="lr-actions">' +
      '<button data-act="up" title="Move up">↑</button>' +
      '<button data-act="down" title="Move down">↓</button>' +
      '<button data-act="del" class="del" title="Delete">×</button>' +
      "</div>";
    host.appendChild(row);
    row.querySelector('[data-f="label"]').addEventListener("input", function () { soc.label = this.value; });
    row.querySelector('[data-f="href"]').addEventListener("input", function () { soc.href = this.value; });
    row.querySelector('[data-act="up"]').addEventListener("click", function () {
      if (i > 0) { var t = state.footer.socials[i - 1]; state.footer.socials[i - 1] = state.footer.socials[i]; state.footer.socials[i] = t; renderSocialList(); }
    });
    row.querySelector('[data-act="down"]').addEventListener("click", function () {
      if (i < state.footer.socials.length - 1) { var t = state.footer.socials[i + 1]; state.footer.socials[i + 1] = state.footer.socials[i]; state.footer.socials[i] = t; renderSocialList(); }
    });
    row.querySelector('[data-act="del"]').addEventListener("click", function () { state.footer.socials.splice(i, 1); renderSocialList(); });
  });
}

/* ---------------- gift cards ---------------- */
var CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeGiftCode(len) {
  var out = "";
  for (var i = 0; i < (len || 8); i++) {
    out += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return out;
}

function renderGiftCards() {
  var host = $("#gift-list");
  host.innerHTML = "";
  $("#gc-count").textContent = state.giftCards.length;
  if (!state.giftCards.length) {
    host.innerHTML = '<p class="page__hint">No gift cards yet — issue one above.</p>';
    return;
  }
  state.giftCards.forEach(function (card, i) {
    var row = document.createElement("div");
    row.className = "list-row";
    row.innerHTML =
      '<div class="gc-code">' + esc(card.code) + "</div>" +
      '<div class="lr-body" style="grid-template-columns:1fr 1.4fr">' +
      '<input data-f="balance" type="number" min="0" step="0.01" value="' + esc(card.balance) + '" title="Balance">' +
      '<input data-f="label" value="' + esc(card.label || "") + '" placeholder="Note">' +
      "</div>" +
      '<div class="lr-actions">' +
      '<button data-act="topup" class="del" title="Delete this card">×</button>' +
      "</div>";
    host.appendChild(row);
    row.querySelector('[data-f="balance"]').addEventListener("input", function () {
      var n = parseFloat(this.value);
      card.balance = isNaN(n) || n < 0 ? 0 : n;
    });
    row.querySelector('[data-f="label"]').addEventListener("input", function () { card.label = this.value; });
    row.querySelector('[data-act="topup"]').addEventListener("click", function () {
      if (confirm("Delete gift card " + card.code + "?")) {
        state.giftCards.splice(i, 1);
        renderGiftCards();
      }
    });
  });
}

function issueGiftCard() {
  var bal = parseFloat($("#gc-balance").value);
  if (isNaN(bal) || bal <= 0) {
    toast("Enter a balance greater than 0", "err");
    return;
  }
  var label = $("#gc-label").value.trim();
  var code = makeGiftCode(10);
  state.giftCards.push({ code: code, balance: bal, label: label });
  $("#gc-balance").value = "";
  $("#gc-label").value = "";
  renderGiftCards();
  toast("Gift card " + code + " issued", "ok");
}

/* ---------------- gallery photo editor ---------------- */
function renderGallery() {
  var host = $("#gal-photos");
  host.innerHTML = "";
  $("#gal-count").textContent = state.photosEdit.filter(function (it) { return it.included; }).length;

  state.photosEdit.forEach(function (item, i) {
    var p = document.createElement("div");
    p.className = "photo" + (item.included ? "" : " excluded");
    p.title = item.url;
    p.innerHTML =
      '<img src="' + esc(item.url) + '" alt="">' +
      (i >= 74 ? '<span class="tag">CUSTOM</span>' : "") +
      (item.included ? "" : '<span class="x">·</span>');
    p.addEventListener("click", function () {
      item.included = !item.included;
      renderGallery();
    });
    host.appendChild(p);
  });
}

/* ---------------- form binding (single-value fields) ---------------- */
function bindFields() {
  var map = {
    "album-text": ["album", "text"],
    "album-link": ["album", "link"],
    "album-image": ["album", "image"],
    "hero-poster": ["hero", "poster"],
    "hero-link": ["hero", "link"],
    "gal-eyebrow": ["scotties", "eyebrow"],
    "gal-title": ["scotties", "title"],
    "gal-sub": ["scotties", "sub"],
    "gal-cta": ["scotties", "cta"],
    "gal-ctalink": ["scotties", "ctaLink"],
    "foot-copy": ["footer", "copyright"],
    "foot-privacy": ["footer", "privacy"],
    "foot-privacylink": ["footer", "privacyLink"]
  };
  Object.keys(map).forEach(function (id) {
    var input = $("#" + id);
    var path = map[id];
    input.addEventListener("input", function () { state[path[0]][path[1]] = this.value; touchPreview(id); });
  });

  $("#strip-wine").addEventListener("change", function () { state.strips.wine = this.checked; });
  $("#strip-peach").addEventListener("change", function () { state.strips.peach = this.checked; });

  $("#album-preview-cover").addEventListener("error", function () { this.style.display = "none"; });
}

function touchPreview(id) {
  if (id === "album-image") {
    var img = $("#album-preview-cover");
    img.style.display = "";
    img.src = $("#album-image").value || DEFAULT.album.image;
  }
  if (id === "album-text") {
    $("#album-pill").textContent = $("#album-text").value || "THE NEW ALBUM";
  }
}

function populateFields() {
  $("#album-text").value = state.album.text;
  $("#album-link").value = state.album.link;
  $("#album-image").value = state.album.image;

  $("#hero-poster").value = state.hero.poster;
  $("#hero-link").value = state.hero.link;

  $("#gal-eyebrow").value = state.scotties.eyebrow;
  $("#gal-title").value = state.scotties.title;
  $("#gal-sub").value = state.scotties.sub;
  $("#gal-cta").value = state.scotties.cta;
  $("#gal-ctalink").value = state.scotties.ctaLink;

  $("#foot-copy").value = state.footer.copyright;
  $("#foot-privacy").value = state.footer.privacy;
  $("#foot-privacylink").value = state.footer.privacyLink;

  $("#strip-wine").checked = !!state.strips.wine;
  $("#strip-peach").checked = !!state.strips.peach;

  var pre = $("#album-preview-cover");
  pre.style.display = "";
  pre.src = state.album.image;
  $("#album-pill").textContent = state.album.text || "THE NEW ALBUM";

  refreshStorageStatus();
}

/* ---------------- persistence ---------------- */
function collectForSave() {
  var clean = clone(state);
  clean.scotties.photos = urlsFromEdit();
  delete clean.photosEdit;
  return clean;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collectForSave()));
    toast("Saved — refresh the site to see changes", "ok");
  } catch (e) {
    toast("Save failed: " + e.message, "err");
  }
  refreshStorageStatus();
}

function exportJson() {
  var blob = new Blob([JSON.stringify(collectForSave(), null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "site.json";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("site.json downloaded — place it at " + PUBLISH_PATH + " to publish", "ok");
}

function importJson(file) {
  var reader = new FileReader();
  reader.onloadend = function () {
    try {
      var parsed = JSON.parse(reader.result);
      if (!parsed || !parsed.version) throw new Error("not a valid site config");
      state = normalizeState(parsed);
      state.photosEdit = photoEditFromUrls(state.scotties.photos || []);
      rerenderAll();
      toast("Imported", "ok");
      refreshStorageStatus();
    } catch (e) {
      toast("Import failed: " + e.message, "err");
    }
  };
  reader.readAsText(file);
}

function reset() {
  if (!confirm("Restore the original Calum Scott content? This clears your edits.")) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  state = normalizeState(null);
  state.photosEdit = photoEditFromUrls(state.scotties.photos);
  rerenderAll();
  toast("Reset to defaults", "ok");
  refreshStorageStatus();
}

function clearLocal() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  toast("Browser storage cleared — site shows published file or defaults", "ok");
  refreshStorageStatus();
}

function refreshStorageStatus() {
  var el = $("#storage-status");
  if (!el) return;
  var hasPub = false;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", PUBLISH_PATH, false);
    xhr.send();
    hasPub = xhr.status === 200;
  } catch (e) {}
  var hasLocal = !!loadFromStorage();
  el.innerHTML =
    "<strong>Browser draft (localStorage):</strong> " + (hasLocal ? "yes — previews on this browser" : "no") +
    "<br><strong>Published file (" + PUBLISH_PATH + "):</strong> " + (hasPub ? "present — applies to all other visitors" : "not present");
}

function rerenderAll() {
  populateFields();
  renderMerchList();
  renderSocialList();
  renderGallery();
  renderGiftCards();
}

/* ---------------- init ---------------- */
function init() {
  bindTabs();
  bindFields();
  loadState();
  rerenderAll();

  $("#merch-add").addEventListener("click", function () {
    state.merch.tiles.push({ title: "", image: "images/tees.webp", link: "" });
    renderMerchList();
  });
  $("#social-add").addEventListener("click", function () {
    state.footer.socials.push({ label: "", href: "" });
    renderSocialList();
  });
  $("#gal-photo-add").addEventListener("click", function () {
    var val = $("#gal-photo-url").value.trim();
    if (!val) return;
    if (state.photosEdit.some(function (it) { return it.url === val; })) { toast("Already in gallery", "err"); return; }
    state.photosEdit.push({ url: val, included: true });
    $("#gal-photo-url").value = "";
    renderGallery();
  });
  $("#gal-photo-url").addEventListener("keydown", function (e) {
    if (e.key === "Enter") $("#gal-photo-add").click();
  });

  $("#btn-save").addEventListener("click", save);
  $("#btn-export").addEventListener("click", exportJson);
  $("#btn-import").addEventListener("click", function () { $("#import-file").click(); });
  $("#import-file").addEventListener("change", function () {
    if (this.files && this.files[0]) importJson(this.files[0]);
    this.value = "";
  });
  $("#btn-reset").addEventListener("click", reset);
  $("#btn-clear-local").addEventListener("click", clearLocal);
  $("#btn-save-pub").addEventListener("click", savePub);
  $("#btn-publish").addEventListener("click", publishSiteJson);
  $("#gc-add").addEventListener("click", issueGiftCard);
  $("#gc-balance").addEventListener("keydown", function (e) {
    if (e.key === "Enter") $("#gc-add").click();
  });

  loadPub();
  refreshPublishStatus();

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      save();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);