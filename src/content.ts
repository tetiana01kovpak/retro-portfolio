// All site content. Edit this file to change what the portfolio shows.

export interface Link {
  label: string;
  href: string;
}

export interface Project {
  name: string;
  file: string;
  preview: string;
  summary: string;
  description: string[];
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

export interface App {
  id: string;
  name: string;
  file: string;
  summary: string;
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
  tagline: 'Fullstack Developer',
  bio: [
    'Fullstack Developer combining technical, creative, and business experience to build modern web applications, e-commerce platforms, and digital products.',
    'Skilled in React, Next.js, Angular, TypeScript, Node.js, databases, and REST APIs, with hands-on experience using AI tools to accelerate development, automate workflows, and improve digital products.',
    'Strong UI/UX and visual design skills using Figma and Adobe Creative Suite, complemented by 3D expertise in Three.js, WebGL, and Blender.',
    'With experience running my own e-commerce business and delivering commercial projects, I bring a product-focused mindset that connects technology, design, and customer needs. Self-driven, multilingual, and experienced in Agile/Scrum environments.',
  ],
};

export const skills: { group: string; items: string[] }[] = [
  { group: 'Frontend', items: ['React', 'Next.js', 'Angular', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'SASS', 'TanStack Query', 'Zustand', 'React Hook Form', 'Zod'] },
  { group: 'Design', items: ['UX Design', 'Figma', 'Adobe Premiere', 'Adobe Photoshop', 'Adobe Illustrator'] },
  { group: '3D & Visual', items: ['Three.js', 'WebGL', 'Blender'] },
  { group: 'Backend', items: ['Node.js', 'NestJS', 'REST APIs', 'WebSockets', 'Swagger / OpenAPI'] },
  { group: 'Databases', items: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma'] },
  { group: 'UI & Design', items: ['Mantine', 'Figma', 'Adobe Creative Suite'] },
  { group: 'Data & API', items: ['REST API', 'Axios', 'Vite'] },
  { group: 'AI & Tools', items: ['Claude', 'Codex', 'Cursor', 'Git', 'Docker', 'Jira'] },
  { group: 'Tools & DevOps', items: ['GitHub Actions (CI/CD)', 'Grafana', 'WordPress'] },
  { group: 'Languages', items: ['English — Advanced', 'Ukrainian — Native', 'German — Intermediate', 'Italian — Intermediate'] },
];

export const projects: Project[] = [
  {
    name: 'ePharmacy',
    file: 'EPHARM.TSX',
    preview: 'epharmacy.jpg',
    summary: 'Full-stack pharmacy store: browse medicine, find nearby pharmacies, manage a cart and check out.',
    description: [
      'A full-stack pharmacy e-commerce app built from a Figma design and functional specification.',
      'Guests browse the home page, the store directory and product pages. Signing in unlocks the medicine catalog with search, category filter and pagination, plus the cart and checkout flow.',
      'Adding to cart as a guest opens an inline login modal; once signed in, the item is added and the visitor continues where they left off.',
      'The Express REST API uses MongoDB with JWT access/refresh auth, bcrypt-hashed passwords, an httpOnly refresh cookie and Yup request validation.',
    ],
    highlights: ['Search & filter', 'Pagination', 'Cart & checkout', 'JWT auth', 'REST API'],
    stack: ['React 19', 'TypeScript', 'Redux Toolkit', 'Express', 'MongoDB', 'JWT'],
    repo: 'https://github.com/tetiana01kovpak/epharmacy_client',
    live: 'https://e-pharmacy-client-j837.onrender.com/',
  },
  {
    name: 'TravelTrucks',
    file: 'TRUCKS.TSX',
    preview: 'traveltrucks.jpg',
    summary: 'Camper rental app: browse, filter and book campers with a gallery, reviews and a booking form.',
    description: [
      'A web app for browsing and booking camper rentals, built with the Next.js App Router and TypeScript on a public campers API.',
      'The catalog filters on the backend by location, vehicle type, engine and transmission, keeps filters in the URL and loads more results with TanStack Query infinite queries.',
      'Each camper page shows a Swiper thumbnail gallery, specs, amenities and user reviews, with a validated booking form and toast notifications.',
    ],
    highlights: ['URL-driven filters', 'Infinite loading', 'Image gallery', 'Booking form', 'Reviews'],
    stack: ['Next.js 15', 'TypeScript', 'TanStack Query', 'React Hook Form', 'Yup', 'Swiper'],
    repo: 'https://github.com/tetiana01kovpak/TravelTrucks',
    live: 'https://travel-trucks-five-self.vercel.app/',
  },
  {
    name: 'Quantum JS',
    file: 'QUANTUM.EXE',
    preview: 'quantumjs.jpg',
    summary: 'E-commerce furniture store SPA with catalog, ordering and reviews. Agile team project.',
    description: [
      'An e-commerce furniture store SPA with a product catalog, ordering and customer reviews.',
      'Built in an Agile team: filtering and pagination over a REST API, modal order forms and a Swiper reviews slider, all responsive.',
    ],
    highlights: ['Filtering', 'Pagination', 'Modals', 'REST API', 'Responsive'],
    stack: ['JavaScript', 'Vite', 'Axios', 'Swiper'],
    repo: 'https://github.com/tetiana01kovpak/QuantumJS',
    live: 'https://tetiana01kovpak.github.io/QuantumJS/',
  },
  {
    name: 'FlowBloom',
    file: 'FLOWBLM.HTM',
    preview: 'flowbloom.jpg',
    summary: 'Responsive, mobile-first landing page for a yoga studio.',
    description: [
      'A responsive, mobile-first landing page for a yoga studio.',
      'Hand-written HTML and CSS with a layout that scales from phones up to wide desktop screens.',
    ],
    highlights: ['Mobile-first', 'Responsive layout'],
    stack: ['HTML', 'CSS'],
    repo: 'https://github.com/tetiana01kovpak/FlowBloom',
    live: 'https://alisapagan.github.io/FlowBloom/',
  },
  {
    name: 'NoteHub',
    file: 'NOTEHUB.SYS',
    preview: 'notehub.jpg',
    summary: 'Full-stack notes app: create, edit, delete and filter notes with persistent storage.',
    description: [
      'A full-stack notes app: create, edit, delete and filter notes.',
      'A Node.js REST API keeps notes in persistent storage and is deployed on Render.',
    ],
    highlights: ['CRUD', 'Filtering', 'Persistent storage', 'Deployed on Render'],
    stack: ['Node.js', 'REST API'],
    repo: 'https://github.com/tetiana01kovpak/nodejs-hw',
    live: 'https://nodejs-hw-comi.onrender.com/',
  },
  {
    name: 'ChillScape',
    file: 'CHILLSCP.TSX',
    preview: 'chillscape.jpg',
    summary: 'Web app for discovering travel locations: browse, filter, log in and leave reviews.',
    description: [
      'A travel discovery frontend built with the Next.js App Router. Visitors can browse and filter locations, view location details, sign in or register, and leave reviews.',
      'The interface uses CSS Modules, TanStack Query and Axios for data fetching, with Zustand for shared state. The project also uses Formik and Yup for forms and validation, plus Swiper for carousels.',
      'Authentication and data requests are handled through Next.js route handlers and HTTP-only cookies.',
    ],
    highlights: ['Browse & filter', 'Authentication', 'Reviews'],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'CSS Modules', 'TanStack Query', 'Axios', 'Zustand', 'Formik', 'Yup', 'Swiper', 'React Hot Toast'],
    repo: 'https://github.com/tetiana01kovpak/chillscape-frontend',
    live: 'https://chillscape-frontend.vercel.app/',
  },
];

export const experience: Role[] = [
  {
    title: 'Junior Fullstack Developer',
    where: 'KvarnerKodek, Croatia',
    dates: '2026 – Present',
    points: [
      'Developing software for autonomous boating systems with React, Mantine, TypeScript and NestJS.',
      'Building modern full-stack features with PostgreSQL, REST APIs, Docker and automated testing in an Agile team.',
    ],
  },
  {
    title: 'Junior Fullstack Developer',
    where: 'Independent & team projects, Ukraine',
    dates: '2025 – 2026',
    points: [
      'Built full-stack web projects (ePharmacy, TravelTrucks, Quantum JS, NoteHub) with React, Next.js, Node.js and REST APIs.',
      'Collaborated on Quantum JS in an Agile/Scrum team: sprints, code review, Git workflows.',
    ],
  },
  {
    title: 'Freelance 3D & Web Developer',
    where: 'Self-employed, client work, Ukraine',
    dates: '2022 – 2025',
    points: [
      'Created commercial 3D assets and scenes in Blender and brought them into interactive Three.js web scenes.',
      'Built and maintained WordPress websites and WooCommerce e-commerce stores.',
    ],
  },
];

export const education: Role[] = [
  {
    title: 'Fullstack Developer course',
    where: 'GoIT',
    dates: '2025 – 2026',
    points: ['HTML/CSS, JavaScript, React, Next.js, Node.js'],
  },
];

// Add certificates here, e.g. { name: 'Fullstack Developer', issuer: 'GoIT', date: '2025', url: 'https://...' }
export const apps: App[] = [
  {
    id: 'solfeggio',
    name: 'Solfeggio Frequencies',
    file: 'SOLFEGGIO.EXE',
    summary: 'Play eight pure sine tones with a volume control and an optional session timer.',
  },
  {
    id: 'garden',
    name: 'Habbit Garden',
    file: 'GARDEN.EXE',
    summary: 'Plant a habit, mark it done once a day and watch it grow in a 3D garden.',
  },
];

export const certificates: Certificate[] = [];

export const contact = {
  email: 'tetianakovpak@gmail.com',
  links: [
    { label: 'Email', href: 'mailto:tetianakovpak@gmail.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tetiana-kovpak/' },
    { label: 'GitHub', href: 'https://github.com/tetiana01kovpak' },
  ] satisfies Link[],
};
