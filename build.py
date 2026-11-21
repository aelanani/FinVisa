#!/usr/bin/env python3
"""شغّله بعد أي تعديل على ملفات js/*.js :  python3 build.py
بيحسب نسخة (hash) لكل ملف ويحدّث روابطه في index.html وقائمة الكاش في sw.js
(عشان الموبايل ما يفضلش على نسخة قديمة، ولا يحصل خلط بين HTML جديد وJS قديم)."""
import hashlib, re, pathlib
root = pathlib.Path(__file__).parent
def h(p): return hashlib.sha1(p.read_bytes()).hexdigest()[:8]
vers = {p.stem: h(p) for p in sorted((root/'js').glob('*.js'))}
idx = root/'index.html'; s = idx.read_text(encoding='utf-8')
s = re.sub(r'js/([\w-]+)\.js\?v=[\w-]+', lambda m: f"js/{m.group(1)}.js?v={vers.get(m.group(1), 'x')}", s)
idx.write_text(s, encoding='utf-8')
sw = root/'sw.js'; t = sw.read_text(encoding='utf-8')
lst = ',\n'.join(f"  './js/{n}.js?v={v}'" for n, v in vers.items())
t = re.sub(r'// BEGIN-JS-PRECACHE\n[\s\S]*?// END-JS-PRECACHE', f'// BEGIN-JS-PRECACHE\n{lst}\n  // END-JS-PRECACHE', t)
total = hashlib.sha1(''.join(vers.values()).encode()).hexdigest()[:6]
t = re.sub(r"const CACHE_NAME = '[^']*';", f"const CACHE_NAME = 'vault-{total}';", t)
sw.write_text(t, encoding='utf-8')
print('updated', len(vers), 'files; cache =', f'vault-{total}')
