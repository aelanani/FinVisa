#!/usr/bin/env python3
"""شغّله بعد أي تعديل على ملفات الـ js :  python3 build.py
بيحسب نسخة (hash) لكل ملف ويحدّث روابطه في index.html وقائمة الكاش في sw.js."""
import hashlib, re, pathlib
root = pathlib.Path(__file__).parent
NAMES = ['app-main','theme-ui','i18n-full','tabs-enhance','ux-layer','quick-add','certs-debts-extras','i18n-extra','sync-status','early-boot']
def h(p): return hashlib.sha1(p.read_bytes()).hexdigest()[:8]
vers = {n: h(root/f'{n}.js') for n in NAMES}
idx = root/'index.html'; s = idx.read_text(encoding='utf-8')
s = re.sub(r'src="([\w-]+)\.js\?v=[\w-]+"', lambda m: f'src="{m.group(1)}.js?v={vers.get(m.group(1), "x")}"', s)
idx.write_text(s, encoding='utf-8')
sw = root/'sw.js'; t = sw.read_text(encoding='utf-8')
lst = ',\n'.join(f"  './{n}.js?v={v}'" for n, v in vers.items())
t = re.sub(r'// BEGIN-JS-PRECACHE\n[\s\S]*?// END-JS-PRECACHE', lambda m: f'// BEGIN-JS-PRECACHE\n{lst}\n  // END-JS-PRECACHE', t)
total = hashlib.sha1(''.join(vers.values()).encode()).hexdigest()[:6]
t = re.sub(r"const CACHE_NAME = '[^']*';", f"const CACHE_NAME = 'vault-{total}';", t)
sw.write_text(t, encoding='utf-8')
print('updated', len(vers), 'files; cache =', f'vault-{total}')
