const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Replace the auth block in the Desktop navbar to ensure the LOGIN button is visible
content = content.replace(
  /\{loading \? \(\n\s*<div className="w-20 h-9 bg-slate-100 rounded animate-pulse" \/>\n\s*\) : currentUser \? \(\n\s*<Link \n\s*to="\/dashboard"\n\s*className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"\n\s*>\n\s*<UserIcon className="w-4 h-4" \/>\n\s*\{userProfile\?\.firstName \|\| 'Dashboard'\}\n\s*<\/Link>\n\s*\) : \(\n\s*<Link\n\s*to="\/login"\n\s*className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"\n\s*>\n\s*LOGIN\n\s*<\/Link>\n\s*\)\}/,
  `{loading ? (
              <div className="w-20 h-9 bg-slate-100 rounded animate-pulse" />
            ) : currentUser ? (
              <Link 
                 to="/dashboard" 
                 className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                {userProfile?.firstName || 'Dashboard'}
              </Link>
            ) : (
              <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-md active:scale-95"
              >
                LOGIN
              </Link>
            )}`
);

fs.writeFileSync('src/components/layout/Navbar.tsx', content);
