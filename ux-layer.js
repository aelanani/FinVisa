/* ═══════════════════════════════════════════════════════════════
   ✨ UX LAYER — تراجع / تركيز تلقائي / اختصارات / حالات فاضية / تحقق / تحميل / استرجاع أخطاء
   (طبقة مستقلة: بتغلّف الدوال الموجودة من غير ما تغيّر منطقها)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__UX_LAYER__) return; window.__UX_LAYER__ = true;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const has = n => typeof window[n] === 'function';
  const call = (n, ...a) => { try { if (has(n)) return window[n](...a); } catch (e) { console.warn('[UX]', n, e); } };
  const isTouch = () => window.matchMedia && matchMedia('(hover: none)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ───────── Snackbar (رسالة بزرار إجراء) ───────── */
  let snackTimer = 0;
  function snack(msg, actions, ms) {
    let el = $('#uxSnack');
    if (!el) { el = document.createElement('div'); el.id = 'uxSnack'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = '<span class="ux-snack-msg">' + esc(msg) + '</span>';
    (actions || []).forEach(a => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = a.label;
      b.onclick = () => { hideSnack(); try { a.fn(); } catch (e) { console.error(e); } };
      el.appendChild(b);
    });
    el.classList.add('show');
    clearTimeout(snackTimer);
    snackTimer = setTimeout(hideSnack, ms || 7000);
  }
  function hideSnack() { const el = $('#uxSnack'); if (el) el.classList.remove('show'); }

  /* ═══════════ 13) UNDO ═══════════ */
  const undoStack = [];
  const roots = () => ({
    state: typeof state !== 'undefined' ? state : null,
    wallets: typeof globalWallets !== 'undefined' ? globalWallets : null,
    bg: typeof BG !== 'undefined' ? BG : null,
    reminders: typeof customReminders !== 'undefined' ? customReminders : null
  });
  const snapStr = () => { const r = roots(); return JSON.stringify([r.state, r.wallets, r.bg, r.reminders]); };
  function assignInto(t, src) {
    if (t == null || src == null) return;
    if (Array.isArray(t)) { t.length = 0; src.forEach(x => t.push(x)); }
    else { Object.keys(t).forEach(k => delete t[k]); Object.assign(t, src); }
  }
  function rerenderAll() {
    ['renderMonthNav', 'renderVisa', 'renderCerts', 'renderFunds', 'renderDebts', 'renderWallets', 'renderOffers', 'renderOfferPoints',
      'renderFinishedDebts', 'renderFinishedFunds', 'renderDueDates', 'renderMonthGlance', 'updateSummary', 'bgtRender'].forEach(n => call(n));
  }
  function undoLast() {
    const e = undoStack.pop();
    if (!e) { if (window.toast) toast('مفيش حاجة للتراجع عنها'); return; }
    try {
      const [s, w, b, r] = JSON.parse(e.snap), R = roots();
      assignInto(R.state, s); assignInto(R.wallets, w); assignInto(R.bg, b); assignInto(R.reminders, r);
      call('saveWallets'); call('autoSave'); call('bgtSave'); call('saveReminders');
      rerenderAll();
      if (window.toast) toast('↩ تم التراجع: ' + e.label);
    } catch (err) { showError('تعذّر التراجع', err); }
  }
  const UNDO_FNS = {
    delVisaEntry: 'حذف حركة سداد', delWalletEntry: 'حذف حركة محفظة', delCashbackEntry: 'حذف كاش باك', deleteVisa: 'حذف بطاقة', deleteWallet: 'حذف محفظة',
    deleteCert: 'حذف شهادة', deleteDebt: 'حذف مديونية', deleteFund: 'حذف صندوق', deleteMovement: 'حذف حركة', deleteOffer: 'حذف عرض', deleteOfferPoint: 'حذف نقطة عرض',
    deleteCustomReminder: 'حذف تذكير', deleteFinishedDebt: 'حذف مديونية منتهية', deleteFinishedFund: 'حذف صندوق منتهي',
    resetVisaRow: 'تصفير بطاقة', resetAllVisa: 'تصفير كل الفيزا', resetWalletUsed: 'تصفير محفظة', resetAllWallets: 'تصفير كل المحافظ', resetDebt: 'تصفير مديونية',
    clearVisaImgs: 'مسح صور البطاقة', bgtDelItem: 'حذف مصروف', bgtDelInc: 'حذف مصدر دخل', bgtDelMonth: 'حذف شهر', bgtDelYear: 'حذف سنة'
  };
  function wrapUndo(name, label) {
    const orig = window[name]; if (typeof orig !== 'function' || orig.__ux) return;
    const w = function () {
      let before; try { before = snapStr(); } catch (e) { return orig.apply(this, arguments); }
      const r = orig.apply(this, arguments);
      const finish = () => {
        try {
          if (snapStr() !== before) {
            undoStack.push({ snap: before, label }); if (undoStack.length > 6) undoStack.shift();
            snack('✓ ' + label, [{ label: '↩ تراجع', fn: undoLast }], 8000);
          }
        } catch (e) { /* ignore */ }
      };
      (r && typeof r.then === 'function') ? r.then(finish) : finish();
      return r;
    };
    w.__ux = true; window[name] = w;
  }

  /* ═══════════ 19) ERROR RECOVERY ═══════════ */
  const LG_A = 'mataa_last_good_a', LG_B = 'mataa_last_good_b';
  function saveLastGood() {
    try {
      let txt = JSON.stringify(roots().state);
      if (txt.length > 1500000 && has('stateWithoutImages')) txt = JSON.stringify(stateWithoutImages());
      const prev = localStorage.getItem(LG_A); if (prev) localStorage.setItem(LG_B, prev);
      localStorage.setItem(LG_A, JSON.stringify({ t: Date.now(), wallets: roots().wallets, state: JSON.parse(txt) }));
    } catch (e) { /* التخزين ممتلئ: نتجاهل */ }
  }
  function restoreLastGood() {
    try {
      const raw = localStorage.getItem(LG_B) || localStorage.getItem(LG_A);
      if (!raw) { snack('مفيش نسخة سليمة محفوظة لسه'); return; }
      const o = JSON.parse(raw), R = roots();
      if (!confirm('هترجّع آخر نسخة سليمة من ' + new Date(o.t).toLocaleString('ar-EG') + '؟')) return;
      undoStack.push({ snap: snapStr(), label: 'الاسترجاع من نسخة احتياطية' });
      assignInto(R.state, o.state); if (o.wallets) assignInto(R.wallets, o.wallets);
      call('saveWallets'); call('saveState'); rerenderAll(); hideError();
      if (window.toast) toast('✅ تم استرجاع آخر نسخة سليمة');
    } catch (e) { snack('تعذّر الاسترجاع: ' + e.message); }
  }
  function emergencyExport() {
    try {
      const blob = new Blob([JSON.stringify({ app: 'mataa-emergency', t: Date.now(), state: roots().state, wallets: roots().wallets, bg: roots().bg })], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'vault-emergency-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) { alert('تعذّر التصدير: ' + e.message); }
  }
  let lastErrAt = 0;
  function showError(title, err) {
    console.error('[UX]', title, err);
    const now = Date.now(); if (now - lastErrAt < 4000) return; lastErrAt = now;
    let b = $('#uxErrBar');
    if (!b) { b = document.createElement('div'); b.id = 'uxErrBar'; b.setAttribute('role', 'alert'); document.body.appendChild(b); }
    const msg = err && (err.message || String(err)) || '';
    b.innerHTML = '<div class="ux-err-head"><b>⚠️ ' + esc(title) + '</b><button type="button" class="ux-x" aria-label="إغلاق">×</button></div>' +
      '<div class="ux-err-sub">بياناتك محفوظة — ممكن تجرّب واحد من الحلول دي:' + (msg ? '<br><small dir="ltr">' + esc(msg.slice(0, 140)) + '</small>' : '') + '</div>' +
      '<div class="ux-err-actions"><button type="button" data-a="retry">🔄 إعادة رسم الشاشة</button><button type="button" data-a="restore">⏪ آخر نسخة سليمة</button><button type="button" data-a="export">💾 نسخة طوارئ</button><button type="button" data-a="reload">↻ إعادة تحميل</button></div>';
    b.classList.add('show');
    b.onclick = e => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.classList.contains('ux-x')) return hideError();
      const a = t.dataset.a;
      if (a === 'retry') { rerenderAll(); hideError(); if (window.toast) toast('تمت إعادة رسم الشاشة'); }
      if (a === 'restore') restoreLastGood();
      if (a === 'export') emergencyExport();
      if (a === 'reload') location.reload();
    };
  }
  function hideError() { const b = $('#uxErrBar'); if (b) b.classList.remove('show'); }
  window.addEventListener('error', e => {
    const m = String(e.message || '');
    if (/ResizeObserver|Script error|Non-Error promise|extension/i.test(m)) return;
    if (e.filename && !e.filename.startsWith(location.origin) && !/^(file|blob|about):/.test(e.filename)) return;   // أخطاء من إضافات المتصفح/سكربتات خارجية
    showError('حصل خطأ غير متوقع', e.error || m);
  });
  window.addEventListener('unhandledrejection', e => {
    const r = e.reason, m = String(r && r.message || r || '');
    if (/ResizeObserver|AbortError|NetworkError|Failed to fetch|Load failed/i.test(m)) return;
    showError('عملية فشلت', r);
  });
  // الشاشات: لو دالة رسم فشلت، نعرض كارت خطأ بزرار إعادة المحاولة بدل شاشة فاضية
  const RENDER_GRID = { renderVisa: 'visaGrid', renderCerts: 'certsGrid', renderFunds: 'fundsGrid', renderDebts: 'debtsGrid', renderWallets: 'walletsGrid', renderOffers: 'offersGrid' };
  function wrapSafe(name) {
    const orig = window[name]; if (typeof orig !== 'function' || orig.__uxs) return;
    const w = function () {
      try { return orig.apply(this, arguments); }
      catch (err) {
        console.error('[UX] render failed:', name, err);
        const g = RENDER_GRID[name] && document.getElementById(RENDER_GRID[name]);
        if (g) {
          g.innerHTML = '<div class="ux-render-fail"><div class="ux-rf-ico">🛠️</div><div class="ux-rf-t">حصلت مشكلة وإحنا بنعرض القسم ده</div><div class="ux-rf-s">بياناتك سليمة ومحفوظة.</div>' +
            '<div class="ux-rf-btns"><button type="button" class="ux-primary" data-rf="retry">🔄 إعادة المحاولة</button><button type="button" data-rf="restore">⏪ آخر نسخة سليمة</button></div></div>';
          g.querySelector('[data-rf=retry]').onclick = () => w();
          g.querySelector('[data-rf=restore]').onclick = restoreLastGood;
        } else showError('تعذّر عرض جزء من الشاشة', err);
      }
    };
    w.__uxs = true; window[name] = w;
  }
  function wrapSave(name) {
    const orig = window[name]; if (typeof orig !== 'function' || orig.__uxsv) return;
    const w = function () {
      try { const r = orig.apply(this, arguments); if (name === 'saveState') saveLastGoodSoon(); return r; }
      catch (err) {
        const quota = err && (err.name === 'QuotaExceededError' || /quota/i.test(String(err.message)));
        showError(quota ? 'مساحة التخزين المحلي مليانة' : 'تعذّر حفظ التعديل', err);
        try { if (typeof fbSet === 'function' && fbSet && has('stateWithoutImages')) fbSet(stateWithoutImages()); } catch (e2) { /* ignore */ }
      }
    };
    w.__uxsv = true; window[name] = w;
  }
  let lgTimer = 0; function saveLastGoodSoon() { clearTimeout(lgTimer); lgTimer = setTimeout(saveLastGood, 2500); }

  /* ═══════════ 18) LOADING STATES ═══════════ */
  function busy(msg) {
    let o = $('#uxBusy');
    if (!o) { o = document.createElement('div'); o.id = 'uxBusy'; o.setAttribute('role', 'alert'); o.innerHTML = '<div class="ux-busy-box"><div class="ux-spin"></div><div class="ux-busy-t"></div></div>'; document.body.appendChild(o); }
    $('.ux-busy-t', o).textContent = msg || 'جاري التنفيذ…';
    o.classList.add('show'); o._t0 = Date.now();
  }
  function idle() {
    const o = $('#uxBusy'); if (!o) return;
    const wait = Math.max(0, 450 - (Date.now() - (o._t0 || 0)));
    setTimeout(() => o.classList.remove('show'), wait);
  }
  const BUSY_FNS = {
    exportCSV: 'جاري تجهيز ملف CSV…', exportToExcel: 'جاري تجهيز ملف Excel…',
    _exportJSONNow: 'جاري تجهيز النسخة الاحتياطية…', importJSON: 'جاري قراءة الملف واستيراد البيانات…'
  };
  function wrapBusy(name, msg) {
    const orig = window[name]; if (typeof orig !== 'function' || orig.__uxb) return;
    const w = function () {
      const self = this, args = arguments; busy(msg);
      let out;
      // نسيب المتصفح يرسم شاشة التحميل قبل الشغل التقيل
      setTimeout(() => {
        try { out = orig.apply(self, args); }
        catch (err) { showError('فشلت العملية', err); }
        finally { (out && typeof out.then === 'function') ? out.then(idle, idle) : setTimeout(idle, 300); }
      }, 40);
    };
    w.__uxb = true; window[name] = w;
  }
  // شريط تقدّم علوي أثناء مزامنة Firebase + إعادة المحاولة لو فشلت
  function wrapFbStatus() {
    const orig = window.setFbStatus; if (typeof orig !== 'function' || orig.__ux) return;
    const w = function (msg) {
      const r = orig.apply(this, arguments);
      const m = String(msg || '');
      document.body.classList.toggle('ux-saving', /جاري/.test(m));
      if (/فشل|❌/.test(m)) snack('❌ فشل الحفظ على السحابة — بياناتك محفوظة على الجهاز', [{ label: '🔄 إعادة المحاولة', fn: () => call('saveState') }, { label: '💾 نسخة طوارئ', fn: emergencyExport }], 12000);
      return r;
    };
    w.__ux = true; window.setFbStatus = w;
  }

  /* ═══════════ 17) VALIDATION ═══════════ */
  const MAX_AMT = 1e10;
  function flag(el, msg) {
    if (!el) { if (window.toast) toast('⚠️ ' + msg); return; }
    el.classList.add('ux-invalid'); el.setAttribute('aria-invalid', 'true');
    let tip = el.nextElementSibling && el.nextElementSibling.classList.contains('ux-tip') ? el.nextElementSibling : null;
    if (!tip) { tip = document.createElement('div'); tip.className = 'ux-tip'; el.insertAdjacentElement('afterend', tip); }
    tip.textContent = '⚠️ ' + msg;
    try { el.focus(); el.select && el.select(); } catch (e) { /* ignore */ }
    clearTimeout(el._uxT); el._uxT = setTimeout(() => clearFlag(el), 4000);
  }
  function clearFlag(el) {
    el.classList.remove('ux-invalid'); el.removeAttribute('aria-invalid');
    const t = el.nextElementSibling; if (t && t.classList.contains('ux-tip')) t.remove();
  }
  document.addEventListener('input', e => { if (e.target.classList && e.target.classList.contains('ux-invalid')) clearFlag(e.target); }, true);
  function checkAmount(el) {
    if (!el) return true;
    const raw = String(el.value).replace(/[,٬\s]/g, '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    if (raw === '') { flag(el, 'اكتب المبلغ الأول'); return false; }
    const v = Number(raw);
    if (!isFinite(v)) { flag(el, 'المبلغ لازم يكون رقم صحيح'); return false; }
    if (v <= 0) { flag(el, 'المبلغ لازم يكون أكبر من صفر'); return false; }
    if (v > MAX_AMT) { flag(el, 'المبلغ كبير بشكل غير منطقي — راجع الأرقام'); return false; }
    return true;
  }
  function wrapAddEntry(name, ids, focusId) {
    const orig = window[name]; if (typeof orig !== 'function' || orig.__uxv) return;
    const w = function () {
      const fid = ids.apply(null, arguments);
      if (!checkAmount(document.getElementById(fid.amt))) return;
      const r = orig.apply(this, arguments);
      const f = focusId.apply(null, arguments);
      setTimeout(() => { if (Date.now() < (window.__uxNoFocusUntil || 0)) return; const el = document.getElementById(f); if (el) el.focus(); }, 60);   // 14) تركيز تلقائي بعد الإضافة
      return r;
    };
    w.__uxv = true; window[name] = w;
  }
  // حدود الحقول الرقمية داخل الكروت (بتتصلّح تلقائي قبل ما التعديل يتحفظ)
  const FIELD_RULES = {
    dueDay: { min: 1, max: 31, int: true, lbl: 'يوم الاستحقاق 1–31' }, limit: { min: 0, max: MAX_AMT, lbl: 'الحد الأقصى' },
    required: { min: 0, max: MAX_AMT, lbl: 'المطلوب' }, paidAmount: { min: 0, max: MAX_AMT, lbl: 'المدفوع' },
    pointsPct: { min: -100, max: 100, lbl: 'النسبة بين -100 و 100' }
  };
  document.addEventListener('change', e => {
    const el = e.target; if (!el || el.tagName !== 'INPUT' || el.type !== 'number') return;
    const m = /['"](\w+)['"]/.exec(el.getAttribute('onchange') || ''); const rule = m && FIELD_RULES[m[1]];
    if (!rule || el.value === '') return;
    let v = Number(el.value); if (!isFinite(v)) { el.value = ''; return; }
    const o = v; if (rule.int) v = Math.round(v); v = Math.min(rule.max, Math.max(rule.min, v));
    if (v !== o) { el.value = v; flag(el, 'اتعدّلت لأقرب قيمة مسموحة (' + rule.lbl + ')'); }
  }, true);

  /* ═══════════ 16) EMPTY STATES ═══════════ */
  const EMPTY = [
    { re: /لا توجد بطاقات\. اضغط/, ico: '💳', t: 'لسه مفيش بطاقات فيزا', s: 'ضيف أول بطاقة عشان تتابع المطلوب والسداد والاستحقاق.', cta: '+ إضافة بطاقة', fn: 'addVisa' },
    { re: /لا توجد شهادات\. اضغط/, ico: '🏦', t: 'لسه مفيش شهادات', s: 'ضيف شهادة استثمار وتابع عائدها الشهري وتاريخ انتهائها.', cta: '+ إضافة شهادة', fn: 'addCert' },
    { re: /لا توجد صناديق\. اضغط/, ico: '📦', t: 'لسه مفيش صناديق استثمارية', s: 'ضيف صندوق لتتبع وحداتك وأرباحك.', cta: '+ إضافة صندوق', fn: 'addFund' },
    { re: /لا توجد مديونيات\. اضغط/, ico: '🧾', t: 'مفيش مديونيات — حلو كده 👌', s: 'لو عليك قسط أو دين ضيفه وهنفكّرك بميعاده.', cta: '+ إضافة مديونية', fn: 'addDebt' },
    { re: /لا توجد عروض\. اضغط/, ico: '🎁', t: 'لسه مفيش عروض', s: 'سجّل عروض البنوك والنقاط عشان ما تفوّتش حاجة.', cta: '+ إضافة عرض', fn: 'addOffer' },
    { re: /لا توجد محافظ/, ico: '👛', t: 'لسه مفيش محافظ', s: 'ضيف محفظة إلكترونية وتابع المستخدم والمتاح من حدها.', cta: '+ إضافة محفظة', fn: 'addWallet' }
  ];
  function enhanceEmpty() {
    $$('.empty:not([data-ux])').forEach(el => {
      const txt = (el.textContent || '').trim();
      el.setAttribute('data-ux', '1');
      const rule = EMPTY.find(r => r.re.test(txt));
      if (rule) {
        el.classList.add('ux-empty');
        el.innerHTML = '<div class="ux-e-ico">' + rule.ico + '</div><div class="ux-e-t">' + rule.t + '</div><div class="ux-e-s">' + rule.s + '</div>' +
          '<div class="ux-e-btns"><button type="button" class="ux-primary" data-fn="' + rule.fn + '">' + rule.cta + '</button>' +
          '<button type="button" class="ux-ghost" data-fn="__import">📥 استيراد نسخة احتياطية</button></div>';
      } else if (/مطابق|نتائج|من هذا النوع/.test(txt)) {
        el.classList.add('ux-empty', 'ux-empty-sm');
        el.innerHTML = '<div class="ux-e-ico">🔍</div><div class="ux-e-t">' + esc(txt.replace('🔍', '').trim()) + '</div><div class="ux-e-btns"><button type="button" class="ux-ghost" data-fn="__clear">✖ مسح البحث والفلاتر</button></div>';
      }
    });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.ux-empty [data-fn]'); if (!b) return;
    const fn = b.dataset.fn;
    if (fn === '__import') { const f = $('input[type=file][onchange*="importJSON"]'); if (f) f.click(); else if (window.toast) toast('افتح قائمة المزيد → استيراد'); }
    else if (fn === '__clear') {
      $$('.page.active .search-input').forEach(i => { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
      const all = $('.page.active .cert-type-btn'); if (all) all.click();
    } else { call(fn); setTimeout(() => { const f = $('.page.active .cell-input:not([type=number])'); if (f) f.focus(); }, 120); }
  });

  /* ═══════════ 14) AUTO-FOCUS (مودالات) ═══════════ */
  function focusModal(ov) {
    if (!ov || ov._uxF) return; ov._uxF = true;
    setTimeout(() => {
      const f = $('[autofocus]', ov) || $('input:not([type=hidden]):not([type=checkbox]):not([type=file]):not([disabled]), textarea, select', ov);
      if (f && f.offsetParent !== null) { try { f.focus(); if (f.select && f.type !== 'date') f.select(); } catch (e) { /* ignore */ } }
    }, 90);
  }
  const OV = '.modal-overlay, .bgt-overlay, .img-modal-overlay';
  let mo = 0;
  new MutationObserver(() => {
    if (mo) return; mo = requestAnimationFrame(() => {
      mo = 0;
      $$(OV).forEach(ov => { const open = ov.classList.contains('open') || ov.classList.contains('show'); open ? focusModal(ov) : (ov._uxF = false); });
      enhanceEmpty();
    });
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  /* ═══════════ 15) KEYBOARD SHORTCUTS ═══════════ */
  const typing = t => t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
  function openOverlay() { return $$(OV).filter(o => o.classList.contains('open') || o.classList.contains('show')).pop(); }
  function showHelp() {
    let h = $('#uxHelp'); if (h) { h.remove(); return; }
    h = document.createElement('div'); h.id = 'uxHelp';
    const rows = [['?', 'عرض الاختصارات'], ['/  أو  Ctrl+K', 'بحث'], ['N', 'إضافة جديد في الصفحة الحالية'], ['1 … 8', 'التنقل بين التابات'], ['Ctrl+Z', 'تراجع عن آخر حذف/تصفير'], ['Ctrl+S', 'حفظ فوري'], ['Esc', 'إغلاق النافذة المفتوحة']];
    h.innerHTML = '<div class="ux-help-box" role="dialog" aria-label="اختصارات الكيبورد"><div class="ux-help-h"><b>⌨️ اختصارات الكيبورد</b><button type="button" class="ux-x" aria-label="إغلاق">×</button></div>' +
      rows.map(r => '<div class="ux-help-r"><kbd>' + r[0] + '</kbd><span>' + r[1] + '</span></div>').join('') + '</div>';
    h.onclick = e => { if (e.target === h || e.target.classList.contains('ux-x')) h.remove(); };
    document.body.appendChild(h);
  }
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented) return;
    const k = e.key, mod = e.ctrlKey || e.metaKey, inField = typing(e.target);
    if (k === 'Escape') {
      const h = $('#uxHelp'); if (h) { h.remove(); return; }
      const ov = openOverlay();
      if (ov) { const c = $('.bgt-btn-cancel, .btn-cancel, [data-close], .modal-close', ov); if (c) c.click(); else ov.classList.remove('open', 'show'); e.preventDefault(); }
      else if (inField) e.target.blur();
      return;
    }
    if (mod && (k === 's' || k === 'S')) { e.preventDefault(); call('saveState'); call('saveWallets'); call('bgtSave'); if (window.toast) toast('💾 تم الحفظ'); return; }
    if (mod && (k === 'k' || k === 'K')) { e.preventDefault(); const s = $('.page.active .search-input') || $('.search-input'); if (s) { s.focus(); s.select(); } return; }
    if (mod && (k === 'z' || k === 'Z') && !e.shiftKey && !inField) { e.preventDefault(); undoLast(); return; }
    if (inField || mod || e.altKey) return;
    if (k === '?') { e.preventDefault(); showHelp(); }
    else if (k === '/') { const s = $('.page.active .search-input'); if (s) { e.preventDefault(); s.focus(); s.select(); } }
    else if (k === 'n' || k === 'N' || k === 'ن') {
      const b = $$('.page.active .btn-add').find(x => x.offsetParent !== null);
      if (b) { e.preventDefault(); b.click(); }
    } else if (/^[1-9]$/.test(k)) {
      const tabs = $$('#mainTabs .tab').filter(t => t.offsetParent !== null), t = tabs[+k - 1];
      if (t) { e.preventDefault(); t.click(); }
    }
  });
  // زرار صغير للكمبيوتر بس لعرض الاختصارات
  function addKbdHint() {
    if (isTouch() || $('#uxKbdBtn')) return;
    const b = document.createElement('button'); b.id = 'uxKbdBtn'; b.type = 'button'; b.title = 'اختصارات الكيبورد (؟)'; b.setAttribute('aria-label', 'اختصارات الكيبورد'); b.textContent = '⌨️';
    b.onclick = showHelp; document.body.appendChild(b);
  }

  /* ───────── تركيب كل حاجة بعد ما التطبيق يجهز ───────── */
  function install() {
    Object.keys(UNDO_FNS).forEach(n => wrapUndo(n, UNDO_FNS[n]));
    Object.keys(RENDER_GRID).concat(['renderOfferPoints', 'renderDueDates', 'renderMonthGlance', 'updateSummary', 'bgtRender']).forEach(wrapSafe);
    ['saveState', 'saveWallets'].forEach(wrapSave);
    Object.keys(BUSY_FNS).forEach(n => wrapBusy(n, BUSY_FNS[n]));
    wrapFbStatus();
    // إضافة حركات + تحقق + تركيز تلقائي
    wrapAddEntry('addWalletEntry', i => ({ amt: 'wamt-' + i }), i => 'wname-' + i);
    wrapAddEntry('addVisaEntry', (i, q) => ({ amt: (q ? 'vq' : 've') + 'amt-' + i }), (i, q) => (q ? 'vq' : 've') + 'amt-' + i);
    enhanceEmpty(); addKbdHint(); saveLastGoodSoon();
  }
  if (document.readyState === 'complete') setTimeout(install, 0); else window.addEventListener('load', () => setTimeout(install, 0));
  function track(label, fn) {
    let before; try { before = snapStr(); } catch (e) { return fn(); }
    const r = fn();
    try { if (snapStr() !== before) { undoStack.push({ snap: before, label }); if (undoStack.length > 6) undoStack.shift(); snack('✓ ' + label, [{ label: '↩ تراجع', fn: undoLast }], 8000); } } catch (e) { /* ignore */ }
    return r;
  }
  window.UX = { track: track, undo: undoLast, snack, busy, idle, restoreLastGood, emergencyExport, showHelp };
})();
