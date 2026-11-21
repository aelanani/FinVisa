/* ═══ شاشة حالة المزامنة + كشف تعليق Firebase (مهمة للموبايل) ═══ */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var EN = {
    '🔄 حالة المزامنة': '🔄 Sync status', 'حالة المزامنة': 'Sync status', 'الحساب': 'Account', 'غير مسجّل دخول': 'Not signed in', 'الحالة': 'Status',
    '☁️ متزامن': '☁️ Synced', '⏳ داخل بالحساب لكن لسه مستلمش البيانات من السحابة': '⏳ Signed in but cloud data has not arrived yet',
    '💾 وضع محلي — البيانات على الجهاز ده بس ومش بتتزامن': '💾 Local mode — data stays on this device and is not synced',
    '⚠️ Firebase مردّش لسه — ممكن يكون محجوب أو النت ضعيف': '⚠️ Firebase has not responded yet — it may be blocked or the connection is weak',
    '📴 مفيش إنترنت': '📴 No internet', 'آخر مزامنة': 'Last sync', 'آخر خطأ دخول': 'Last sign-in error',
    'تسجيل الدخول بـ Google': 'Sign in with Google', 'تسجيل الخروج': 'Sign out', '🔃 تحديث التطبيق وتفريغ الكاش': '🔃 Refresh app & clear cache',
    'تحديث التطبيق بيمسح كاش المتصفح بس — بياناتك ما بتتمسحش.': 'Refreshing only clears the browser cache — your data is not deleted.',
    'لو بتفتح من Brave: عطّل الـ Shields للموقع ده، وجرّب تسجيل الدخول تاني.': 'On Brave: turn Shields off for this site, then try signing in again.',
    'Firebase مش متحمّل — جرّب تحدّث التطبيق أو اتأكد من النت.': 'Firebase is not loaded — refresh the app or check your connection.',
    '⚠️ المزامنة مش شغالة — اضغط على النقطة الصغيرة في الهيدر للتفاصيل': '⚠️ Sync is not working — tap the small dot in the header for details', 'إغلاق': 'Close',
    'ثانية': 's', 'دقيقة': 'min', 'ساعة': 'h', 'منذ': 'ago', '🕘 نسخ تلقائية على الجهاز': '🕘 Automatic backups on this device', 'استرجاع': 'Restore', 'ميزانية': 'Budget', 'استثمار': 'Investments'
  };
  if (typeof FULL_UI_AR_EN !== 'undefined') Object.keys(EN).forEach(function (k) { if (FULL_UI_AR_EN[k] === undefined && k.length > 3) { FULL_UI_AR_EN[k] = EN[k]; FULL_UI_KEYS.push(k); } });
  if (typeof FULL_UI_KEYS !== 'undefined') FULL_UI_KEYS.sort(function (a, b) { return b.length - a.length; });
  var E = function (s) { return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s); };
  function ago(ms) {
    var sec = Math.round((Date.now() - ms) / 1000), en = (typeof APP_LANG !== 'undefined' && APP_LANG === 'en');
    if (sec < 60) return en ? sec + ' s ago' : 'منذ ' + sec + ' ثانية';
    if (sec < 3600) return en ? Math.round(sec / 60) + ' min ago' : 'منذ ' + Math.round(sec / 60) + ' دقيقة';
    return en ? Math.round(sec / 3600) + ' h ago' : 'منذ ' + Math.round(sec / 3600) + ' ساعة';
  }
  function status() {
    if (window._fbUser && window._lastSyncAt) return '☁️ متزامن';
    if (window._fbUser) return '⏳ داخل بالحساب لكن لسه مستلمش البيانات من السحابة';
    if (localStorage.getItem('localOnlyMode') === '1') return '💾 وضع محلي — البيانات على الجهاز ده بس ومش بتتزامن';
    if (navigator.onLine === false) return '📴 مفيش إنترنت';
    if (!window._fbAuthReady) return '⚠️ Firebase مردّش لسه — ممكن يكون محجوب أو النت ضعيف';
    return '⚠️ Firebase مردّش لسه — ممكن يكون محجوب أو النت ضعيف';
  }
  function openSheet() {
    var o = $('syncSheet');
    if (!o) { o = document.createElement('div'); o.className = 'modal-overlay'; o.id = 'syncSheet'; document.body.appendChild(o);
      o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('open'); }); }
    var u = window._fbUser, st = status();
    var rows = '<div class="sy-row"><span>الحساب</span><b dir="ltr" data-no-i18n>' + E(u ? (u.email || u.displayName || 'Google') : '') + '</b>' + (u ? '' : '<b>غير مسجّل دخول</b>') + '</div>' +
      '<div class="sy-row"><span>الحالة</span><b>' + st + '</b></div>' +
      (window._lastSyncAt ? '<div class="sy-row"><span>آخر مزامنة</span><b data-no-i18n>' + ago(window._lastSyncAt) + '</b></div>' : '') +
      (window._lastAuthError ? '<div class="sy-row"><span>آخر خطأ دخول</span><b dir="ltr" data-no-i18n>' + E(window._lastAuthError) + '</b></div>' : '');
    var btns = '';
    if (!u) btns += '<button class="btn btn-primary" onclick="syncSheetSignIn()">تسجيل الدخول بـ Google</button>';
    else btns += '<button class="btn btn-secondary" onclick="document.getElementById(\'syncSheet\').classList.remove(\'open\');window._googleSignOut&&window._googleSignOut()">تسجيل الخروج</button>';
    btns += '<button class="btn btn-secondary" onclick="syncSheetRefresh()">🔃 تحديث التطبيق وتفريغ الكاش</button>';
    var bk = (window.vaultListBackups ? window.vaultListBackups() : []);
    var bkHtml = bk.length ? '<div class="sy-bk"><div class="sy-bk-t">🕘 نسخ تلقائية على الجهاز</div>' + bk.map(function (x) {
      return '<div class="sy-row"><span><b>' + (x.kind === 'bgt' ? 'ميزانية' : 'استثمار') + '</b> <span data-no-i18n dir="ltr">' + new Date(x.t).toLocaleString() + ' · ' + (x.kind === 'bgt' ? x.count + ' items' : Math.round(x.count / 1024) + ' KB') + '</span></span>' +
        '<button type="button" class="cp-btn" onclick="vaultRestore(\'' + x.kind + '\',' + x.i + ')">استرجاع</button></div>';
    }).join('') + '</div>' : '';
    o.innerHTML = '<div class="modal-box vx-box"><div class="modal-title">🔄 حالة المزامنة</div>' + rows + bkHtml +
      '<div class="vx-hint" style="margin-top:10px">تحديث التطبيق بيمسح كاش المتصفح بس — بياناتك ما بتتمسحش.<br>لو بتفتح من Brave: عطّل الـ Shields للموقع ده، وجرّب تسجيل الدخول تاني.</div>' +
      '<div class="modal-btns sy-btns">' + btns + '<button class="btn btn-secondary" onclick="document.getElementById(\'syncSheet\').classList.remove(\'open\')">إغلاق</button></div></div>';
    o.classList.add('open');
  }
  window.openSyncSheet = openSheet;
  window.syncSheetSignIn = function () {
    if (typeof window._googleSignIn !== 'function') { toast('Firebase مش متحمّل — جرّب تحدّث التطبيق أو اتأكد من النت.'); return; }
    $('syncSheet').classList.remove('open');
    if (localStorage.getItem('localOnlyMode') === '1') { localStorage.removeItem('localOnlyMode'); location.reload(); return; }
    try { if (typeof showGoogleAuthScreen === 'function') showGoogleAuthScreen(); } catch (e) {}
  };
  window.syncSheetRefresh = async function () {
    try { var regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(function (r) { return r.unregister(); })); } catch (e) {}
    try { var ks = await caches.keys(); await Promise.all(ks.map(function (k) { return caches.delete(k); })); } catch (e) {}
    location.reload();
  };
  var dot = $('syncDot');
  if (dot && dot.parentElement) { var p = dot.parentElement; p.style.cursor = 'pointer'; p.addEventListener('click', openSheet); p.title = 'حالة المزامنة'; p.setAttribute('role', 'button'); }
  var tabs = $('mainTabs');
  if (tabs && !$('navSync')) {
    var rw = document.createElement('button'); rw.type = 'button'; rw.className = 'nav-row'; rw.id = 'navSync';
    rw.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 0 1-15.5 6.2M3 12A9 9 0 0 1 18.5 5.8"/><path d="M18.5 2v4h-4M5.5 22v-4h4"/></svg><span>حالة المزامنة</span>';
    rw.addEventListener('click', function () { document.body.classList.remove('nav-open'); setTimeout(openSheet, 260); });
    var anchor = $('navCertPay'); if (anchor && anchor.nextSibling) tabs.insertBefore(rw, anchor.nextSibling); else tabs.appendChild(rw);
  }
  // كشف التعليق: لو Firebase ما جاوبش خلال 12 ثانية، نبّه المستخدم مرة واحدة
  setTimeout(function () {
    var stuck = !window._fbAuthReady || (window._fbUser && !window._lastSyncAt);
    if (stuck && localStorage.getItem('localOnlyMode') !== '1') {
      if (dot) dot.classList.add('sy-pulse');
      if (typeof toast === 'function') toast('⚠️ المزامنة مش شغالة — اضغط على النقطة الصغيرة في الهيدر للتفاصيل');
    }
  }, 12000);
})();
