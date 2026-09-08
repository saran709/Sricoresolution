const fs = require('fs');
let code = fs.readFileSync('src/components/NewsletterSignup.tsx', 'utf8');

code = code.replace(
  'text-slate-900',
  'text-current'
);

code = code.replace(
  'text-slate-600 mb-4',
  'opacity-80 text-sm mb-4'
);

code = code.replace(
  'bg-white',
  'bg-white text-slate-900'
);

fs.writeFileSync('src/components/NewsletterSignup.tsx', code);
