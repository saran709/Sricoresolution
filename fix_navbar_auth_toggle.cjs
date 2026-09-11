const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

// Update the navigation right side to correctly show Dashboard / Profile when logged in, and LOGIN when logged out.
const oldDesktopAuth = `          <div className="hidden md:flex items-center space-x-3">
            <Link
                to="/login"
                className="inline-flex items-center justify-center px-3 py-2 text-sm font-bold rounded text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all border border-amber-200"
            >
              LOGIN
            </Link>
            {currentUser ? (
              <Link 
                 to="/dashboard" 
                 className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
              >
                <UserIcon className="w-4 h-4" />
                {userProfile?.firstName || 'Dashboard'}
              </Link>
            ) : (
              <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-md active:scale-95"
              >
                Register
              </Link>
            )}
          </div>`;

const newDesktopAuth = `          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <Link 
                 to="/dashboard" 
                 className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
              >
                <UserIcon className="w-4 h-4" />
                {userProfile?.firstName || 'Dashboard'}
              </Link>
            ) : (
              <>
                <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-md active:scale-95"
                >
                  LOGIN
                </Link>
                <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>`;

if (code.includes(oldDesktopAuth)) {
  code = code.replace(oldDesktopAuth, newDesktopAuth);
} else {
  // If exact string didn't match, let's do a more robust regex replacement for desktop auth
  code = code.replace(
    /<div className="hidden md:flex items-center space-x-3">[\s\S]*?<\/div>/,
    `<div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <Link 
                 to="/dashboard" 
                 className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
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
            )}
          </div>`
  );
}

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
