const fs = require('fs');
let code = fs.readFileSync('src/config/index.ts', 'utf8');

const navCode = `    main: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Services', href: '#', children: [
          { name: 'All Services', href: '/services' },
          { name: 'Project Rescue', href: '/services/project-rescue' },
          { name: 'Digital Transformation', href: '/services/digital-transformation' },
          { name: 'Technology Audit', href: '/services/technology-audit' },
          { name: 'Research Assistance', href: '/services/research' }
      ]},
      { name: 'Solutions', href: '#', children: [
          { name: 'Software Solutions', href: '/solutions/software' },
          { name: 'Hardware & IoT', href: '/solutions/hardware' },
          { name: 'AI/ML Solutions', href: '/solutions/ai-ml' },
      ]},
      { name: 'Idea Lab', href: '/idea-lab' },
      { name: 'Internships', href: '/internships' },
      { name: 'Contact', href: '/contact' },
    ],`;

code = code.replace(/    main: \[[\s\S]*?\],/, navCode);

fs.writeFileSync('src/config/index.ts', code);
