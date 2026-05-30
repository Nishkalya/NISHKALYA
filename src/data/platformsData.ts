import { 
  Github, 
  Linkedin, 
  Globe, 
  Trophy, 
  Code2, 
  Palette, 
  Dribbble as DribbbleIcon, 
  Youtube, 
  Award, 
  Link as LinkIcon, 
  Star, 
  GitFork, 
  Eye, 
  ExternalLink,
  ChevronRight,
  BookOpen,
  Milestone
} from 'lucide-react';

export interface PlatformItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  link?: string;
  badges?: string[];
  stats?: { label: string; value: string }[];
  image?: string;
  date?: string;
}

export interface Platform {
  id: string;
  name: string;
  icon: any;
  iconType: string;
  counter: number;
  description: string;
  items: PlatformItem[];
}

export const PLATFORMS: Platform[] = [
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    iconType: 'github',
    counter: 12,
    description: 'Autonomous agents, high-fidelity React interactive web modules, and production-ready server architectures.',
    items: [
      {
        id: 'gh-1',
        title: 'orion-ai-intelligence',
        subtitle: 'TypeScript · Active Development',
        description: 'LLM orchestration pipeline and real-time semantic support ticket router with dual-vector indexing and local cache caching.',
        link: 'https://github.com/vishal291137/orion-ai',
        badges: ['TypeScript', 'LLM', 'FastAPI', 'Pinecone'],
        stats: [
          { label: 'Stars', value: '412' },
          { label: 'Forks', value: '54' }
        ]
      },
      {
        id: 'gh-2',
        title: 'flux-city-core',
        subtitle: 'C++ / Python · Edge Inference',
        description: 'TensorRT computer vision engine designed for smart municipal camera streams with high-performance real-time object tracking.',
        link: 'https://github.com/vishal291137/flux-city',
        badges: ['TensorRT', 'C++', 'Python', 'MQTT'],
        stats: [
          { label: 'Stars', value: '289' },
          { label: 'Forks', value: '38' }
        ]
      },
      {
        id: 'gh-3',
        title: 'sthira-design-tokens',
        subtitle: 'CSS / Tailwind · Package',
        description: 'A structural, high-fidelity glassmorphism token system based on deep cyber-military hud interfaces and responsive components.',
        link: 'https://github.com/vishal291137/sthira-tokens',
        badges: ['TailwindCSS', 'CSS3', 'NPM', 'Vite'],
        stats: [
          { label: 'Stars', value: '143' },
          { label: 'Forks', value: '12' }
        ]
      },
      {
        id: 'gh-4',
        title: 'antigravity-agent-router',
        subtitle: 'TypeScript · Core Server',
        description: 'High-performance event-broker routing actions between parallel agent threads with guaranteed state rollbacks on network drops.',
        link: 'https://github.com/vishal291137/antigravity',
        badges: ['TypeScript', 'Express', 'WebSocket', 'Redis'],
        stats: [
          { label: 'Stars', value: '95' },
          { label: 'Forks', value: '18' }
        ]
      }
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    iconType: 'linkedin',
    counter: 5,
    description: 'Professional networking milestones, leadership articles, system architecture diagrams, and recommendations.',
    items: [
      {
        id: 'li-1',
        title: 'Scaling AI Agents at Edge Nodes',
        subtitle: 'Published Article · 4k Reads',
        description: 'Discussing the paradigm shift of processing GPT-4/Gemini operations locally on IoT cluster rings using structured token streams.',
        link: 'https://linkedin.com/in/nishkalya',
        badges: ['AI Strategy', 'System Topology', 'Edge Nodes'],
        date: 'May 2026'
      },
      {
        id: 'li-2',
        title: 'Senior Systems Architect Role',
        subtitle: 'Experience Milestone',
        description: 'Promoted to orchestrate international design architecture projects, ensuring high-frequency rendering and local cache safety.',
        link: 'https://linkedin.com/in/nishkalya',
        badges: ['Leadership', 'System Archetypes', 'SDLC'],
        date: 'Jan 2025'
      },
      {
        id: 'li-3',
        title: 'Keynote Speaker at DevCon 2025',
        subtitle: 'Community Leadership',
        description: 'Demonstrated high-fidelity cyber design frameworks and fast integration templates for React/Vite live platforms.',
        link: 'https://linkedin.com/in/nishkalya',
        badges: ['Technical Speaking', 'DevOps', 'UI Systems'],
        date: 'Oct 2025'
      }
    ]
  },
  {
    id: 'website',
    name: 'Website',
    icon: Globe,
    iconType: 'website',
    counter: 8,
    description: 'Active host servers, production dashboards, and premium custom web applications running at scale.',
    items: [
      {
        id: 'web-1',
        title: 'Orion Analytics Suite',
        subtitle: 'Enterprise Portal',
        description: 'Live interactive workspace showing customer sentiments, automated replies, and deep-learning performance metrics.',
        link: 'https://test-orion-dashboard.live',
        badges: ['Live Site', 'Next.js', 'SSL Verified', 'Auth0'],
        stats: [
          { label: 'Uptime', value: '99.98%' },
          { label: 'Daily Requests', value: '1.2M' }
        ]
      },
      {
        id: 'web-2',
        title: 'Flux Urban Center',
        subtitle: 'Municipal Hub',
        description: 'Visual grid utilizing custom D3.js modules tracking traffic counts, incident histories, and environment sensors.',
        link: 'https://flux-city-hub.gov',
        badges: ['Interactive Map', 'Mapbox GL', 'D3.js'],
        stats: [
          { label: 'Active Sensors', value: '4,510' },
          { label: 'Daily Decoded FPS', value: '144k' }
        ]
      }
    ]
  },
  {
    id: 'hackerrank',
    name: 'HackerRank',
    icon: Trophy,
    iconType: 'hackerrank',
    counter: 4,
    description: 'Problem-solving certifications, competitive coding achievements, and algorithm scorecards.',
    items: [
      {
        id: 'hr-1',
        title: 'Problem Solving (Advanced)',
        subtitle: 'Gold Level Certificate',
        description: 'Successfully analyzed and implemented advanced graph algorithms, multi-stage dynamic programming pipelines, and bit-manipulators under strict time limits.',
        link: 'https://hackerrank.com/nishkalya',
        badges: ['Algorithms', 'Data Structures', 'Verified Credentials'],
        stats: [
          { label: 'Score', value: '1,200 / 1,200' },
          { label: 'Percentile', value: 'Top 0.5%' }
        ]
      },
      {
        id: 'hr-2',
        title: 'React Core Developer Badge',
        subtitle: 'Expert Evaluation',
        description: 'Completed asynchronous hooks management under concurrent loop conditions, demonstrating deep React scheduler optimization.',
        link: 'https://hackerrank.com/nishkalya',
        badges: ['React Core', 'VDOM Optimizers'],
        stats: [
          { label: 'Rank', value: 'Plat' }
        ]
      }
    ]
  },
  {
    id: 'leetcode',
    name: 'LeetCode',
    icon: Code2,
    iconType: 'leetcode',
    counter: 3,
    description: 'Continuous coding streaks, database problem mastery, and algorithmic complexity verification.',
    items: [
      {
        id: 'lc-1',
        title: 'Platform Overview & Milestones',
        subtitle: 'Rank: Top 1.2% · Expert Solver',
        description: 'Consistently maintaining high performance across daily algorithmic problems. Solved 650+ total challenge cases with clean optimal O(1) space optimizations.',
        link: 'https://leetcode.com/nishkalya',
        badges: ['Knight Class', 'Algorithm Solver', 'DFS/BFS Specialist'],
        stats: [
          { label: 'Solved Problems', value: '684 / 920' },
          { label: 'Max Coding Streak', value: '312 Days' },
          { label: 'Global Ranking', value: '14,204' }
        ]
      },
      {
        id: 'lc-2',
        title: 'Weekly Contest Performance Elite',
        subtitle: 'Badge Awarded',
        description: 'Placed globally in high rating brackets during extreme timing challenges, implementing optimal complex string index calculations.',
        link: 'https://leetcode.com/nishkalya',
        badges: ['Weekly Challenge', 'Interactive Combat'],
        stats: [
          { label: 'Rating', value: '2,154' }
        ]
      }
    ]
  },
  {
    id: 'behance',
    name: 'Behance',
    icon: Palette,
    iconType: 'behance',
    counter: 6,
    description: 'High-fidelity design layouts, atomic visual guidelines, and client prototyping assets.',
    items: [
      {
        id: 'be-1',
        title: 'Cyberpunk HUD Design Vault',
        subtitle: 'Design Concept · 12k Views',
        description: 'Developing high-contrast military vector lines, glowing bracket guidelines, and modular widgets for tactical UI mockups.',
        link: 'https://behance.net/nishkalya',
        badges: ['Figma', 'Vector Crafting', 'Creative Direction'],
        stats: [
          { label: 'Appreciations', value: '1,450' },
          { label: 'Figma Components', value: '130+' }
        ]
      },
      {
        id: 'be-2',
        title: 'Sthira Visual Framework',
        subtitle: 'Consistent Identity',
        description: 'Crafting minimalist, heavy-serif typography palettes paired with absolute charcoal gray backgrounds and neon focus flares.',
        link: 'https://behance.net/nishkalya',
        badges: ['Brand System', 'Typography Selection', 'Dark Presets'],
        stats: [
          { label: 'Saves', value: '348' }
        ]
      }
    ]
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    icon: DribbbleIcon,
    iconType: 'dribbble',
    counter: 6,
    description: 'Micro-interactions, physics-based UI transitions, and component mockups.',
    items: [
      {
        id: 'dr-1',
        title: 'Glassmorphism Hover Ring',
        subtitle: 'Microinteraction Shot',
        description: 'A physical representation of glass depth where backdrop layers shift perspectives based on realistic hover points.',
        link: 'https://dribbble.com/nishkalya',
        badges: ['Framer Motion', '3D Transforms', 'Figma Autolayout'],
        stats: [
          { label: 'Likes', value: '620' },
          { label: 'Views', value: '8.4k' }
        ]
      },
      {
        id: 'dr-2',
        title: 'BGMI Cyber Interface Cards',
        subtitle: 'Layout Presentation',
        description: 'Showing structured dark status lines, server indicators, and modular technology widgets in highly styled profiles.',
        link: 'https://dribbble.com/nishkalya',
        badges: ['Mobile Interactive', 'Design Tokens'],
        stats: [
          { label: 'Likes', value: '412' }
        ]
      }
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    iconType: 'youtube',
    counter: 8,
    description: 'Technical deep-dives, live coding screencasts, and developer design system guides.',
    items: [
      {
        id: 'yt-1',
        title: 'Building a Custom LLM Vector Proxy',
        subtitle: 'Video Tutorial · 18k Views',
        description: 'Step-by-step masterclass demonstrating custom server caching, indexing with pinecone, and bypassing browser client key leaks.',
        link: 'https://youtube.com',
        badges: ['TypeScript', 'FastAPI', 'Masterclass', 'Hacker Tips'],
        stats: [
          { label: 'Subscribers', value: '8.2k' },
          { label: 'Likes', value: '1.2k' }
        ]
      },
      {
        id: 'yt-2',
        title: 'High-Fidelity Tailwind Micro-Effects',
        subtitle: 'Live Stream Recording',
        description: 'Exploring dynamic CSS grids, custom gradients, cyberhud flaring borders, and optimized frame durations.',
        link: 'https://youtube.com',
        badges: ['TailwindCSS', 'CSS3 Tricks', 'Live Dev'],
        stats: [
          { label: 'Duration', value: '1h 45m' }
        ]
      }
    ]
  },
  {
    id: 'certificates',
    name: 'Certificates',
    icon: Award,
    iconType: 'certificates',
    counter: 15,
    description: 'Industry-standard cloud, engineering, and systems development credentials.',
    items: [
      {
        id: 'cert-1',
        title: 'Professional Cloud Security Engineer',
        subtitle: 'Google Cloud Certified',
        description: 'Validated expert capability in designing secure identity networks, KMS encryption rings, and Kubernetes cluster bounds.',
        badges: ['GCP Security', 'IAM Control', 'KMS Encryption'],
        date: 'Issued Mar 2026'
      },
      {
        id: 'cert-2',
        title: 'Certified Kubernetes Administrator (CKA)',
        subtitle: 'Cloud Native Computing Foundation',
        description: 'Demonstrated proficiency in cluster setups, logging streams, network policies, and persistent storage bounds.',
        badges: ['Kubernetes', 'Core Docker', 'Helm Charts'],
        date: 'Issued Jan 2026'
      },
      {
        id: 'cert-3',
        title: 'Advanced AI Architect Certificate',
        subtitle: 'DeepLearning.AI Academy',
        description: 'Focused on advanced model fine-tuning processes, parameter efficient weights, and reinforcement evaluation pipelines.',
        badges: ['LLM Fine-Tuning', 'PEFT', 'RLHF'],
        date: 'Issued Nov 2025'
      },
      {
        id: 'cert-4',
        title: 'Meta Frontend Engineer Master',
        subtitle: 'Meta Professional Academy',
        description: 'Covering pure asynchronous React hook lifecycle processes, accessible screen layouts, and performance auditing.',
        badges: ['Advanced React', 'ARIA Access', 'Web Vital Audit'],
        date: 'Issued Aug 2025'
      }
    ]
  },
  {
    id: 'other',
    name: 'Other Links',
    icon: LinkIcon,
    iconType: 'other',
    counter: 4,
    description: 'Additional personal channels, engineering newsletters, blogs, and curriculum vitae details.',
    items: [
      {
        id: 'ot-1',
        title: 'Medium Technical Blog',
        subtitle: 'Weekly Newsletter',
        description: 'Engaging developer articles on front-end performance, custom layouts, and systems design principles.',
        link: 'https://medium.com',
        badges: ['Engineering Blog', '4.2k Substack']
      },
      {
        id: 'ot-2',
        title: 'Direct Resume Portfolio (PDF)',
        subtitle: 'Download Link',
        description: 'Get an offline portable copy of active certificates, project histories, and verified credentials.',
        link: '#',
        badges: ['Printable Curriculums', 'Offline Copy']
      }
    ]
  }
];
