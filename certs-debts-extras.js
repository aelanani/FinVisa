/* ═══════════════════════════════════════════════════════════
   (1) تعديل عائد الشهادات المتغيرة دفعة واحدة (قرار المركزي)
   (2) خط زمني للمديونيات (الأقرب انتهاءً حسب الأقساط المتبقية)
   (3) زرار "يوم نزول العائد" بتنبيه ضبابي ذكي
   ═══════════════════════════════════════════════════════════ */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var r2 = function (x) { return Math.round(x * 100) / 100; };
  var fm = function (x) { return (typeof fmt === 'function') ? fmt(x) : String(r2(x)); };
  var E = function (s) { return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s); };
  function mkModal(id, html) {
    var o = $(id);
    if (!o) { o = document.createElement('div'); o.className = 'modal-overlay'; o.id = id; document.body.appendChild(o);
      o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('open'); }); }
    o.innerHTML = '<div class="modal-box vx-box">' + html + '</div>';
    return o;
  }

  /* ───────── (1) تعديل المتغيرة ───────── */
  var vrDelta = 0, vrUndo = null;
  function vrList() { return (getData().certs || []).filter(function (c) { return c.type === 'variable'; }); }
  function vrRender() {
    var list = vrList();
    var steps = [-1, -0.5, -0.25, 0.25, 0.5, 1];
    var body;
    if (!list.length) {
      body = '<div class="empty">مفيش شهادات متغيرة في الشهر ده.</div>';
    } else {
      var oldTot = 0, newTot = 0;
      var rows = list.map(function (c) {
        var amt = parseNum(c.amount), o = parseNum(c.rate), n = r2(Math.max(0, o + vrDelta));
        var om = amt * o / 100 / 12, nm = amt * n / 100 / 12; oldTot += om; newTot += nm;
        return '<div class="vx-row"><div class="vx-row-n"><span data-no-i18n>' + E((c.bank || 'شهادة') + ' ' + (c.num || '')) + '</span><small>' + fm(amt) + ' ج</small></div>' +
          '<div class="vx-row-r"><span class="vx-old">' + o + '%</span><span>←</span><b class="' + (vrDelta > 0 ? 'vx-up' : vrDelta < 0 ? 'vx-dn' : '') + '">' + n + '%</b>' +
          '<small>' + fm(nm) + ' ج/شهر</small></div></div>';
      }).join('');
      var diff = newTot - oldTot;
      body = '<div class="vx-hint">قرار المركزي بيغيّر عائد كل الشهادات المتغيرة مع بعض. اختار التغيير (نقطة مئوية على العائد السنوي) وهيتطبق على <b>' + list.length + '</b> شهادة.</div>' +
        '<div class="vx-steps">' + steps.map(function (s) { return '<button type="button" class="vx-step ' + (s === vrDelta ? 'on' : '') + (s < 0 ? ' neg' : ' pos') + '" onclick="vxSetDelta(' + s + ')">' + (s > 0 ? '+' : '') + s + '</button>'; }).join('') + '</div>' +
        '<div class="vx-custom"><button type="button" class="vx-pm" onclick="vxBump(-0.25)">−</button>' +
        '<input type="number" lang="en" step="0.05" id="vxCustom" value="' + vrDelta + '" oninput="vxSetDelta(this.value,true)"><span>نقطة %</span>' +
        '<button type="button" class="vx-pm" onclick="vxBump(0.25)">+</button></div>' +
        '<div class="vx-list">' + rows + '</div>' +
        '<div class="vx-sum">إجمالي العائد الشهري: <b>' + fm(oldTot) + '</b> ← <b class="' + (diff > 0 ? 'vx-up' : diff < 0 ? 'vx-dn' : '') + '">' + fm(newTot) + ' ج</b> (' + '<bdi dir="ltr">' + (diff >= 0 ? '+' : '') + fm(diff) + '</bdi>)</div>';
    }
    var btns = '<div class="modal-btns">' +
      (list.length ? '<button class="btn btn-primary" onclick="vxApply()"' + (vrDelta === 0 ? ' disabled style="opacity:.5"' : '') + '>تطبيق</button>' : '') +
      '<button class="btn btn-secondary" onclick="document.getElementById(\'varRateModal\').classList.remove(\'open\')">إغلاق</button></div>' +
      (vrUndo ? '<button type="button" class="vx-undo" onclick="vxUndo()">↩️ تراجع عن آخر تعديل</button>' : '');
    var o = mkModal('varRateModal', '<div class="modal-title">📊 تعديل عائد الشهادات المتغيرة</div>' + body + btns);
    o.classList.add('open');
  }
  window.openVarRateModal = function () { vrDelta = 0; vrRender(); };
  window.vxSetDelta = function (v, keepInput) {
    vrDelta = r2(parseFloat(v) || 0);
    if (keepInput) { var i = $('vxCustom'), pos = i && i.selectionStart; vrRender(); i = $('vxCustom'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (e) {} } }
    else vrRender();
  };
  window.vxBump = function (s) { vrDelta = r2(vrDelta + s); vrRender(); };
  window.vxApply = function () {
    var list = vrList(); if (!list.length || !vrDelta) return;
    vrUndo = list.map(function (c) { return { c: c, rate: c.rate }; });
    list.forEach(function (c) { c.rate = String(r2(Math.max(0, parseNum(c.rate) + vrDelta))); });
    var d = vrDelta; vrDelta = 0;
    if (typeof autoSave === 'function') autoSave();
    renderCerts();
    if (typeof renderCertTimeline === 'function') renderCertTimeline();
    toast('📊 اتعدّل عائد ' + list.length + ' شهادة متغيرة (' + (d > 0 ? '+' : '') + d + '%)');
    vrRender();
  };
  window.vxUndo = function () {
    if (!vrUndo) return;
    vrUndo.forEach(function (u) { u.c.rate = u.rate; });
    vrUndo = null; if (typeof autoSave === 'function') autoSave();
    renderCerts(); if (typeof renderCertTimeline === 'function') renderCertTimeline();
    toast('↩️ اتراجع عن تعديل العائد'); vrRender();
  };
  // الزرار جنب فلاتر الشهادات
  var tabs = $('certsSortTabs');
  if (tabs && !$('varRateBtn')) {
    var grp = tabs.parentNode.parentNode;
    var sep = document.createElement('span'); sep.style.cssText = 'width:1px;height:18px;background:var(--border2);display:inline-block';
    var b = document.createElement('button'); b.id = 'varRateBtn'; b.type = 'button'; b.className = 'cert-type-btn vx-open';
    b.textContent = '📊 تعديل المتغيرة'; b.title = 'زوّد أو قلّل عائد كل الشهادات المتغيرة مرة واحدة';
    b.addEventListener('click', function (e) { e.stopPropagation(); window.openVarRateModal(); });
    var anchor = $('certsCollapseAllBtn'); grp.insertBefore(sep, anchor); grp.insertBefore(b, anchor);
  }

  /* ───────── (2) خط زمني للمديونيات ───────── */
  function debtInstLeft(d) {
    var m = parseNum(d.monthly), rem = getDebtRemaining(d);
    if (m > 0 && rem > 0) return Math.max(1, Math.ceil(rem / m - 0.01));
    var n = parseNum(d.installments); return n > 0 ? n : null;
  }
  function debtEndDate(d, n) {
    var today = new Date(), t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var nd = null; try { nd = getDebtNextDue(d, today); } catch (e) {}
    var base = nd ? nd.due : t0;
    var y = base.getFullYear(), mo = base.getMonth() + (n - 1);
    var day = parseInt(d.dueDay) || null;
    var dim = new Date(y, mo + 1, 0).getDate();
    return day ? new Date(y, mo, Math.min(day, dim)) : new Date(y, mo, 1);
  }
  window.renderDebtTimeline = function () {
    var el = $('debtTimelineContent'); if (!el) return;
    var badge = $('debtTimelineBadge');
    var months = (typeof remMonths === 'function') ? remMonths() : AR_MONTHS;
    var items = (getData().debts || []).filter(function (d) { return !d.paid && getDebtRemaining(d) > DEBT_EPS; }).map(function (d) {
      var n = debtInstLeft(d); return { d: d, n: n, end: n ? debtEndDate(d, n) : null, rem: getDebtRemaining(d), tot: getDebtTotal(d) };
    }).sort(function (a, b) { if (a.n == null) return 1; if (b.n == null) return -1; return a.n - b.n || a.rem - b.rem; });
    if (badge) { var soon = items.filter(function (x) { return x.n != null && x.n <= 3; }).length; badge.textContent = soon ? '🎯 ' + soon + ' قربت تخلص' : (items.length ? items.length + ' مديونية' : ''); }
    if (!items.length) { el.innerHTML = '<div class="empty">مفيش مديونيات شغّالة.</div>'; return; }
    el.innerHTML = '<div class="cert-timeline-title">📅 ترتيب حسب الأسرع انتهاءً (الأقساط المتبقية)</div>' + items.map(function (x) {
      var color, bg, bbg, bcol, label;
      if (x.n == null) { color = '#9ca3af'; bg = 'var(--surface)'; bbg = 'var(--border)'; bcol = 'var(--text2)'; label = 'مفيش قسط محدد'; }
      else if (x.n <= 2) { color = '#2f8f5b'; bg = 'color-mix(in srgb,#2f8f5b 9%,var(--surface))'; bbg = 'color-mix(in srgb,#2f8f5b 20%,transparent)'; bcol = '#2f8f5b'; label = x.n === 1 ? 'آخر قسط' : 'قربت تخلص'; }
      else if (x.n <= 6) { color = '#b08040'; bg = 'color-mix(in srgb,#b08040 9%,var(--surface))'; bbg = 'color-mix(in srgb,#b08040 20%,transparent)'; bcol = '#b08040'; label = 'بعد ' + x.n + ' شهور'; }
      else { color = 'var(--accent2)'; bg = 'var(--surface)'; bbg = 'var(--border)'; bcol = 'var(--accent2)'; label = 'بعد ' + x.n + ' شهر'; }
      var pct = x.tot > 0 ? Math.max(0, Math.min(100, Math.round((1 - x.rem / x.tot) * 100))) : 0;
      var endTxt = x.end ? '🏁 تخلص: ' + months[x.end.getMonth()] + ' ' + x.end.getFullYear() : '';
      return '<div class="cert-tl-item" style="background:' + bg + ';border-color:' + color + '40"><div class="cert-tl-progress" style="width:' + pct + '%;background:' + color + '"></div>' +
        '<div class="cert-tl-days" style="color:' + color + '"><div class="cert-tl-days-num">' + (x.n == null ? '—' : x.n) + '</div><div class="cert-tl-days-lbl">قسط</div></div>' +
        '<div class="cert-tl-info"><div class="cert-tl-name" data-no-i18n>' + E(x.d.name || 'مديونية') + '</div>' +
        '<div class="cert-tl-sub">القسط: <strong style="color:var(--accent2)">' + fm(parseNum(x.d.monthly)) + ' ج</strong> | المتبقي: <strong>' + fm(x.rem) + ' ج</strong> | سُدّد ' + pct + '%</div>' +
        (endTxt ? '<div class="cert-tl-sub" style="margin-top:2px">' + endTxt + '</div>' : '') + '</div>' +
        '<div class="cert-tl-badge" style="background:' + bbg + ';color:' + bcol + '">' + label + '</div></div>';
    }).join('');
  };
  var fin = $('finishedDebtsCard');
  if (fin && !$('debtTimelineCard')) {
    var card = document.createElement('div'); card.className = 'section-card'; card.id = 'debtTimelineCard'; card.style.marginTop = '12px';
    card.innerHTML = '<div class="section-header" onclick="toggleSection(this)"><div class="section-title">⏳ خط زمني انتهاء المديونيات <span class="section-badge" id="debtTimelineBadge"></span></div><span class="collapse-icon open">▼</span></div>' +
      '<div class="section-body"><div class="cert-timeline" id="debtTimelineContent"><div class="empty">مفيش مديونيات شغّالة.</div></div></div>';
    fin.parentNode.insertBefore(card, fin);
  }
  if (typeof renderDebts === 'function' && !renderDebts._vx) {
    var _rd = renderDebts;
    renderDebts = function () { var r = _rd.apply(this, arguments); try { window.renderDebtTimeline(); } catch (e) { console.warn(e); } return r; };
    renderDebts._vx = true;
  }

  /* ───────── (3) يوم نزول العائد (ضبابي ذكي) ───────── */
  var WD = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  function nextPayout(c, today) {
    var day = parseInt(c.dayOfMonth); if (!day || day < 1) return null;
    var key = getCurrentMonthKey(), got = !!(c.receivedMonths && c.receivedMonths[key]);
    var t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    function raw(k) { var f = new Date(t0.getFullYear(), t0.getMonth() + k, 1), dim = new Date(f.getFullYear(), f.getMonth() + 1, 0).getDate(); return new Date(f.getFullYear(), f.getMonth(), Math.min(day, dim)); }
    function at(k) { var f = new Date(t0.getFullYear(), t0.getMonth() + k, 1); return certPayDate(day, f.getFullYear(), f.getMonth()); }
    var due = at(0), orig = raw(0), overdue = false, nextMonth = false;
    if (got) { due = at(1); orig = raw(1); nextMonth = true; }
    else if (due < t0) overdue = true;
    var daysUntil = Math.round((due - t0) / 86400000);
    return { due: due, orig: orig, shifted: due.getTime() !== orig.getTime(), got: got, overdue: overdue, nextMonth: nextMonth, daysUntil: daysUntil, daysLate: overdue ? -daysUntil : 0, bdays: overdue ? 0 : _businessDaysBetween(t0, due), t0: t0 };
  }
  function cMonthly(c) { return c.type === 'decreasing' ? calcDecreasingMonthly(c) : parseNum(c.amount) * parseNum(c.rate) / 100 / 12; }
  function cpRender() {
    var today = new Date(), certs = getData().certs || [], months = (typeof remMonths === 'function') ? remMonths() : AR_MONTHS;
    var ref = certs.reduce(function (s, c) { return s + cMonthly(c); }, 0);
    var rows = [], noDay = [];
    certs.forEach(function (c, i) {
      var np = nextPayout(c, today);
      if (!np) { noDay.push(c); return; }
      var name = ((c.bank || 'شهادة') + ' ' + (c.num || '')).trim(), amt = cMonthly(c);
      var fz = np.got ? { u: 0, level: 'done' } : fuzzyUrgency({ bdays: np.bdays, overdue: np.overdue, amount: amt, ref: ref, win: 3 });
      var g = null;
      for (var k = 0; k < rows.length; k++) if (rows[k].day === np.due.getDate() && rows[k].got === np.got && rows[k].nextMonth === np.nextMonth && _bgtFuzzySame(rows[k].bank, c.bank || '')) { g = rows[k]; break; }
      if (!g) { g = { bank: c.bank || 'شهادة', day: np.due.getDate(), np: np, got: np.got, nextMonth: np.nextMonth, idxs: [], amt: 0, names: [], fz: fz }; rows.push(g); }
      g.idxs.push(i); g.amt += amt; g.names.push(name); if (fz.u > g.fz.u) g.fz = fz;
    });
    rows.sort(function (a, b) { if (a.got !== b.got) return a.got ? 1 : -1; return a.np.due - b.np.due; });
    var pending = rows.filter(function (r) { return !r.got; }), recvAmt = 0, pendAmt = 0;
    // المستلَم/المستنّي بنحسبهم من الداتا مباشرة (الصف المستلَم بيتعرض بموعد الشهر الجاي)
    recvAmt = 0; pendAmt = 0;
    certs.forEach(function (c) { var np = nextPayout(c, today); if (!np) return; if (np.got) recvAmt += cMonthly(c); else pendAmt += cMonthly(c); });
    var lv = { late: ['🔴', 'اتأخر — أكّد الاستلام', 'late'], hot: ['🟠', 'النهاردة أو بكرة تقريبًا', 'hot'], warn: ['🟡', 'قريب', 'warn'], watch: ['🔵', 'خلال أيام', 'watch'], calm: ['🟢', 'مرتاح', 'calm'], done: ['✅', 'اتستلم', 'done'] };
    var head;
    if (pending.length) {
      var f = pending[0], nb = f.np.overdue ? 'اتأخر ' + f.np.daysLate + ' يوم' : (f.np.daysUntil === 0 ? 'النهاردة' : f.np.daysUntil === 1 ? 'بكرة' : 'بعد ' + f.np.daysUntil + ' يوم');
      head = '<div class="cp-head"><div class="cp-head-t">الأقرب</div><div class="cp-head-v"><span data-no-i18n>' + E(f.bank) + '</span> — ' + nb + '</div><div class="cp-head-s">يوم ' + f.day + ' ' + months[f.np.due.getMonth()] + ' (' + WD[f.np.due.getDay()] + ') · ' + fm(f.amt) + ' ج</div></div>';
    } else head = '<div class="cp-head"><div class="cp-head-v">' + (rows.length ? '✅ كل عوائد الشهر اتستلمت' : 'مفيش شهادات ليها يوم صرف') + '</div></div>';
    var tot = '<div class="cp-tot"><span>مستني: <b>' + fm(pendAmt) + ' ج</b></span><span>اتستلم: <b class="vx-up">' + fm(recvAmt) + ' ج</b></span></div>';
    var list = rows.map(function (r) {
      var L = lv[r.got ? 'done' : r.fz.level] || lv.calm, np = r.np;
      var when = r.got ? 'الصرف الجاي: ' + np.due.getDate() + ' ' + months[np.due.getMonth()] : (np.overdue ? 'فات من ' + np.daysLate + ' يوم' : np.daysUntil === 0 ? 'النهاردة' : np.daysUntil === 1 ? 'بكرة' : 'بعد ' + np.daysUntil + ' يوم');
      var wk = np.shifted ? '<div class="cp-note">↩️ يوم ' + np.orig.getDate() + ' بيصادف ' + WD[np.orig.getDay()] + ' (إجازة) — العائد بينزل الخميس ' + np.due.getDate() + '</div>' : '';
      var pct = r.got ? 0 : Math.round((r.fz.u || 0) * 100);
      return '<div class="cp-row cp-' + L[2] + '"><div class="cp-day"><b>' + r.day + '</b><small>' + months[np.due.getMonth()] + '</small></div>' +
        '<div class="cp-info"><div class="cp-name" data-no-i18n>' + E(r.names.join('، ')) + '</div><div class="cp-sub">' + L[0] + ' ' + (r.got ? L[1] : L[1]) + ' · ' + when + ' · ' + WD[np.due.getDay()] + '</div>' + wk +
        (r.got ? '' : '<div class="cp-bar"><i style="width:' + Math.max(4, pct) + '%"></i></div>') + '</div>' +
        '<div class="cp-side"><div class="cp-amt">' + fm(r.amt) + ' ج</div><button type="button" class="cp-btn ' + (r.got ? 'undo' : '') + '" onclick="cpToggle([' + r.idxs.join(',') + '])">' + (r.got ? '↩️' : '✅ استلمت') + '</button></div></div>';
    }).join('');
    var nd = noDay.length ? '<div class="cp-nod">⚙️ ' + noDay.length + ' شهادة من غير يوم صرف: ' + '<span data-no-i18n>' + E(noDay.map(function (c) { return (c.bank || 'شهادة') + ' ' + (c.num || ''); }).join('، ')) + '</span></div>' : '';
    var o = mkModal('certPayModal', '<div class="modal-title">📆 يوم نزول عائد الشهادات</div>' + head + tot + '<div class="cp-list">' + (list || '<div class="empty">ضيف "يوم الصرف" في الشهادات عشان يظهر هنا.</div>') + '</div>' + nd +
      '<div class="modal-btns"><button class="btn btn-secondary" onclick="document.getElementById(\'certPayModal\').classList.remove(\'open\')">إغلاق</button></div>');
    o.classList.add('open');
  }
  window.openCertPayModal = cpRender;
  window.cpToggle = function (idxs) { toggleCertReceived(idxs); cpRender(); };
  // زرار الهيدر
  var due = $('dueDropWrap');
  if (due && !$('certPayBtn')) {
    var hb = document.createElement('button'); hb.className = 'hbtn'; hb.id = 'certPayBtn'; hb.type = 'button'; hb.title = 'يوم نزول عائد الشهادات';
    hb.innerHTML = '<svg class="hicon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18M9 15l2 2 4-4"/></svg><span class="hbtn-text"> عوائد</span>';
    hb.addEventListener('click', cpRender);
    due.parentNode.insertBefore(hb, due);
  }
  // صف في القائمة الجانبية (اختصارات)
  var navTabs = $('mainTabs');
  if (navTabs && !$('navCertPay')) {
    var rw = document.createElement('button'); rw.type = 'button'; rw.className = 'nav-row'; rw.id = 'navCertPay';
    rw.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M9 15l2 2 4-4"/></svg><span>يوم نزول العائد</span>';
    rw.addEventListener('click', function () { document.body.classList.remove('nav-open'); setTimeout(cpRender, 260); });
    var after = Array.prototype.filter.call(navTabs.querySelectorAll('.nav-row'), function (x) { return /المواعيد/.test(x.textContent); })[0];
    if (after && after.nextSibling) navTabs.insertBefore(rw, after.nextSibling); else navTabs.appendChild(rw);
  }
  try { window.renderDebtTimeline(); } catch (e) {}
})();
