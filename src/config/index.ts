export const APP_CONFIG = {
  company: {
    name: 'Sricore Solutions',
    tagline: 'Technology Solutions & Services',
    description: 'A premier technology partner offering comprehensive solutions in software, hardware, AI/ML, and research.',
    contact: {
      email: 'contact@sricoresolutions.com',
      phone: '+91 98402 34567',
      address: 'Namakkal - 637018, Tamil Nadu, India',
    },
    socials: {
      linkedin: '#',
      twitter: '#',
      github: '#',
    },
    internshipFormUrl: 'https://forms.gle/StQmejms3z9voMMU7'
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
      { name: 'Projects', href: '/projects' },
      { name: 'Career', href: '/career' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
    ]
  }
};
