const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Replace the auth block completely to avoid evaluating loading/currentUser at all if that's what's failing. 
// Just explicitly render the auth state without hiding it behind the loading skeleton.
content = content.replace(
  /\{loading \? \([\s\S]*?\) : currentUser \? \([\s\S]*?\) : \([\s\S]*?\)\}/,
  `{currentUser ? (
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

content = content.replace(
  /\{loading \? \([\s\S]*?\) : currentUser \? \([\s\S]*?\) : \([\s\S]*?\)\}/,
  `{currentUser ? (
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="block w-full text-center px-4 py-3 bg-slate-100 rounded-md shadow-sm text-base font-medium text-slate-900"
                >
                  Dashboard
                </Link>
              ) : (
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
