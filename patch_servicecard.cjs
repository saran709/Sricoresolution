const fs = require('fs');
let code = fs.readFileSync('src/components/ui/ServiceCard.tsx', 'utf8');
code = code.replace("colorScheme = 'blue'", "colorScheme = 'amber'");
fs.writeFileSync('src/components/ui/ServiceCard.tsx', code);
