// All site content. Edit this file to change what the portfolio shows.

export interface Link {
  label: string;
  href: string;
}

export interface Project {
  name: string;
  file: string;
  summary: string;
  description: string[];
  icon: string[];
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
    { name: 'English', grade: 'B2' },
    { name: 'Italian', grade: 'B1' },
    { name: 'German', grade: 'A2' },
    { name: 'Ukrainian', grade: 'Native' },
    { name: 'Russian', grade: 'Native' },
  ],
};

export const skills: { group: string; items: string[] }[] = [
  { group: 'Frontend', items: ['React', 'Next.js', 'Angular', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'SASS'] },
  { group: 'Design', items: ['UX Design', 'Figma', 'Adobe Premiere', 'Adobe Photoshop', 'Adobe Illustrator'] },
  { group: '3D & Visual', items: ['Three.js', 'WebGL', 'Blender'] },
  { group: 'Backend', items: ['Node.js', 'REST API', 'Docker'] },
  { group: 'Databases', items: ['PostgreSQL', 'MongoDB'] },
  { group: 'Data & API', items: ['REST API', 'Axios', 'Vite'] },
  { group: 'Tools & DevOps', items: ['Git', 'GitHub Actions (CI/CD)', 'Docker', 'Grafana', 'Jira', 'WordPress'] },
];

export const projects: Project[] = [
  {
    name: 'ePharmacy',
    file: 'EPHARM.TSX',
    summary: 'Full-stack pharmacy store: browse medicine, find nearby pharmacies, manage a cart and check out.',
    description: [
      'A full-stack pharmacy e-commerce app built from a Figma design and functional specification.',
      'Guests browse the home page, the store directory and product pages. Signing in unlocks the medicine catalog with search, category filter and pagination, plus the cart and checkout flow.',
      'Adding to cart as a guest opens an inline login modal; once signed in, the item is added and the visitor continues where they left off.',
      'The Express REST API uses MongoDB with JWT access/refresh auth, bcrypt-hashed passwords, an httpOnly refresh cookie and Yup request validation.',
    ],
    icon: ['..####..', '..#..#..', '###..###', '#......#', '#......#', '###..###', '..#..#..', '..####..'],
    highlights: ['Search & filter', 'Pagination', 'Cart & checkout', 'JWT auth', 'REST API'],
    stack: ['React 19', 'TypeScript', 'Redux Toolkit', 'Express', 'MongoDB', 'JWT'],
    repo: 'https://github.com/tetiana01kovpak/epharmacy_client',
    live: 'https://e-pharmacy-client-j837.onrender.com/',
  },
  {
    name: 'TravelTrucks',
    file: 'TRUCKS.TSX',
    summary: 'Camper rental app: browse, filter and book campers with a gallery, reviews and a booking form.',
    description: [
      'A web app for browsing and booking camper rentals, built with the Next.js App Router and TypeScript on a public campers API.',
      'The catalog filters on the backend by location, vehicle type, engine and transmission, keeps filters in the URL and loads more results with TanStack Query infinite queries.',
      'Each camper page shows a Swiper thumbnail gallery, specs, amenities and user reviews, with a validated booking form and toast notifications.',
    ],
    icon: ['........', '######..', '#.#.####', '#.#.#..#', '########', '########', '.##..##.', '........'],
    highlights: ['URL-driven filters', 'Infinite loading', 'Image gallery', 'Booking form', 'Reviews'],
    stack: ['Next.js 15', 'TypeScript', 'TanStack Query', 'React Hook Form', 'Yup', 'Swiper'],
    repo: 'https://github.com/tetiana01kovpak/TravelTrucks',
    live: 'https://travel-trucks-five-self.vercel.app/',
  },
  {
    name: 'Quantum JS',
    file: 'QUANTUM.EXE',
    summary: 'E-commerce furniture store SPA with catalog, ordering and reviews. Agile team project.',
    description: [
      'An e-commerce furniture store SPA with a product catalog, ordering and customer reviews.',
      'Built in an Agile team: filtering and pagination over a REST API, modal order forms and a Swiper reviews slider, all responsive.',
    ],
    icon: ['........', '.######.', '.#....#.', '.#....#.', '########', '#......#', '########', '.#....#.'],
    highlights: ['Filtering', 'Pagination', 'Modals', 'REST API', 'Responsive'],
    stack: ['JavaScript', 'Vite', 'Axios', 'Swiper'],
    repo: 'https://github.com/tetiana01kovpak/QuantumJS',
    live: 'https://tetiana01kovpak.github.io/QuantumJS/',
  },
  {
    name: 'FlowBloom',
    file: 'FLOWBLM.HTM',
    summary: 'Responsive, mobile-first landing page for a yoga studio.',
    description: [
      'A responsive, mobile-first landing page for a yoga studio.',
      'Hand-written HTML and CSS with a layout that scales from phones up to wide desktop screens.',
    ],
    icon: ['...##...', '..####..', '#..##..#', '##.##.##', '.######.', '..####..', '...##...', '.######.'],
    highlights: ['Mobile-first', 'Responsive layout'],
    stack: ['HTML', 'CSS'],
    repo: 'https://github.com/tetiana01kovpak/FlowBloom',
    live: 'https://alisapagan.github.io/FlowBloom/',
  },
  {
    name: 'NoteHub',
    file: 'NOTEHUB.SYS',
    summary: 'Full-stack notes app: create, edit, delete and filter notes with persistent storage.',
    description: [
      'A full-stack notes app: create, edit, delete and filter notes.',
      'A Node.js REST API keeps notes in persistent storage and is deployed on Render.',
    ],
    icon: ['######..', '#....##.', '#.##..#.', '#.....#.', '#.###.#.', '#.....#.', '#.###.#.', '#######.'],
    highlights: ['CRUD', 'Filtering', 'Persistent storage', 'Deployed on Render'],
    stack: ['Node.js', 'REST API'],
    repo: 'https://github.com/tetiana01kovpak/nodejs-hw',
    live: 'https://nodejs-hw-comi.onrender.com/',
  },
  {
    name: 'ChillScape',
    file: 'CHILLSCP.TSX',
    summary: 'Web app for discovering travel locations: browse, filter, log in and leave reviews.',
    description: [
      'A web app for discovering travel locations.',
      'Visitors browse and filter places, log in and leave reviews. Built with React and TypeScript.',
    ],
    icon: ['......#.', '.....###', '..#...#.', '.###....', '#####.#.', '######.#', '########', '........'],
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
      'Built full-stack web projects (ePharmacy, TravelTrucks, Quantum JS, NoteHub) with React, Next.js, Node.js and REST APIs.',
      'Collaborated on Quantum JS in an Agile/Scrum team: sprints, code review, Git workflows.',
    ],
  },
  {
    title: 'Freelance 3D & Web Developer',
    where: 'Self-employed, client work',
    points: ['Created commercial 3D assets and scenes in Blender and brought them into interactive Three.js web scenes.'],
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
