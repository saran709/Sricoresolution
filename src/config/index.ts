export const APP_CONFIG = {
  company: {
    name: 'Sricore Solutions',
    tagline: 'Technology Solutions & Services',
    description: 'A premier technology partner offering comprehensive solutions in software, hardware, AI/ML, and research.',
    contact: {
      email: 'sricoresolution@gmail.com',
      address: '123 Innovation Drive, Tech Park, City, Country',
    },
    socials: {
      linkedin: '#',
      twitter: '#',
      github: '#',
    }
  },
  navigation: {
    main: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Services', href: '/services' },
      { name: 'Solutions', href: '#', children: [
          { name: 'Software Solutions', href: '/solutions/software' },
          { name: 'Hardware & IoT', href: '/solutions/hardware' },
          { name: 'AI/ML Solutions', href: '/solutions/ai-ml' },
      ]},
      { name: 'Internships', href: '/internships' },
      { name: 'Projects', href: '/projects' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
    ]
  }
};
