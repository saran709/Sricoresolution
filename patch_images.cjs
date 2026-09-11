const fs = require('fs');

const files = [
  'src/pages/admin/Newsletters.tsx',
  'src/components/ui/ProjectCard.tsx',
  'src/components/layout/Navbar.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/<img /g, '<img loading="lazy" ');
    // Handle double loading="lazy" if it happens, just in case
    content = content.replace(/loading="lazy" loading="lazy"/g, 'loading="lazy"');
    fs.writeFileSync(f, content);
    console.log('Patched', f);
  }
});
