(function(){
  function qa(s,c){ return Array.from((c||document).querySelectorAll(s)); }
  var mainTabs = document.getElementById('mainTabs');
  if(!mainTabs) return;
  var allTabs = qa('.tab', mainTabs);
  var primaryPages = ['budget','visa','wallets','debts'];

  function tabByPage(p){ return allTabs.find(function(t){ return t.getAttribute('data-page')===p; }); }

  // شريط سفلي بأهم 4 أقسام + زرار "المزيد" لباقي الأقسام
  var nav = document.createElement('div');
  nav.className = 'bottom-nav'; nav.id = 'bottomNav';
  var html = '';
  primaryPages.forEach(function(p){
    var t = tabByPage(p); if(!t) return;
    var svg = t.querySelector('svg') ? t.querySelector('svg').outerHTML : '';
    var label = t.querySelector('span') ? t.querySelector('span').textContent : p;
    html += '<button class="bn-item'+(t.classList.contains('active')?' active':'')+'" data-page="'+p+'" onclick="bnGo(\''+p+'\')">'+svg+'<span>'+label+'</span></button>';
  });
  // زرار الجرس/المواعيد القادمة — عشان يفضل متاح دايمًا في الموبايل الرأسي حتى لو الهيدر العلوي
  // اتغطى أو اختفى لأي سبب (تمرير الصفحة، حاوية بتاسكرول جوّاها، إلخ)
  html += '<button class="bn-item bn-bell" id="bnBellBtn" onclick="toggleDueDropdown()" title="المواعيد القادمة"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span>المواعيد</span><span id="dueNotifBadgeBn" class="notif-badge"></span></button>';
  html += '<button class="bn-item" id="bnMoreBtn" onclick="bnToggleMore()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg><span>المزيد</span></button>';
  nav.innerHTML = html;
  document.body.appendChild(nav);

  // شباك سفلي (Bottom Sheet) لباقي الأقسام
  var sheet = document.createElement('div');
  sheet.className = 'bn-sheet'; sheet.id = 'bnSheet';
  var restHtml = '';
  allTabs.forEach(function(t){
    var p = t.getAttribute('data-page');
    if(primaryPages.indexOf(p)!==-1) return;
    var svg = t.querySelector('svg') ? t.querySelector('svg').outerHTML : '';
    var label = t.querySelector('span') ? t.querySelector('span').textContent : p;
    restHtml += '<button class="bn-sheet-item" onclick="bnGo(\''+p+'\');bnToggleMore(false)">'+svg+'<span>'+label+'</span></button>';
  });
  sheet.innerHTML = '<div class="bn-sheet-handle"></div><div class="bn-sheet-grid">'+restHtml+'</div>';
  document.body.appendChild(sheet);

  var backdrop = document.createElement('div');
  backdrop.className = 'bn-backdrop'; backdrop.id = 'bnBackdrop';
  backdrop.onclick = function(){ bnToggleMore(false); };
  document.body.appendChild(backdrop);

  window.bnGo = function(page){
    var t = tabByPage(page);
    if(t) showPage(page, t);
    qa('.bn-item[data-page]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-page')===page); });
  };
  window.bnToggleMore = function(force){
    var open = typeof force==='boolean' ? force : !sheet.classList.contains('open');
    sheet.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
  };

  // مزامنة حالة "النشط" في الشريط السفلي لو الصفحة اتغيرت من مكان تاني (الشريط العلوي، أو رابط مباشر)
  var mo = new MutationObserver(function(){
    var activeTab = allTabs.find(function(t){ return t.classList.contains('active'); });
    if(activeTab){
      var p = activeTab.getAttribute('data-page');
      qa('.bn-item[data-page]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-page')===p); });
    }
  });
  allTabs.forEach(function(t){ mo.observe(t,{attributes:true,attributeFilter:['class']}); });

  // زرار الإضافة العائم — بيدوس على أقرب زرار "+ إضافة" ظاهر في الصفحة الحالية
  var fab = document.createElement('button');
  fab.className = 'fab-add'; fab.id = 'fabAdd';
  fab.setAttribute('aria-label','إضافة');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  fab.onclick = function(){
    var activePage = document.querySelector('.page.active');
    if(!activePage) return;
    var btn = activePage.querySelector('.btn-add')
      || activePage.querySelector('.bgt-stab.active')
      || activePage.querySelector('[onclick*="add" i]');
    if(btn) btn.click();
  };
  document.body.appendChild(fab);
})();
