const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');

r = r.replace(/<Route path="\*" element=\{<PagePlaceholder title="Page Not Found" \/>\s*<\/Route>/gm, '<Route path="*" element={<PagePlaceholder title="Page Not Found" />} />\n          </Route>');
r = r.replace(/<Route path="\*" element=\{<PagePlaceholder title="Page Not Found" \/>\s*<\/Routes>/gm, '<Route path="*" element={<PagePlaceholder title="Page Not Found" />} />\n          </Route>\n        </Routes>');

r = r.replace(/<Route path="([a-zA-Z0-9\/-]+)" element=\{<Suspense fallback=\{<ServiceSkeleton \/>\}><([a-zA-Z]+) \/><\/Suspense>$/gm, '<Route path="$1" element={<Suspense fallback={<ServiceSkeleton />}><$2 /></Suspense>} />');

fs.writeFileSync('src/router.tsx', r);
