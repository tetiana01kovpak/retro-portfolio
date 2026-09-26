// All site content. Edit this file to change what the portfolio shows.

export interface Link {
  label: string;
  href: string;
}

export interface Project {
  name: string;
  file: string;
  summary: string;
  highlights: string[];
  stack: string[];
  repo: string;
  live?: string;
}

export interface Role {
  title: string;
  where: string;
  dates?: string;
  points: string[];
}

export interface Certificate {
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export const profile = {
  name: 'Tetiana Kovpak',
  role: 'Junior Fullstack Developer',
  welcome: 'Welcome to my portfolio',
  tagline: 'Full stack developer',
  bio: [
    'Junior Fullstack Developer who combines strong technical skills with hands-on business experience.',
    'I build polished, responsive web applications with React and Node.js, with a rare edge in 3D web experiences using Three.js and Blender.',
    'I have managed my own e-commerce business and delivered commercial 3D work for clients, so I understand not just the code but the product and the customer behind it.',
    'Multilingual, self-driven, experienced in Agile/Scrum. Currently looking for a Fullstack Developer position.',
  ],
  languages: [
    { name: 'Ukrainian', level: 'Native', value: 100 },
    { name: 'Russian', level: 'Native', value: 100 },
    { name: 'English', level: 'Advanced', value: 80 },
    { name: 'German', level: 'Intermediate', value: 55 },
  ],
};

export const skills: { group: string; items: string[] }[] = [
  { group: 'Frontend', items: ['React', 'Next.js', 'Angular', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'SASS'] },
  { group: '3D & Visual', items: ['Three.js', 'WebGL', 'Blender'] },
  { group: 'Backend', items: ['Node.js', 'REST API', 'Docker'] },
  { group: 'Databases', items: ['PostgreSQL', 'MongoDB'] },
  { group: 'Data & API', items: ['REST API', 'Axios', 'Vite'] },
  { group: 'Tools & DevOps', items: ['Git', 'GitHub Actions (CI/CD)', 'Docker', 'Grafana', 'Jira', 'WordPress'] },
];

export const projects: Project[] = [
  {
    name: 'Habbit Garden',
    file: 'HABBIT.3D',
    summary: 'Interactive 3D habit tracker: each habit grows as a procedurally generated plant in a WebGL garden.',
    highlights: ['Five plant types', 'Dynamic lighting', 'Raycasting', 'Streak feedback', 'CI/CD via GitHub Actions'],
    stack: ['Three.js', 'JavaScript', 'Vite'],
    repo: 'https://github.com/tetiana01kovpak/habbit-garden',
  },
  {
    name: 'Quantum JS',
    file: 'QUANTUM.EXE',
    summary: 'E-commerce furniture store SPA with catalog, ordering and reviews. Agile team project.',
    highlights: ['Filtering', 'Pagination', 'Modals', 'REST API', 'Responsive'],
    stack: ['JavaScript', 'Vite', 'Axios', 'Swiper'],
    repo: 'https://github.com/tetiana01kovpak/QuantumJS',
    live: 'https://tetiana01kovpak.github.io/QuantumJS/',
  },
  {
    name: 'FlowBloom',
    file: 'FLOWBLM.HTM',
    summary: 'Responsive, mobile-first landing page for a yoga studio.',
    highlights: ['Mobile-first', 'Responsive layout'],
    stack: ['HTML', 'CSS'],
    repo: 'https://github.com/tetiana01kovpak/FlowBloom',
    live: 'https://alisapagan.github.io/FlowBloom/',
  },
  {
    name: 'NoteHub',
    file: 'NOTEHUB.SYS',
    summary: 'Full-stack notes app: create, edit, delete and filter notes with persistent storage.',
    highlights: ['CRUD', 'Filtering', 'Persistent storage', 'Deployed on Render'],
    stack: ['Node.js', 'REST API'],
    repo: 'https://github.com/tetiana01kovpak/nodejs-hw',
    live: 'https://nodejs-hw-comi.onrender.com/',
  },
  {
    name: 'ChillScape',
    file: 'CHILLSCP.TSX',
    summary: 'Web app for discovering travel locations: browse, filter, log in and leave reviews.',
    highlights: ['Browse & filter', 'Authentication', 'Reviews'],
    stack: ['TypeScript', 'React'],
    repo: 'https://github.com/tetiana01kovpak/chillscape-frontend',
    live: 'https://chillscape-frontend.vercel.app/',
  },
];

export const experience: Role[] = [
  {
    title: 'Junior Fullstack Developer',
    where: 'Independent & team projects',
    dates: '2024 – Present',
    points: [
      'Built full-stack and 3D web projects (Habbit Garden, Quantum JS, NoteHub, FlowBloom) with React, Node.js, Three.js and REST APIs.',
      'Collaborated on Quantum JS in an Agile/Scrum team: sprints, code review, Git workflows.',
    ],
  },
  {
    title: 'Freelance 3D & Web Developer',
    where: 'Self-employed, client work',
    points: ['Created commercial 3D assets and scenes in Blender and brought them into interactive Three.js web scenes.'],
  },
  {
    title: 'E-commerce Business Owner',
    where: 'Self-employed',
    points: [
      'Ran an online store end to end: listings, pricing, customer service and fulfillment.',
      'That experience shapes how I think about UX and the customer behind the product.',
    ],
  },
];

export const education: Role[] = [
  {
    title: 'Fullstack Developer course',
    where: 'GoIT',
    points: ['HTML/CSS, JavaScript, React, Next.js, Node.js'],
  },
];

// Add certificates here, e.g. { name: 'Fullstack Developer', issuer: 'GoIT', date: '2025', url: 'https://...' }
export const certificates: Certificate[] = [];

export const contact = {
  email: 'tetianakovpak@gmail.com',
  links: [
    { label: 'Email', href: 'mailto:tetianakovpak@gmail.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tetiana-kovpak/' },
    { label: 'GitHub', href: 'https://github.com/tetiana01kovpak' },
  ] satisfies Link[],
};
