const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Desktop
content = content.replace(
  / \)\ : \(\n\s*<Link \n\s*to="\/login" \n\s*className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded text-slate-600 hover:text-amber-600 transition-colors"\n\s*>Login<\/Link>\n\s*\)\}\n\s*<Link \n\s*to="\/tell-us-your-problem" \n\s*className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"\n\s*>\n\s*TELL US YOUR PROBLEM\n\s*<\/Link>/g,
  ` ) : (
              <Link 
                 to="/login" 
                 className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
              >
                LOGIN
              </Link>
            )}`
);

// Mobile
content = content.replace(
  / \)\ : \(\n\s*<Link\n\s*to="\/login"\n\s*onClick=\{closeMobileMenu\}\n\s*className="block w-full text-center px-4 py-3 border-2 border-slate-200 rounded-md shadow-sm text-base font-medium text-slate-900 hover:border-slate-900"\n\s*>Login<\/Link>\n\s*\)\}\n\s*<Link\n\s*to="\/tell-us-your-problem"\n\s*onClick=\{closeMobileMenu\}\n\s*className="block w-full text-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700"\n\s*>\n\s*TELL US YOUR PROBLEM\n\s*<\/Link>/g,
  ` ) : (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block w-full text-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700"
                >
                  LOGIN
                </Link>
              )}`
);

fs.writeFileSync('src/components/layout/Navbar.tsx', content);
