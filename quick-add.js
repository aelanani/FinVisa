/* ═══════════════════════════════════════════════════════════════
   ⚡ QUICK ADD — إضافة سريعة من أي صفحة (مصروف / دخل / سداد فيزا / محفظة)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__QA__) return; window.__QA__ = true;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const call = (n, ...a) => { try { if (typeof window[n] === 'function') return window[n](...a); } catch (e) { console.warn('[QA]', n, e); } };
  const store = { get: (k, d) => { try { const v = localStorage.getItem('uxqa_' + k); return v == null ? d : v; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem('uxqa_' + k, v); } catch (e) { /* ignore */ } } };
  const fmtN = n => (typeof fmt === 'function' ? fmt(n) : String(Math.round(n * 100) / 100));

  const MODES = [
    { k: 'exp', ico: '💸', n: 'مصروف' }, { k: 'inc', ico: '💰', n: 'دخل' },
    { k: 'visa', ico: '💳', n: 'سداد فيزا' }, { k: 'wal', ico: '👛', n: 'محفظة' }
  ];
  let mode = store.get('mode', 'exp'), target = {}, added = 0, root = null;

  /* ── حاسبة بسيطة في خانة المبلغ: 50+25.5 أو 120*3 ── */
  function toLatin(s) { return String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٬,]/g, '').replace(/٫/g, '.').replace(/[×xX]/g, '*').replace(/÷/g, '/'); }
  function evalAmt(raw) {
    const s = toLatin(raw).replace(/\s+/g, '');
    if (!s) return null;
    if (!/^[0-9.+\-*/()]+$/.test(s) || /[+\-*/.]{2,}$/.test(s) || /[+\-*/]$/.test(s)) return null;
    try { const v = Function('"use strict";return (' + s + ')')(); return isFinite(v) ? Math.round(v * 100) / 100 : null; } catch (e) { return null; }
  }

  /* ── مصادر البيانات ── */
  const budgetMonth = () => { try { return typeof bgtCurM === 'function' ? bgtCurM() : null; } catch (e) { return null; } };
  const cats = () => (mode === 'inc' ? (typeof BGT_INC_CATS !== 'undefined' ? BGT_INC_CATS : []) : (typeof BGT_CATS !== 'undefined' ? BGT_CATS : []));
  function visaList() { try { return (getData().visa || []).map((v, i) => ({ i, v })).filter(x => x.v && x.v.name !== undefined); } catch (e) { return []; } }
  function walletList() { try { return (globalWallets || []).map((w, i) => ({ i, w })); } catch (e) { return []; } }

  function targets() {
    if (mode === 'exp' || mode === 'inc') return cats().map(c => ({ id: c.k, label: c.n, color: c.c }));
    if (mode === 'visa') return visaList().map(x => ({ id: String(x.i), label: x.v.name || 'بطاقة ' + (x.i + 1) }));
    return walletList().map(x => ({ id: String(x.i), label: x.w.name || 'محفظة ' + (x.i + 1) }));
  }
  function pickDefault() {
    const t = targets(); if (!t.length) return null;
    const last = store.get('t_' + mode, '');
    let hit = t.find(x => x.id === last);
    if (!hit && mode === 'exp' && typeof BG !== 'undefined' && BG.curCat && BG.curCat !== '__all__') hit = t.find(x => x.id === BG.curCat);
    if (!hit && mode === 'inc' && typeof BG !== 'undefined' && BG.curInc && BG.curInc !== '__all__') hit = t.find(x => x.id === BG.curInc);
    if (!hit && mode === 'visa') { const u = visaList().find(x => !x.v.paid && parseNum(x.v.required) > parseNum(x.v.paidAmount)); if (u) hit = t.find(x => x.id === String(u.i)); }
    return (hit || t[0]).id;
  }
  function recents() {
    const out = [], seen = new Set(), push = (n, a) => { n = (n || '').trim(); if (!n || seen.has(n) || out.length >= 6) return; seen.add(n); out.push({ n, a }); };
    try {
      if (mode === 'exp') { const m = budgetMonth(); (m && m.items || []).slice().reverse().filter(x => x.cat === target.id).forEach(x => push(x.name, x.amt)); }
      else if (mode === 'inc') { const m = budgetMonth(); (m && m.incomeSources || []).slice().reverse().filter(x => x.cat === target.id).forEach(x => push(x.name, x.amt)); }
      else if (mode === 'visa') { const v = getData().visa[+target.id]; (v && v.entries || []).slice().reverse().forEach(x => push(x.name, x.amt)); }
      else { const w = globalWallets[+target.id]; (w && w.entries || []).slice().reverse().forEach(x => push(x.name, x.amt)); }
    } catch (e) { /* ignore */ }
    return out;
  }
  function restHint() {
    if (mode !== 'visa') return null;
    try { const v = getData().visa[+target.id]; const r = Math.round((parseNum(v.required) - parseNum(v.paidAmount)) * 100) / 100; return r > 0 ? r : null; } catch (e) { return null; }
  }

  /* ── رسم الشيت ── */
  function build() {
    root = document.createElement('div'); root.id = 'uxQA'; root.className = 'ux-qa';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'إضافة سريعة');
    root.innerHTML = '<div class="ux-qa-sheet"><div class="ux-qa-grab"></div>' +
      '<div class="ux-qa-modes" role="tablist"></div>' +
      '<div class="ux-qa-body">' +
        '<div class="ux-qa-lbl" id="uxQALbl"></div><div class="ux-qa-chips" id="uxQATargets"></div>' +
        '<div class="ux-qa-amt"><input id="uxQAAmt" type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" name="qa_amt" placeholder="0" aria-label="المبلغ"><span class="ux-qa-cur">ج.م</span></div>' +
        '<div class="ux-qa-calc" id="uxQACalc" aria-live="polite"></div>' +
        '<div class="ux-qa-quick" id="uxQARest"></div>' +
        '<input id="uxQAName" class="ux-qa-name" type="text" autocomplete="off" aria-label="البيان">' +
        '<div class="ux-qa-lbl ux-qa-lbl2" id="uxQARecLbl">الأخيرة — دوس لتكرارها</div><div class="ux-qa-chips ux-qa-rec" id="uxQARec"></div>' +
        '<div class="ux-qa-meta" id="uxQAMeta"></div>' +
      '</div>' +
      '<div class="ux-qa-foot"><label class="ux-qa-keep"><input type="checkbox" id="uxQAKeep"> <span>فضّل مفتوح (إضافة متتالية)</span></label>' +
      '<div class="ux-qa-btns"><button type="button" class="ux-qa-cancel" id="uxQAClose">إغلاق</button><button type="button" class="ux-qa-go" id="uxQAGo">+ إضافة</button></div></div></div>';
    document.body.appendChild(root);
    root.addEventListener('mousedown', e => { if (e.target === root) close(); });
    root.addEventListener('touchstart', e => { if (e.target === root) close(); }, { passive: true });
    $('#uxQAClose').onclick = close; $('#uxQAGo').onclick = submit;
    $('#uxQAKeep').checked = store.get('keep', '0') === '1';
    $('#uxQAKeep').onchange = e => store.set('keep', e.target.checked ? '1' : '0');
    $('#uxQAAmt').addEventListener('input', onAmt);
    root.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { if (e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); submit(); } }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    }, true);
    root.addEventListener('click', e => {
      const m = e.target.closest('[data-mode]'); if (m) return setMode(m.dataset.mode);
      const t = e.target.closest('[data-t]'); if (t) { target.id = t.dataset.t; store.set('t_' + mode, target.id); renderBody(); $('#uxQAAmt').focus(); return; }
      const r = e.target.closest('[data-rec]'); if (r) { const x = recents()[+r.dataset.rec]; if (x) { $('#uxQAName').value = x.n; if (x.a) $('#uxQAAmt').value = fmtPlain(x.a); onAmt(); $('#uxQAAmt').focus(); $('#uxQAAmt').select(); } return; }
      if (e.target.closest('[data-rest]')) { $('#uxQAAmt').value = fmtPlain(restHint()); onAmt(); $('#uxQAAmt').focus(); }
    });
    // الكيبورد على الموبايل: الشيت يطلع فوق لوحة المفاتيح
    if (window.visualViewport) {
      const upd = () => { const kb = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop); root.style.setProperty('--ux-kb', kb + 'px'); root.classList.toggle('ux-kb-on', kb > 80); };
      window.visualViewport.addEventListener('resize', upd); window.visualViewport.addEventListener('scroll', upd);
    }
  }
  const fmtPlain = n => String(Math.round(parseNum(n) * 100) / 100);

  function renderModes() {
    $('.ux-qa-modes', root).innerHTML = MODES.map(m => '<button type="button" role="tab" data-mode="' + m.k + '" class="' + (m.k === mode ? 'on' : '') + '" aria-selected="' + (m.k === mode) + '"><span>' + m.ico + '</span>' + m.n + '</button>').join('');
  }
  function renderBody() {
    const t = targets();
    const lbl = { exp: 'التصنيف', inc: 'المصدر', visa: 'البطاقة', wal: 'المحفظة' }[mode];
    $('#uxQALbl').textContent = lbl;
    $('#uxQATargets').innerHTML = t.length
      ? t.map(x => '<button type="button" class="ux-chip ' + (x.id === target.id ? 'on' : '') + '" data-t="' + esc(x.id) + '">' + esc(x.label) + '</button>').join('')
      : '<div class="ux-qa-none">' + ({ visa: 'مفيش بطاقات فيزا للشهر ده — ضيف بطاقة الأول من تاب الفيزا.', wal: 'مفيش محافظ — ضيف محفظة الأول من تاب المحافظ.', exp: 'مفيش تصنيفات في الميزانية.', inc: 'مفيش مصادر دخل في الميزانية.' }[mode]) + '</div>';
    $('#uxQAName').placeholder = mode === 'exp' ? 'على إيه؟ (مثال: قهوة)' : mode === 'inc' ? 'من إيه؟ (مثال: مرتب)' : 'البيان (اختياري)';
    const rec = recents();
    $('#uxQARecLbl').style.display = rec.length ? '' : 'none';
    $('#uxQARec').innerHTML = rec.map((x, i) => '<button type="button" class="ux-chip ux-chip-rec" data-rec="' + i + '">' + esc(x.n) + (x.a ? ' <b>' + esc(fmtN(parseNum(x.a))) + '</b>' : '') + '</button>').join('');
    const r = restHint();
    $('#uxQARest').innerHTML = r ? '<button type="button" class="ux-chip ux-chip-rest" data-rest="1">الباقي على الكارت: <b>' + esc(fmtN(r)) + '</b> ج.م</button>' : '';
    let meta = '';
    if (mode === 'exp' || mode === 'inc') { const m = budgetMonth(); meta = m ? '📅 هيتسجل في ميزانية: <b>' + esc(m.name || m.n || 'الشهر الحالي') + '</b>' : '⚠️ مفيش شهر ميزانية مفتوح'; }
    else if (mode === 'visa') meta = '📅 على شهر: <b>' + esc(typeof currentMonth !== 'undefined' ? currentMonth : '') + '</b>';
    $('#uxQAMeta').innerHTML = meta;
    $('#uxQAGo').disabled = !t.length;
    $('#uxQAGo').classList.toggle('inc', mode === 'inc');
  }
  function onAmt() {
    const inp = $('#uxQAAmt'), raw = inp.value, calc = $('#uxQACalc');
    inp.classList.remove('ux-invalid');
    if (/[+\-*/×÷xX]/.test(toLatin(raw).slice(1))) { const v = evalAmt(raw); calc.textContent = v != null ? '= ' + fmtN(v) + ' ج.م' : ''; } else calc.textContent = '';
  }
  function setMode(m) {
    mode = m; store.set('mode', m); added = 0;
    target = { id: pickDefault() };
    renderModes(); renderBody(); $('#uxQAAmt').value = ''; $('#uxQAName').value = ''; $('#uxQACalc').textContent = '';
    setTimeout(() => $('#uxQAAmt').focus(), 30);
  }

  /* ── الإضافة الفعلية: بتعدّي على نفس دوال التطبيق عشان التحقق والحفظ والمزامنة تفضل زي ما هي ── */
  function bad(msg) { const a = $('#uxQAAmt'); a.classList.add('ux-invalid'); a.focus(); if (typeof toast === 'function') toast('⚠️ ' + msg); if (navigator.vibrate) try { navigator.vibrate([20, 40, 20]); } catch (e) { /* ignore */ } }
  function submit() {
    if (!target.id) return;
    const amt = evalAmt($('#uxQAAmt').value);
    if (amt == null || amt <= 0) return bad($('#uxQAAmt').value.trim() ? 'المبلغ مش صحيح' : 'اكتب المبلغ الأول');
    if (amt > 1e10) return bad('المبلغ كبير بشكل غير منطقي');
    const name = $('#uxQAName').value.trim();
    const label = { exp: 'إضافة مصروف', inc: 'إضافة دخل', visa: 'إضافة سداد فيزا', wal: 'إضافة حركة محفظة' }[mode];
    let ok = false;
    const run = () => {
      if (mode === 'exp' || mode === 'inc') {
        if (typeof bgtLockGuard === 'function' && bgtLockGuard()) return;
        const m = budgetMonth(); if (!m) { if (typeof toast === 'function') toast('⚠️ مفيش شهر ميزانية مفتوح'); return; }
        const c = cats().find(x => x.k === target.id); const st = bgtNowStamp();
        const item = { cat: target.id, name: name || (c ? c.n : ''), amt: amt, date: st.date, time: st.time, ts: st.ts };
        if (mode === 'exp') { (m.items = m.items || []).push(item); } else { (m.incomeSources = m.incomeSources || []).push(item); }
        call('bgtSave'); call('bgtRenderKPIs'); call(mode === 'exp' ? 'bgtRenderItems' : 'bgtRenderIncList'); call('bgtRenderSummary'); call('bgtRenderSnapshot');
        ok = true;
      } else if (mode === 'visa') {
        const n = $('#vqname-' + target.id), a = $('#vqamt-' + target.id);
        if (!n || !a) { if (typeof toast === 'function') toast('⚠️ افتح تاب الفيزا مرة الأول'); return; }
        n.value = name; a.value = amt; call('addVisaEntry', +target.id, true); ok = true;
      } else {
        const n = $('#wname-' + target.id), a = $('#wamt-' + target.id);
        if (!n || !a) { if (typeof toast === 'function') toast('⚠️ افتح تاب المحافظ مرة الأول'); return; }
        n.value = name; a.value = amt; call('addWalletEntry', +target.id); ok = true;
      }
    };
    window.__uxNoFocusUntil = Date.now() + 600;   // ما نسحبش الفوكس لحقول الكروت بعد الإضافة من الشيت
    if (window.UX && UX.track) UX.track(label, run); else run();
    if (!ok) return;
    store.set('t_' + mode, target.id);
    if (typeof _liveHaptic === 'function') try { _liveHaptic(14); } catch (e) { /* ignore */ }
    added++;
    if ($('#uxQAKeep').checked) {
      $('#uxQAAmt').value = ''; $('#uxQAName').value = ''; $('#uxQACalc').textContent = '';
      renderBody();
      const go = $('#uxQAGo'); go.textContent = '✓ تمت (' + added + ') — أضف تاني'; go.classList.add('flash');
      setTimeout(() => { go.textContent = '+ إضافة'; go.classList.remove('flash'); }, 1400);
      setTimeout(() => $('#uxQAAmt').focus(), 120);
    } else { close(); }
  }

  /* ── فتح/قفل ── */
  function open() {
    if (!root) build();
    added = 0; target = { id: null };
    // أنسب وضع حسب الصفحة اللي انت فيها (لو مفيش اختيار سابق لنفس الصفحة نستخدم آخر وضع)
    const pg = (document.querySelector('.page.active') || {}).id || '';
    const byPage = { 'page-budget': 'exp', 'page-visa': 'visa', 'page-wallets': 'wal' }[pg];
    if (byPage) mode = byPage;
    target.id = pickDefault();
    renderModes(); renderBody();
    $('#uxQAAmt').value = ''; $('#uxQAName').value = ''; $('#uxQACalc').textContent = '';
    root.classList.add('open'); document.body.classList.add('ux-qa-open');
    setTimeout(() => $('#uxQAAmt').focus(), 80);
  }
  function close() { if (!root) return; root.classList.remove('open'); document.body.classList.remove('ux-qa-open'); root.style.removeProperty('--ux-kb'); }

  /* ── التركيب: زرار + العائم بيفتح الشيت، وزرار على الكمبيوتر، واختصار Q ── */
  function install() {
    const fab = document.getElementById('fabAdd');
    if (fab) { fab.onclick = open; fab.setAttribute('aria-label', 'إضافة سريعة'); fab.title = 'إضافة سريعة (Q)'; }
    if (!document.getElementById('uxQuickBtn') && window.matchMedia && matchMedia('(hover: hover)').matches) {
      const b = document.createElement('button'); b.id = 'uxQuickBtn'; b.type = 'button'; b.innerHTML = '<span>＋</span> إضافة سريعة <kbd>Q</kbd>'; b.onclick = open; document.body.appendChild(b);
    }
  }
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target; if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
    if (/^(q|Q|ض)$/.test(e.key) && !(document.querySelector('.modal-overlay.open,.bgt-overlay.open'))) { e.preventDefault(); root && root.classList.contains('open') ? close() : open(); }
  });
  if (document.readyState === 'complete') setTimeout(install, 50); else window.addEventListener('load', () => setTimeout(install, 50));
  window.QA = { open, close };
})();
