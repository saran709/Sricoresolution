const fs = require('fs');
let gitignore = fs.readFileSync('.gitignore', 'utf8');
gitignore = gitignore.replace(/^build\/?\r?\n/m, '');
fs.writeFileSync('.gitignore', gitignore);
