const fs = require('fs');
let r = fs.readFileSync('src/components/ui/CrudTable.tsx', 'utf8');

r = r.replace('const handleDelete = async (id: string) => {\n    // confirm removed\n    try {', 
              'const handleDelete = async (id: string) => {\n    if (!window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;\n    try {');

fs.writeFileSync('src/components/ui/CrudTable.tsx', r);
