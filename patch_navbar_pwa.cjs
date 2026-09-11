const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

if (!content.includes('PWAInstallButton')) {
  content = content.replace(/import \{ Link, useLocation \} from 'react-router-dom';/, `import { Link, useLocation } from 'react-router-dom';\nimport { PWAInstallButton } from '../ui/PWAInstallButton';`);
  
  // Find where to inject it in desktop nav
  const desktopTarget = `{userProfile || currentUser ? (`;
  if (content.includes(desktopTarget)) {
    content = content.replace(desktopTarget, `<div className="mr-2 hidden md:block"><PWAInstallButton /></div>\n            ` + desktopTarget);
  }
  
  // Find where to inject it in mobile nav
  const mobileTarget = `className="w-full flex items-center gap-2 py-2 text-base font-medium text-amber-600 hover:text-amber-500"`;
  if (content.includes(mobileTarget)) {
    content = content.replace(/<div className="pt-4 pb-3 border-t border-slate-200">/, `<div className="pt-4 pb-3 border-t border-slate-200">\n              <div className="px-4 mb-4"><PWAInstallButton /></div>`);
  }

  fs.writeFileSync('src/components/layout/Navbar.tsx', content);
  console.log('Patched Navbar with PWAInstallButton');
}
