const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');

r = r.replace(/<Route path="\/" element=\{<MainLayout \/>\} \/>}>/g, '<Route path="/" element={<MainLayout />}>');
r = r.replace(/<Suspense fallback=\{<ServiceSkeleton \/>\}><([a-zA-Z]+) \/><\/Suspense>$\s*<Route/gm, '<Suspense fallback={<ServiceSkeleton />}><$1 /></Suspense>} />\n            <Route');

fs.writeFileSync('src/router.tsx', r);
