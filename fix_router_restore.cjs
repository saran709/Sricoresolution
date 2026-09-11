const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');

r = r.replace(/<Route path="([a-zA-Z0-9\/-]+)" element=\{<([a-zA-Z]+) \/>/g, '<Route path="$1" element={<$2 />} />');
r = r.replace(/<Route index element=\{<([a-zA-Z]+) \/>/g, '<Route index element={<$1 />} />');

fs.writeFileSync('src/router.tsx', r);
