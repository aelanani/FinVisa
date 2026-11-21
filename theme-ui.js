// ══════════════════════════════════════════
// THEME SYSTEM — 6 ثيمات (3 فاتح + 3 غامق) مع حفظ الاختيار
// ══════════════════════════════════════════
const THEMES = [
  { id: 'gray',       name: '🌫️ جراي (الثيم الأساسي)',        accent: '#3F4852', bg: '#EEF0F2' },
  { id: 'claude',     name: '🧡 Claude (فاتح دافئ)',  accent: '#c6613f', bg: '#faf9f5' },
  { id: 'claudedark', name: '🧡 Claude (داكن)',        accent: '#d97757', bg: '#262624' },
  { id: 'mataa',     name: '🌿 متاع (الهوية الجديدة)',      accent: '#177B62', bg: '#F4F6F7' },
  { id: 'light',     name: '☀️ سترايب ألاباستر (ناصع)',    accent: '#2563eb', bg: '#f8fafc' },
  { id: 'mintlight', name: '🍃 مينت جلاس (نعناعي هادئ)',   accent: '#059669', bg: '#f1f7f5' },
  { id: 'sandlight', name: '⏳ كشمير سيلك (كتان دافئ)',     accent: '#b45309', bg: '#faf8f5' },
  { id: 'midnight',  name: '🌙 ميدنايت كربون (داكن أزرق)',  accent: '#38bdf8', bg: '#0b0f19' },
  { id: 'emerald',   name: '💎 إيمرالد رويال (زيتي فخم)',   accent: '#10b981', bg: '#050a07' },
  { id: 'blackgold', name: '✨ أوبسيديان كافيار (ذهبي)',    accent: '#dfb455', bg: '#08080a' },
];

// ══ ألوان اللوجو لكل ثيم — اللوجو بيتلوّن مع الثيم ويتحرّك بهدوء (CSS: .mz-logo) ══
const LOGO_PALETTE = {
  gray:       { t1:'#1B1F24', t2:'#2B3138', b1:'#A4ACB5', b2:'#707882', b3:'#474E57', s1:'#F1F3F5', s2:'#B4BAC1', glow:'rgba(164,172,181,.38)' },
  claude:     { t1:'#2B2A28', t2:'#3D3B37', b1:'#BFB7AC', b2:'#827A70', b3:'#57524B', s1:'#F3CDB8', s2:'#D97757', glow:'rgba(217,119,87,.35)' },
  claudedark: { t1:'#1F1E1D', t2:'#30302E', b1:'#B8B0A5', b2:'#7A7369', b3:'#4F4B45', s1:'#F3CDB8', s2:'#D97757', glow:'rgba(217,119,87,.40)' },
  mataa:      { t1:'#0E1F29', t2:'#142A35', b1:'#A3BBBE', b2:'#608488', b3:'#3B585C', s1:'#6FE0B8', s2:'#177B62', glow:'rgba(23,123,98,.45)' },
  light:      { t1:'#0B1E4A', t2:'#1E40AF', b1:'#B4C7EA', b2:'#7390C6', b3:'#425F99', s1:'#BFE6FF', s2:'#2563EB', glow:'rgba(96,165,250,.55)' },
  mintlight:  { t1:'#053B2E', t2:'#0F766E', b1:'#AFD3CB', b2:'#63A093', b3:'#3B6D64', s1:'#B5F5DC', s2:'#059669', glow:'rgba(52,211,153,.55)' },
  sandlight:  { t1:'#3B1D08', t2:'#8A4210', b1:'#E0CBAE', b2:'#AE8C63', b3:'#765B38', s1:'#FFE7B8', s2:'#C2410C', glow:'rgba(251,146,60,.55)' },
  midnight:   { t1:'#05070D', t2:'#1E293B', b1:'#9DAABE', b2:'#62728A', b3:'#3A465A', s1:'#9BDCFF', s2:'#2563EB', glow:'rgba(56,189,248,.50)' },
  emerald:    { t1:'#03120A', t2:'#0B3020', b1:'#97BFAB', b2:'#548470', b3:'#32594A', s1:'#8DF0C8', s2:'#059669', glow:'rgba(52,211,153,.50)' },
  blackgold:  { t1:'#000000', t2:'#1C1608', b1:'#C2B282', b2:'#86764A', b3:'#54482A', s1:'#F5DC8C', s2:'#A17F24', glow:'rgba(223,180,85,.45)' },
};
function _applyLogoPalette(themeId) {
  const p = LOGO_PALETTE[themeId] || LOGO_PALETTE.gray;
  const r = document.documentElement.style;
  Object.keys(p).forEach(k => r.setProperty('--lg-' + k, p[k]));
  // favicon بنفس ألوان الثيم (SVG مستقل — نسخة مبسّطة بتفضل واضحة في 16px)
  try {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="mzTile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.t1}"/><stop offset="1" stop-color="${p.t2}"/></linearGradient><linearGradient id="mzMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.b2}"/><stop offset="1" stop-color="${p.b3}"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#mzTile)"/><rect x="4" y="29" width="92" height="42" rx="21" fill="${p.b3}" fill-opacity=".55" stroke="${p.b2}" stroke-opacity=".6" stroke-width=".8"/><g transform="translate(50 50) scale(1.04) translate(-50 -50)"><circle cx="50" cy="50" r="31" fill="url(#mzMetal)" stroke="${p.b1}" stroke-opacity=".85" stroke-width="1"/><g><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(0)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(30)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(60)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(90)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(120)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(150)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(180)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(210)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(240)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(270)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(300)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/><rect x="-3.9" y="-25.8" width="7.8" height="8.4" rx="1.3" transform="translate(50 50) rotate(330)" fill="${p.b1}" fill-opacity=".92" stroke="${p.b3}" stroke-width=".5"/></g><circle cx="50" cy="50" r="15.6" fill="${p.t1}" stroke="${p.b2}" stroke-width=".9"/><circle cx="50" cy="50" r="12.4" fill="${p.t2}" stroke="${p.s1}" stroke-width="1.5"/><circle cx="50" cy="50" r="10.4" fill="${p.s2}" fill-opacity=".30"/><circle cx="50" cy="50" r="4.6" fill="${p.s1}"/></g></svg>`;
    let lnk = document.querySelector("link[rel='icon'][type='image/svg+xml']") || document.querySelector("link[rel~='icon']");
    if (!lnk) { lnk = document.createElement('link'); lnk.rel = 'icon'; document.head.appendChild(lnk); }
    lnk.type = 'image/svg+xml';
    lnk.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
  } catch (e) {}
}
function applyTheme(themeId) {
  const root = document.documentElement;
  root.style.removeProperty('--accent');
  root.style.removeProperty('--accent2');
  root.style.removeProperty('--accent3');

  root.setAttribute('data-theme', themeId);
  localStorage.setItem('appTheme', themeId);

  const t = THEMES.find(t => t.id === themeId) || THEMES[0];

  // ── theme-color meta tag ──
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t.bg);

  // ── لوجو + favicon بألوان الثيم ──
  _applyLogoPalette(themeId);

  // ── تعريف البيانات لكل ثيم ──
  const themeData = {
    midnight: {
      overlayGrad:  'linear-gradient(160deg,#020408 0%,#080d14 40%,#0d1117 80%,#1c2333 100%)',
      gAuthGrad:    'linear-gradient(135deg,#080d14 0%,#0d1117 60%,#161b22 100%)',
      logoGrad:     'linear-gradient(135deg,#0d1117 0%,#1c2333 50%,#58a6ff 100%)',
      logoGlow:     'rgba(88,166,255,0.45)',
      logoRing:     'rgba(88,166,255,0.2)',
      btnGrad:      'linear-gradient(135deg,#1c2333,#58a6ff)',
      btnShadow:    'rgba(88,166,255,0.3)',
      inputFocus:   '#58a6ff',
      accentHex:    '#58a6ff',
      circle1:      'rgba(88,166,255,0.08)',
      circle2:      'rgba(28,35,51,0.4)',
      iconFill:     'rgba(255,255,255,0.95)',
      iconSvg: `<path d="M14 4a7 7 0 1 0 4 10.5A5.5 5.5 0 0 1 14 4z" fill="rgba(255,255,255,0.95)"/>
                <circle cx="17" cy="5.5" r="1.1" fill="rgba(255,255,255,0.7)"/>
                <circle cx="19.5" cy="8.5" r="0.75" fill="rgba(255,255,255,0.45)"/>`,
    },
    emerald: {
      overlayGrad:  'linear-gradient(160deg,#020d06 0%,#051209 40%,#071a0f 80%,#0d2418 100%)',
      gAuthGrad:    'linear-gradient(135deg,#051209 0%,#071a0f 60%,#0a1d12 100%)',
      logoGrad:     'linear-gradient(135deg,#071a0f 0%,#0d2418 50%,#34d058 100%)',
      logoGlow:     'rgba(52,208,88,0.5)',
      logoRing:     'rgba(52,208,88,0.2)',
      btnGrad:      'linear-gradient(135deg,#0d2418,#34d058)',
      btnShadow:    'rgba(52,208,88,0.35)',
      inputFocus:   '#34d058',
      accentHex:    '#34d058',
      circle1:      'rgba(52,208,88,0.08)',
      circle2:      'rgba(13,36,24,0.5)',
      iconFill:     'rgba(255,255,255,0.95)',
      iconSvg: `<path d="M11 2l2.5 4h5l-4 3 1.5 5L11 11.5 6 14l1.5-5-4-3h5z" fill="rgba(255,255,255,0.95)"/>`,
    },
    blackgold: {
      overlayGrad:  'linear-gradient(160deg,#000000 0%,#050400 40%,#080808 80%,#1a1508 100%)',
      gAuthGrad:    'linear-gradient(135deg,#050400 0%,#080808 60%,#111111 100%)',
      logoGrad:     'linear-gradient(135deg,#080808 0%,#1a1508 50%,#c9a84c 100%)',
      logoGlow:     'rgba(201,168,76,0.55)',
      logoRing:     'rgba(201,168,76,0.25)',
      btnGrad:      'linear-gradient(135deg,#1a1508,#c9a84c)',
      btnShadow:    'rgba(201,168,76,0.4)',
      inputFocus:   '#c9a84c',
      accentHex:    '#c9a84c',
      circle1:      'rgba(201,168,76,0.1)',
      circle2:      'rgba(26,21,8,0.5)',
      iconFill:     '#c9a84c',
      iconSvg: `<path d="M4 17h14M6 17V11l1.5 2L11 4l3.5 9L16 11v6" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
                <circle cx="4.5" cy="10.5" r="1.5" fill="rgba(255,255,255,0.9)"/>
                <circle cx="11"  cy="3.5"  r="1.5" fill="rgba(255,255,255,0.9)"/>
                <circle cx="17.5" cy="10.5" r="1.5" fill="rgba(255,255,255,0.9)"/>`,
    },
    light: {
      overlayGrad:  'linear-gradient(160deg,#c7f0e0 0%,#e0f7f2 40%,#f4f7f6 80%,#ffffff 100%)',
      gAuthGrad:    'linear-gradient(135deg,#e0f7f2 0%,#f4f7f6 60%,#ffffff 100%)',
      logoGrad:     'linear-gradient(135deg,#ccf5e6 0%,#a0ebd4 50%,#5fd9b4 100%)',
      logoGlow:     'rgba(0,177,117,0.25)',
      logoRing:     'rgba(0,177,117,0.15)',
      btnGrad:      'linear-gradient(135deg,#00b175,#00b4d8)',
      btnShadow:    'rgba(0,177,117,0.3)',
      inputFocus:   '#00b175',
      accentHex:    '#00b175',
      circle1:      'rgba(0,177,117,0.06)',
      circle2:      'rgba(0,180,216,0.08)',
      iconFill:     '#00b175',
      iconSvg: `<circle cx="11" cy="11" r="4" fill="#00b175"/>
                <line x1="11" y1="2"  x2="11" y2="4.5" stroke="#00b175" stroke-width="2" stroke-linecap="round"/>
                <line x1="11" y1="17.5" x2="11" y2="20" stroke="#00b175" stroke-width="2" stroke-linecap="round"/>
                <line x1="2"  y1="11" x2="4.5" y2="11" stroke="#00b175" stroke-width="2" stroke-linecap="round"/>
                <line x1="17.5" y1="11" x2="20" y2="11" stroke="#00b175" stroke-width="2" stroke-linecap="round"/>
                <line x1="4.5" y1="4.5"   x2="6.3" y2="6.3"   stroke="#00b175" stroke-width="2" stroke-linecap="round"/>
                <line x1="15.7" y1="15.7" x2="17.5" y2="17.5" stroke="#00b175" stroke-width="2" stroke-linecap="round"/>
                <line x1="17.5" y1="4.5"  x2="15.7" y2="6.3"  stroke="#00b175" stroke-width="2" stroke-linecap="round"/>
                <line x1="6.3"  y1="15.7" x2="4.5" y2="17.5"  stroke="#00b175" stroke-width="2" stroke-linecap="round"/>`,
    },
    gray: {
      overlayGrad:  'linear-gradient(160deg,#F4F5F7 0%,#E6E9EC 100%)',
      gAuthGrad:    'linear-gradient(135deg,#F4F5F7 0%,#E6E9EC 100%)',
      logoGrad:     'linear-gradient(135deg,#1B1F24 0%,#2B3138 100%)',
      logoGlow:     'rgba(26,30,35,0.30)',
      logoRing:     'rgba(26,30,35,0.12)',
      btnGrad:      'linear-gradient(135deg,#3F4852,#5A6470)',
      btnShadow:    'rgba(26,30,35,0.25)',
      inputFocus:   '#3F4852',
      accentHex:    '#3F4852',
      circle1:      'rgba(26,30,35,0.05)',
      circle2:      'rgba(26,30,35,0.03)',
      iconFill:     '#ffffff',
      iconSvg: `<circle cx="11" cy="11" r="4" fill="#ffffff"/>`,
    },
    claude: {
      overlayGrad:  'linear-gradient(160deg,#faf9f5 0%,#f0eee6 100%)',
      gAuthGrad:    'linear-gradient(135deg,#faf9f5 0%,#f0eee6 100%)',
      logoGrad:     'linear-gradient(135deg,#c6613f 0%,#c6613f 100%)',
      logoGlow:     'rgba(217,119,87,0.30)',
      logoRing:     'rgba(217,119,87,0.15)',
      btnGrad:      'linear-gradient(135deg,#c6613f,#c6613f)',
      btnShadow:    'rgba(217,119,87,0.25)',
      inputFocus:   '#c6613f',
      accentHex:    '#c6613f',
      circle1:      'rgba(217,119,87,0.06)',
      circle2:      'rgba(217,119,87,0.04)',
      iconFill:     '#ffffff',
      iconSvg: `<circle cx="11" cy="11" r="4" fill="#ffffff"/>
                <path d="M11 2v3M11 17v3M2 11h3M17 11h3M4.6 4.6l2.1 2.1M15.3 15.3l2.1 2.1M17.4 4.6l-2.1 2.1M6.7 15.3l-2.1 2.1" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`,
    },
    claudedark: {
      overlayGrad:  'linear-gradient(160deg,#262624 0%,#30302e 100%)',
      gAuthGrad:    'linear-gradient(135deg,#262624 0%,#30302e 100%)',
      logoGrad:     'linear-gradient(135deg,#d97757 0%,#d97757 100%)',
      logoGlow:     'rgba(217,119,87,0.30)',
      logoRing:     'rgba(217,119,87,0.15)',
      btnGrad:      'linear-gradient(135deg,#d97757,#d97757)',
      btnShadow:    'rgba(217,119,87,0.25)',
      inputFocus:   '#d97757',
      accentHex:    '#d97757',
      circle1:      'rgba(217,119,87,0.06)',
      circle2:      'rgba(217,119,87,0.04)',
      iconFill:     '#ffffff',
      iconSvg: `<circle cx="11" cy="11" r="4" fill="#ffffff"/>
                <path d="M11 2v3M11 17v3M2 11h3M17 11h3M4.6 4.6l2.1 2.1M15.3 15.3l2.1 2.1M17.4 4.6l-2.1 2.1M6.7 15.3l-2.1 2.1" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`,
    },
  };

  const td = themeData[themeId] || themeData.midnight;

  // ── Auth Overlay Background ──
  const authOv = document.getElementById('authOverlay');
  if (authOv) authOv.style.background = td.overlayGrad;

  // ── Google Auth Overlay ──
  const gAuthOv = document.getElementById('googleAuthOverlay');
  if (gAuthOv) gAuthOv.style.background = td.gAuthGrad;

  // ── Auth Logo (إذا كان emoji بدل صورة، نلوّن الخلفية) ──
  const authLogoEl = document.querySelector('.auth-logo');
  if (authLogoEl) {
    authLogoEl.style.background = td.logoGrad;
    authLogoEl.style.boxShadow = `0 8px 28px ${td.logoGlow}, 0 0 0 4px ${td.logoRing}`;
  }

  // ── زر الدخول ──
  const authBtn = document.getElementById('authSubmitBtn');
  if (authBtn) {
    authBtn.style.background = td.btnGrad;
    authBtn.style.boxShadow = `0 4px 14px ${td.btnShadow}`;
  }

  // ── زر البيو (أو) ──
  const bioBtnEl = document.querySelector('.auth-bio-btn');
  if (bioBtnEl) bioBtnEl.style.borderColor = td.accentHex;

  // ── input focus color (CSS custom prop override) ──
  const authInput = document.querySelector('.auth-input');
  if (authInput) {
    // نخزن في style attribute ليُستخدم عند التركيز
    authInput.dataset.focusColor = td.inputFocus;
  }

  // ── accent-color للـ checkbox ──
  const rememberCb = document.getElementById('authRememberMe');
  if (rememberCb) rememberCb.style.accentColor = td.accentHex;

  // ── الأيقونة في الهيدر — تتغير شكل + لون مع الثيم ──
  const brandIcon = document.querySelector('.header-brand-icon');
  if (brandIcon && !brandIcon.querySelector('img, .mz-logo')) {
    brandIcon.style.background  = td.logoGrad;
    brandIcon.style.boxShadow   = `0 2px 10px ${td.logoGlow}, 0 0 0 1.5px ${td.logoRing}`;
    if (td.iconSvg) {
      let svg = brandIcon.querySelector('svg');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 22 22');
        svg.setAttribute('width','18'); svg.setAttribute('height','18');
        svg.style.flexShrink = '0';
        brandIcon.innerHTML = '';
        brandIcon.appendChild(svg);
      }
      svg.innerHTML = td.iconSvg;
    }
  }

  // ── gauth logo تحديث ──
  const gauthLogo = document.querySelector('.gauth-logo');
  if (gauthLogo) gauthLogo.style.background = td.logoGrad;

  // ── splash icon تحديث ──
  const splashIcon = document.querySelector('.splash-icon');
  if (splashIcon) splashIcon.style.background = td.logoGrad;

  renderThemeOptions();
}

function renderThemeOptions() {
  const container = document.getElementById('themeOptions');
  if (!container) return;
  const current = localStorage.getItem('appTheme') || 'gray';

  const themeButtons = THEMES.map(t => `
    <button onclick="applyTheme('${t.id}');closeThemeDrop()" style="
      display:flex;align-items:center;gap:10px;width:100%;
      padding:8px 10px;border-radius:9px;border:2px solid ${t.id===current?'var(--accent)':'var(--border)'};
      background:${t.id===current?'rgba(var(--accent-rgb,91,110,74),0.08)':'transparent'};
      font-family:'Cairo',sans-serif;font-size:0.82rem;font-weight:700;
      color:var(--text);cursor:pointer;text-align:right;transition:all 0.15s
    ">
      <span style="width:22px;height:22px;border-radius:6px;background:${t.accent};flex-shrink:0;display:inline-block;box-shadow:0 2px 6px ${t.accent}55"></span>
      <span style="flex:1">${t.name}</span>
      ${t.id===current ? '<span style="color:var(--accent);font-size:0.9rem">✓</span>' : ''}
    </button>
  `).join('');

  container.innerHTML = themeButtons;
}

function toggleHdrMore() {
  const dd = document.getElementById('hdrMoreDropdown');
  if (!dd) return;
  const isOpen = dd.style.display !== 'none';
  closeHdrMore();
  closeThemeDrop();
  if (!isOpen) {
    dd.style.display = 'block';
    setTimeout(() => document.addEventListener('click', _hdrMoreOutsideClick), 0);
  }
}
function closeHdrMore() {
  const dd = document.getElementById('hdrMoreDropdown');
  if (dd) dd.style.display = 'none';
  document.removeEventListener('click', _hdrMoreOutsideClick);
}
function _hdrMoreOutsideClick(e) {
  const wrap = document.getElementById('hdrMoreWrap');
  // لا تقفل لو الضغطة جوه قائمة الثيمات المتفرعة منها (themeDropWrap) عشان اختيار اللون يفضل شغال
  const themeWrap = document.getElementById('themeDropWrap');
  if (wrap && !wrap.contains(e.target) && !(themeWrap && themeWrap.contains(e.target))) closeHdrMore();
}

function toggleThemeDrop() {
  const dd = document.getElementById('themeDropdown');
  if (!dd) return;
  const isOpen = dd.style.display !== 'none';
  closeThemeDrop();
  if (!isOpen) {
    renderThemeOptions();
    dd.style.display = 'block';
    setTimeout(() => document.addEventListener('click', _themeOutsideClick), 0);
  }
}
function closeThemeDrop() {
  const dd = document.getElementById('themeDropdown');
  if (dd) dd.style.display = 'none';
  document.removeEventListener('click', _themeOutsideClick);
}
function _themeOutsideClick(e) {
  const wrap = document.getElementById('themeDropWrap');
  if (wrap && !wrap.contains(e.target)) closeThemeDrop();
}

// تطبيق الثيم المحفوظ عند التحميل
(function() {
  const saved = localStorage.getItem('appTheme') || 'gray';
  applyTheme(saved);
  // focus/blur لتلوين الـ border حسب الثيم
  document.addEventListener('DOMContentLoaded', () => {
    const inp = document.querySelector('.auth-input');
    if (inp) {
      inp.addEventListener('focus', function() {
        this.style.borderColor = this.dataset.focusColor || 'var(--accent)';
      });
      inp.addEventListener('blur', function() {
        if (!this.classList.contains('error')) this.style.borderColor = '';
      });
    }
  });
})();

// ══════════════════════════════════════════

// ══════════════════════════════════════════
// 📄 EXPORT — PDF & Excel
// ══════════════════════════════════════════

function _expFmt(n) { return Math.round(parseNum(n)).toLocaleString(_numLocale()); }
function _expShowOverlay(msg) {
  let el = document.getElementById('exportOverlay');
  if (!el) {
    el = document.createElement('div'); el.id = 'exportOverlay';
    el.innerHTML = `<div class="exp-spinner"></div><div id="exportOverlayMsg">${msg}</div>`;
    document.body.appendChild(el);
  } else {
    document.getElementById('exportOverlayMsg').textContent = msg;
    el.style.display = 'flex';
  }
}
function _expHideOverlay() {
  const el = document.getElementById('exportOverlay');
  if (el) el.style.display = 'none';
}

// ════════════════════════════════
// EXPORT MODAL
// ════════════════════════════════
function showTutorialModal() { document.getElementById('tutorialModal').classList.add('open'); }
function closeTutorialModal() { document.getElementById('tutorialModal').classList.remove('open'); }

function showExportModal() {
  const modal = document.getElementById('exportModal');
  if (!modal) return;
  modal.classList.add('open');
  // ملء قائمة الشهور
  const sel = document.getElementById('expMonthSelect');
  const allKeys = Object.keys(state).filter(k => /^\d{4}-\d{2}$/.test(k)).sort().reverse();
  sel.innerHTML = allKeys.map(k => `<option value="${k}"${k===currentMonth?' selected':''}>${monthLabel(k)}</option>`).join('');
  // عدد الشهور
  const countEl = document.getElementById('expAllCount');
  if (countEl) countEl.textContent = allKeys.length + ' ' + t('export_months_count_suffix');
  // reset to defaults
  expRangeSelect('all');
  expTypeChanged();
}
function closeExportModal() {
  document.getElementById('exportModal')?.classList.remove('open');
}
function expRangeSelect(v) {
  document.querySelectorAll('[name="expRange"]').forEach(r => r.value === v ? (r.checked = true) : null);
  const allBtn = document.getElementById('expRangeAll');
  const oneBtn = document.getElementById('expRangeOne');
  const picker = document.getElementById('expMonthPicker');
  if (v === 'all') {
    allBtn.style.border = '2px solid var(--accent2)';
    allBtn.style.background = 'rgba(91,110,74,0.1)';
    allBtn.querySelector('div').style.color = 'var(--accent2)';
    oneBtn.style.border = '2px solid var(--border)';
    oneBtn.style.background = 'transparent';
    oneBtn.querySelector('div').style.color = 'var(--text)';
    picker.style.display = 'none';
  } else {
    oneBtn.style.border = '2px solid var(--accent2)';
    oneBtn.style.background = 'rgba(91,110,74,0.1)';
    oneBtn.querySelector('div').style.color = 'var(--accent2)';
    allBtn.style.border = '2px solid var(--border)';
    allBtn.style.background = 'transparent';
    allBtn.querySelector('div').style.color = 'var(--text)';
    picker.style.display = 'block';
  }
}
function expTypeChanged() {
  const val = document.querySelector('[name="expType"]:checked')?.value || 'excel';
  const excelBtn = document.getElementById('expTypeExcel');
  const pdfBtn = document.getElementById('expTypePDF');
  if (val === 'excel') {
    excelBtn.style.border = '2px solid var(--accent2)';
    excelBtn.style.background = 'rgba(91,110,74,0.1)';
    pdfBtn.style.border = '2px solid var(--border)';
    pdfBtn.style.background = 'transparent';
  } else {
    pdfBtn.style.border = '2px solid var(--accent2)';
    pdfBtn.style.background = 'rgba(91,110,74,0.1)';
    excelBtn.style.border = '2px solid var(--border)';
    excelBtn.style.background = 'transparent';
  }
}
async function doExport() {
  try { localStorage.setItem('lastBackupTs', String(Date.now())); } catch(e) {}
  const type  = document.querySelector('[name="expType"]:checked')?.value || 'excel';
  const range = document.querySelector('[name="expRange"]:checked')?.value || 'all';
  const selMonth = range === 'one' ? document.getElementById('expMonthSelect')?.value : null;
  closeExportModal();
  if (type === 'excel') await exportToExcel(selMonth);
  else await exportToPDF(selMonth);
}

// ════════════════════════════════
// 🔔 EXPORT REMINDER — لما يتقفل شهر
// ════════════════════════════════
let _expReminderMonthKey = null; // 'YYYY-MM' لو الشهر مرتبط بستيت رئيسي، أو null لو تصدير عام (شهادات/صناديق)

function _expExportedList() {
  try { return JSON.parse(localStorage.getItem('exportedMonths') || '[]'); } catch (e) { return []; }
}
function _expMarkExported(key) {
  if (!key) return;
  try {
    const arr = _expExportedList();
    if (!arr.includes(key)) { arr.push(key); localStorage.setItem('exportedMonths', JSON.stringify(arr)); }
  } catch (e) {}
}
function _expIsExported(key) {
  return !key || _expExportedList().includes(key);
}

// monthKey: مفتاح 'YYYY-MM' لتصدير شهر بعينه، أو null لتصدير كل البيانات (تُستخدم مع قفل الشهادات/الصناديق)
function showExportReminder(monthKey, label) {
  if (monthKey && _expIsExported(monthKey)) return;
  _expReminderMonthKey = monthKey || null;
  const titleEl = document.getElementById('expReminderTitle');
  if (titleEl) titleEl.textContent = `🔒 اتقفل شهر ${label || monthLabel(monthKey)}`;
  const modal = document.getElementById('exportReminderModal');
  if (modal) modal.classList.add('open');
}
function closeExportReminder() {
  const modal = document.getElementById('exportReminderModal');
  if (modal) modal.classList.remove('open');
}
async function _expReminderAction(type) {
  const key = _expReminderMonthKey;
  closeExportReminder();
  if (type === 'excel') await exportToExcel(key || null);
  else await exportToPDF(key || null);
  _expMarkExported(key);
}

// ════════════════════════════════
// 📊  EXCEL EXPORT — SheetJS CDN
// ════════════════════════════════
async function exportToExcel(selMonth) {
  if (_bkBudgetNotReady()) { toast('⏳ الميزانية لسه بتتحمّل من السحابة — استنى لحد ما تظهر ☁️ متزامن وجرّب تاني'); return; }
  _expShowOverlay('جاري تحضير ملف Excel…');
  try {
    if (!window.XLSX) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    const wb = XLSX.utils.book_new();
    const today = new Date();

    // كل مفاتيح الشهور المرتبة (أو شهر واحد)
    const allKeys = Object.keys(state).filter(k => /^\d{4}-\d{2}$/.test(k)).sort()
      .filter(k => !selMonth || k === selMonth);
    const allMonthsData = allKeys.map(k => ({ key: k, label: monthLabel(k), d: state[k], s: computeMonthStats(state[k], k) }));

    // ── Sheet 1: ملخص كل الشهور ──
    const summaryHeaders = ['الشهر','عائد الشهادات','عائد الصناديق','إجمالي العائد','أقساط الفيزا','أقساط الديون','إجمالي الالتزامات','الصافي','رأس مال الشهادات','رأس مال الصناديق'];
    const summaryRows = [summaryHeaders];
    allMonthsData.forEach(({ label, s }) => {
      summaryRows.push([label, s.certsReturn, s.fundsReturn, s.totalReturn, s.visaReq, s.debtsMonthly, s.totalOut, s.net, s.certsPrincipal, s.fundsPrincipal]);
    });
    // إجمالي كلي
    const totNet = allMonthsData.reduce((a,{s})=>a+s.net,0);
    const totRet = allMonthsData.reduce((a,{s})=>a+s.totalReturn,0);
    const totOut = allMonthsData.reduce((a,{s})=>a+s.totalOut,0);
    summaryRows.push(['الإجمالي الكلي','','',totRet,'','',totOut,totNet,'','']);
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    wsSummary['!cols'] = [{wch:16},{wch:16},{wch:16},{wch:16},{wch:14},{wch:14},{wch:18},{wch:14},{wch:18},{wch:18}];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'ملخص كل الشهور');

    // ── Sheet 2: الشهادات (آخر شهر فيه بيانات) ──
    const latestWithCerts = [...allMonthsData].reverse().find(({d}) => d.certs && d.certs.length > 0);
    if (latestWithCerts) {
      const { label, d, s } = latestWithCerts;
      const certHeaders = ['الشهر','البنك','رقم الشهادة','نوع','الأصل (ج.م)','النسبة %','العائد الشهري (ج.م)','تاريخ البداية','تاريخ الانتهاء','متبقي (يوم)'];
      const certRows = [certHeaders];
      d.certs.forEach(c => {
        const monthly = c.type==='decreasing' ? calcDecreasingMonthly(c) : parseNum(c.amount)*parseNum(c.rate)/100/12;
        const daysLeft = c.endDate ? Math.round((new Date(c.endDate)-today)/86400000) : '';
        certRows.push([label, c.bank||'', c.num||'', c.type==='decreasing'?'متناقص':'ثابت',
          parseNum(c.amount), parseNum(c.rate), Math.round(monthly), c.startDate||'', c.endDate||'', daysLeft]);
      });
      certRows.push(['الإجمالي','','','', s.certsPrincipal,'', Math.round(s.certsReturn),'','','']);
      const wsCerts = XLSX.utils.aoa_to_sheet(certRows);
      wsCerts['!cols'] = [{wch:14},{wch:14},{wch:12},{wch:10},{wch:16},{wch:10},{wch:18},{wch:14},{wch:14},{wch:12}];
      XLSX.utils.book_append_sheet(wb, wsCerts, 'الشهادات');
    }

    // ── Sheet 3: الصناديق (آخر شهر) ──
    const latestWithFunds = [...allMonthsData].reverse().find(({d}) => d.funds && d.funds.length > 0);
    if (latestWithFunds) {
      const { label, d, s } = latestWithFunds;
      const fundsRows = [['الشهر','اسم الصندوق','الأصل (ج.م)','المعدل اليومي %','العائد الشهري (ج.م)','تاريخ البداية']];
      d.funds.forEach(f => {
        fundsRows.push([label, f.name||'', parseNum(f.amount), parseNum(f.dailyRate), Math.round(calcFundMonthlyReturn(f)), f.startDate||'']);
      });
      fundsRows.push(['الإجمالي','', s.fundsPrincipal,'', Math.round(s.fundsReturn),'']);
      const wsFunds = XLSX.utils.aoa_to_sheet(fundsRows);
      wsFunds['!cols'] = [{wch:14},{wch:22},{wch:16},{wch:16},{wch:18},{wch:14}];
      XLSX.utils.book_append_sheet(wb, wsFunds, 'الصناديق');
    }

    // ── Sheet 4: الفيزا — كل الشهور ──
    const visaAllRows = [['الشهر','البطاقة','المطلوب (ج.م)','المدفوع (ج.م)','المتبقي (ج.م)','نسبة السداد %','يوم الاستحقاق','الحالة','الحد الأقصى (ج.م)','المتاح (ج.م)','تاريخ البداية','المدة','نسبة النقاط %']];
    allMonthsData.forEach(({ label, d, s }) => {
      if (!d.visa || !d.visa.length) return;
      d.visa.forEach(v => {
        const req = parseNum(v.required), paid = parseNum(v.paidAmount);
        visaAllRows.push([label, v.name||'', req, paid, Math.max(0,req-paid),
          req>0?Math.round(paid/req*100):0, v.dueDay?'يوم '+v.dueDay:'', v.paid?'مسدد ✓':'معلق',
          parseNum(v.limit), parseNum(v.limit)>0?Math.max(0,parseNum(v.limit)-Math.max(0,req-paid)):'', v.startDate||'', v.period||'', v.pointsPct||'']);
      });
      visaAllRows.push([label+' — إجمالي','', s.visaReq, s.visaPaid, s.visaRem,'','','']);
    });
    if (visaAllRows.length > 1) {
      const wsVisa = XLSX.utils.aoa_to_sheet(visaAllRows);
      wsVisa['!cols'] = [{wch:14},{wch:18},{wch:14},{wch:14},{wch:14},{wch:14},{wch:14},{wch:12}];
      XLSX.utils.book_append_sheet(wb, wsVisa, 'الفيزا - كل الشهور');
    }

    // ── Sheet 5: الأقساط — كل الشهور ──
    const debtAllRows = [['الشهر','الاسم','القسط الشهري (ج.م)','يوم الاستحقاق','الحالة','ملاحظات','إجمالي الدين (ج.م)','المتبقي (ج.م)','عدد الأقساط']];
    allMonthsData.forEach(({ label, d, s }) => {
      if (!d.debts || !d.debts.length) return;
      d.debts.forEach(dd => {
        debtAllRows.push([label, dd.name||'', parseNum(dd.monthly), dd.dueDay||'', dd.paid?'مسدد ✓':'معلق', dd.notes||'', parseNum(dd.totalDebt), parseNum(dd.remaining), dd.installments||'']);
      });
      debtAllRows.push([label+' — إجمالي','', s.debtsMonthly,'','','']);
    });
    if (debtAllRows.length > 1) {
      const wsDebts = XLSX.utils.aoa_to_sheet(debtAllRows);
      wsDebts['!cols'] = [{wch:14},{wch:22},{wch:18},{wch:14},{wch:12},{wch:24}];
      XLSX.utils.book_append_sheet(wb, wsDebts, 'الأقساط - كل الشهور');
    }

    // ── Sheet 6: المحافظ (globalWallets) ──
    const wallets = globalWallets || (allMonthsData[allMonthsData.length-1]?.d?.wallets) || [];
    if (wallets.length) {
      const walletRows = [['المحفظة','الرصيد (ج.م)','ملاحظات']];
      wallets.forEach(w => walletRows.push([w.name||'', parseNum(w.balance), w.notes||'']));
      const wsWallets = XLSX.utils.aoa_to_sheet(walletRows);
      wsWallets['!cols'] = [{wch:20},{wch:16},{wch:30}];
      XLSX.utils.book_append_sheet(wb, wsWallets, 'المحافظ');
    }

    // ── Sheet 7: الميزانية (كل الشهور من BG) ──
    const bgtHeaders = ['السنة','الشهر','الدخل (ج.م)',...BGT_CATS.map(c=>c.n),...BGT_INC_CATS.map(c=>c.n+' (دخل)'),'إجمالي المصروف (ج.م)','الصافي (ج.م)'];
    const bgtRows = [bgtHeaders];
    (BG.years||[]).forEach(yr => {
      yr.months.forEach(m => {
        const inc = bgtTotalInc(m), exp = bgtTotalExp(m);
        if (inc === 0 && exp === 0) return;
        const expCats = BGT_CATS.map(c => (m.items||[]).filter(i=>i.cat===c.k).reduce((s,i)=>s+(i.amt||0),0));
        const incCats = BGT_INC_CATS.map(c => (m.incomeSources||[]).filter(i=>i.cat===c.k).reduce((s,i)=>s+(i.amt||0),0));
        bgtRows.push([yr.name, m.name, inc, ...expCats, ...incCats, exp, inc-exp]);
      });
    });
    const wsBgt = XLSX.utils.aoa_to_sheet(bgtRows);
    wsBgt['!cols'] = [{wch:8},{wch:10},{wch:16},...BGT_CATS.map(()=>({wch:14})),...BGT_INC_CATS.map(()=>({wch:16})),{wch:18},{wch:14}];
    XLSX.utils.book_append_sheet(wb, wsBgt, 'الميزانية');

    // ── Sheet: البيانات الأساسية للكروت والمديونيات ──
    const _base = _bkCollectBase(state);
    const baseRows = [['النوع','الاسم','الحد الأقصى (ج.م)','القسط الشهري (ج.م)','إجمالي الدين (ج.م)','المتبقي (ج.م)','عدد الأقساط','يوم الاستحقاق','تاريخ البداية','المدة','نسبة النقاط %','ملاحظات']];
    _base.visa.forEach(v => baseRows.push(['فيزا', v.name||'', parseNum(v.limit), '', '', '', '', v.dueDay||'', v.startDate||'', v.period||'', v.pointsPct||'', v.notes||'']));
    _base.debts.forEach(d => baseRows.push(['مديونية', d.name||'', '', parseNum(d.monthly), parseNum(d.totalDebt), parseNum(d.remaining), d.installments||'', d.dueDay||'', d.startDate||'', '', '', d.notes||'']));
    if (baseRows.length > 1) {
      const wsBase = XLSX.utils.aoa_to_sheet(baseRows);
      wsBase['!cols'] = [{wch:10},{wch:22},{wch:16},{wch:16},{wch:16},{wch:14},{wch:12},{wch:12},{wch:14},{wch:10},{wch:12},{wch:24}];
      XLSX.utils.book_append_sheet(wb, wsBase, 'البيانات الأساسية');
    }
    // ── Sheet مخفية: نسخة كاملة للاستيراد الذكي (بدون صور الكروت عشان الحجم) ──
    try {
      const _bk = buildBackup();
      Object.keys(_bk.data.state).forEach(k => { const m = _bk.data.state[k]; if (_bkIsObj(m) && Array.isArray(m.visa)) m.visa.forEach(v => { delete v.imgFront; delete v.imgBack; }); });
      const _txt = JSON.stringify(_bk), _rows = [['MATAA_BACKUP_V1']];
      for (let i = 0; i < _txt.length; i += 30000) _rows.push([_txt.slice(i, i + 30000)]);
      const wsHid = XLSX.utils.aoa_to_sheet(_rows);
      XLSX.utils.book_append_sheet(wb, wsHid, '_mataa_data');
      wb.Workbook = { Sheets: wb.SheetNames.map(n => ({ Hidden: n === '_mataa_data' ? 1 : 0 })) };
    } catch (e) { console.warn('hidden backup sheet failed', e); }

    const fileName = selMonth ? `شيت_استثمار_${monthLabel(selMonth)}_${new Date().toISOString().slice(0,10)}.xlsx` : `شيت_استثمار_كامل_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    _expHideOverlay();
  } catch(e) {
    _expHideOverlay();
    alert('خطأ في تصدير Excel: ' + e.message);
    console.error(e);
  }
}

// ════════════════════════════════
// 📄  PDF EXPORT — html2canvas + jsPDF (Arabic-safe)
// ════════════════════════════════════════════════════
async function exportToPDF(selMonth) {
  _expShowOverlay('جاري تحضير ملف PDF…');
  try {
    // تحميل المكتبات
    if (!window.html2canvas) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    if (!window.jspdf) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }

    const today = new Date();
    const allKeys = Object.keys(state).filter(k => /^\d{4}-\d{2}$/.test(k)).sort()
      .filter(k => !selMonth || k === selMonth);
    const allMonthsData = allKeys.map(k => ({ key: k, label: monthLabel(k), d: state[k], s: computeMonthStats(state[k], k) }));
    const activeKey = selMonth || currentMonth;
    const d = state[activeKey] || getData();
    const s = computeMonthStats(d, activeKey);
    const label = monthLabel(activeKey);
    const dateStr = today.toLocaleDateString(_numLocale());

    function fmtN(n) { return (parseFloat(n)||0).toLocaleString(_numLocale(),{maximumFractionDigits:0}); }

    // بناء HTML
    function tableHtml(headers, rows) {
      const ths = headers.map(h => `<th>${h}</th>`).join('');
      const trs = rows.map((r,i) => `<tr class="${i%2?'alt':''}">` + r.map(c=>`<td>${c}</td>`).join('') + '</tr>').join('');
      return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    }

    function sectionHtml(title, tableH) {
      return `<div class="section"><div class="sec-title">${title}</div>${tableH}</div>`;
    }

    // شهادات
    let certsHtml = '';
    if (d.certs && d.certs.length) {
      const rows = d.certs.map(c => {
        const monthly = c.type==='decreasing' ? calcDecreasingMonthly(c) : parseNum(c.amount)*parseNum(c.rate)/100/12;
        const daysLeft = c.endDate ? Math.round((new Date(c.endDate)-today)/86400000) : '-';
        return [c.bank||'-', c.num||'-', c.type==='decreasing'?'متناقص':'ثابت',
          fmtN(c.amount)+' ج', c.rate+'%', fmtN(monthly)+' ج', daysLeft+(daysLeft!=='-'?' يوم':'')];
      });
      certsHtml = sectionHtml(`الشهادات البنكية (${d.certs.length})`,
        tableHtml(['البنك','رقم','النوع','الأصل','النسبة%','العائد الشهري','ينتهي'], rows));
    }

    // صناديق
    let fundsHtml = '';
    if (d.funds && d.funds.length) {
      const rows = d.funds.map(f => [f.name||'-', fmtN(f.amount)+' ج', f.dailyRate+'%', fmtN(calcFundMonthlyReturn(f))+' ج']);
      fundsHtml = sectionHtml(`صناديق الاستثمار (${d.funds.length})`,
        tableHtml(['اسم الصندوق','الأصل','المعدل اليومي%','العائد الشهري'], rows));
    }

    // فيزا
    let visaHtml = '';
    if (d.visa && d.visa.length) {
      const rows = d.visa.map(v => {
        const req=parseNum(v.required), paid=parseNum(v.paidAmount);
        return [v.name||'-', fmtN(req)+' ج', fmtN(paid)+' ج', fmtN(Math.max(0,req-paid))+' ج',
          v.dueDay?'يوم '+v.dueDay:'-', v.paid?'✓ مسدد':'معلق'];
      });
      visaHtml = sectionHtml(`بطاقات الفيزا (${d.visa.length})`,
        tableHtml(['البطاقة','المطلوب','المدفوع','المتبقي','الاستحقاق','الحالة'], rows));
    }

    // ديون
    let debtsHtml = '';
    if (d.debts && d.debts.length) {
      const rows = d.debts.map(dd => [dd.name||'-', fmtN(dd.monthly)+' ج', dd.dueDay||'-', dd.paid?'✓ مسدد':'معلق']);
      debtsHtml = sectionHtml(`الأقساط والديون (${d.debts.length})`,
        tableHtml(['الاسم','القسط الشهري','يوم الاستحقاق','الحالة'], rows));
    }

    // ملخص الشهور
    let allMonthsHtml = '';
    if (allMonthsData.length > 1) {
      const rows = allMonthsData.map(({label:ml, s:ms}) => [
        ml, fmtN(ms.totalReturn)+' ج', fmtN(ms.totalOut)+' ج',
        (ms.net>=0?'+':'')+fmtN(ms.net)+' ج',
        fmtN(ms.certsPrincipal+ms.fundsPrincipal)+' ج'
      ]);
      allMonthsHtml = sectionHtml(`ملخص كل الشهور (${allMonthsData.length})`,
        tableHtml(['الشهر','العائد','الالتزامات','الصافي','رأس المال'], rows));
    }

    // ميزانية
    let bgtHtml = '';
    const bgtMonths = [];
    (BG.years||[]).forEach(y2 => y2.months.forEach(m => { if(bgtTotalInc(m)>0||bgtTotalExp(m)>0) bgtMonths.push({y:y2.name,m}); }));
    if (bgtMonths.length) {
      const rows = bgtMonths.map(({y:yr,m}) => {
        const inc=bgtTotalInc(m), exp=bgtTotalExp(m);
        const cats = BGT_CATS.map(c=>(m.items||[]).filter(i=>i.cat===c.k).reduce((sm,i)=>sm+(i.amt||0),0));
        return [yr, m.name, fmtN(inc)+' ج', ...cats.map(v=>v>0?fmtN(v)+' ج':'-'), fmtN(exp)+' ج', (inc-exp>=0?'+':'')+fmtN(inc-exp)+' ج'];
      });
      bgtHtml = sectionHtml('الميزانية الشهرية',
        tableHtml(['السنة','الشهر','الدخل',...BGT_CATS.map(c=>c.n),'المصروف','الصافي'], rows));
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', sans-serif; background: #fff; color: #1a1814; font-size: 12px; width: 794px; }
  .header { background: var(--accent); color: #fff; padding: 18px 24px; text-align: center; }
  .header h1 { font-size: 20px; font-weight: 900; }
  .header p { font-size: 11px; opacity: 0.85; margin-top: 4px; }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px 24px; }
  .card { border-radius: 8px; padding: 12px 16px; color: #fff; }
  .card .lbl { font-size: 10px; opacity: 0.9; }
  .card .val { font-size: 16px; font-weight: 900; margin-top: 2px; }
  .card.green { background: var(--accent); }
  .card.red { background: #b95032; }
  .card.blue { background: #4a5080; }
  .card.teal { background: #3c8260; }
  .section { padding: 0 24px 16px; }
  .sec-title { background: var(--surface); color: var(--accent); font-weight: 700; font-size: 13px; padding: 7px 12px; margin-bottom: 6px; border-right: 4px solid var(--accent); }
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  th { background: var(--accent); color: #fff; padding: 6px 8px; text-align: right; font-weight: 700; }
  td { padding: 5px 8px; text-align: right; border-bottom: 1px solid #e8e4dc; }
  tr.alt td { background: #f8fbf5; }
  .footer { text-align: center; color: #999; font-size: 9px; padding: 12px; border-top: 1px solid #e0dbd0; margin-top: 8px; }
</style>
</head>
<body>
<div class="header">
  <h1>📊 تقرير Vault</h1>
  <p>شهر ${label}  •  تاريخ التصدير: ${dateStr}</p>
</div>
<div class="cards">
  <div class="card green"><div class="lbl">العائد الشهري الكلي</div><div class="val">${fmtN(s.totalReturn)} ج.م</div></div>
  <div class="card red"><div class="lbl">إجمالي الالتزامات</div><div class="val">${fmtN(s.totalOut)} ج.م</div></div>
  <div class="card ${s.net>=0?'teal':'red'}"><div class="lbl">الصافي الشهري</div><div class="val">${s.net>=0?'+':''}${fmtN(s.net)} ج.م</div></div>
  <div class="card blue"><div class="lbl">رأس المال الكلي</div><div class="val">${fmtN(s.certsPrincipal+s.fundsPrincipal)} ج.م</div></div>
</div>
${certsHtml}${fundsHtml}${visaHtml}${debtsHtml}${allMonthsHtml}${bgtHtml}
<div class="footer">Vault  •  ${today.toLocaleString(_numLocale())}</div>
</body></html>`;

    // إنشاء iframe مخفي للرسم
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:1px;border:none;';
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlContent);
    iframe.contentDocument.close();

    // انتظر تحميل الخط
    await new Promise(r => setTimeout(r, 1200));

    const canvas = await html2canvas(iframe.contentDocument.body, {
      scale: 2, useCORS: true, allowTaint: true,
      width: 794,
      height: iframe.contentDocument.body.scrollHeight,
      windowWidth: 794,
    });
    document.body.removeChild(iframe);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * pageW) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    // تقسيم على صفحات
    let yPos = 0;
    while (yPos < imgH) {
      if (yPos > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -yPos, imgW, imgH);
      yPos += pageH;
    }

    const fileName = selMonth
      ? `شيت_استثمار_${label}_${today.toISOString().slice(0,10)}.pdf`
      : `شيت_استثمار_كامل_${today.toISOString().slice(0,10)}.pdf`;
    pdf.save(fileName);
    _expHideOverlay();
  } catch(e) {
    _expHideOverlay();
    alert('خطأ في تصدير PDF: ' + e.message);
    console.error(e);
  }
}
