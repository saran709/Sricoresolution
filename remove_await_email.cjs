const fs = require('fs');

const files = [
  'src/pages/TellUsYourProblem.tsx',
  'src/pages/InternshipRegistration.tsx',
  'src/pages/Enquiry.tsx',
  'src/pages/Contact.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/await fetch\('\/api\/email\/send'/g, "fetch('/api/email/send'");
  fs.writeFileSync(file, code);
});
