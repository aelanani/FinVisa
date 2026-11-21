// ── عرض فوري من بيانات الجهاز (Local-first) ──
// Firebase هو المصدر الأساسي؛ ده بس بيعرض آخر نسخة محفوظة على الجهاز فورًا، ولما Firebase يرد
// بيتحدّث كل حاجة تلقائيًا (نفس مسار _doPageInit بتاع التحديث). الكتابة على السحابة لسه محمية
// بنفس الحراسات (fbSet / bgtFbSet ما بيتفعّلوش إلا بعد أول قراءة من السحابة).
(function () {
  try {
    if (window._pageInitDone || (typeof fbLoaded !== 'undefined' && fbLoaded)) return;
    var had = localStorage.getItem('vaultHadSession') === '1' || localStorage.getItem('localOnlyMode') === '1';
    if (!had) return;
    if (!localStorage.getItem(STORAGE_KEY) && !localStorage.getItem(BGT_KEY)) return;
    window._earlyBooted = true;
    loadState();
    if (!bgtFbLoaded) bgtLoad();
    try { setFbStatus('💾 من الجهاز — جاري المزامنة...', '#8b6020', '#fdf5e6', '#e8c87a'); } catch (e) {}
    try { setBgtStatus('💾 من الجهاز — جاري المزامنة...', '#8b6020', '#fdf5e6', '#e8c87a'); } catch (e) {}
    _doPageInit();
  } catch (e) { console.warn('[early boot]', e); }
})();
