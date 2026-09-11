const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

const target1 = `          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (`;
const replacement1 = `          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-20 h-9 bg-slate-100 rounded animate-pulse" />
            ) : currentUser ? (`;

const target2 = `            <div className="pt-4 pb-2 space-y-2">
              {currentUser ? (`;
const replacement2 = `            <div className="pt-4 pb-2 space-y-2">
              {loading ? (
                <div className="w-full h-12 bg-slate-100 rounded-md animate-pulse" />
              ) : currentUser ? (`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
code = code.replace('const { currentUser, userProfile } = useAuth();', 'const { currentUser, userProfile, loading } = useAuth();');

fs.writeFileSync('src/components/layout/Navbar.tsx', code);
