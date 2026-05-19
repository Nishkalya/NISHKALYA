import { Project } from './services/projectService';

export const DEFAULT_CONFIG = {
  hero: {
    badge: "Architecting the Future",
    heading: "Design. Code. <span class=\"text-[#A67C00] italic\">Evolve.</span>",
    subheading: "A multidisciplinary studio focusing on high-fidelity user experiences and next-generation AI integrations.",
    stats: [
      { label: "Products Shipped", value: "24+" },
      { label: "Lines of Code", value: "2.1M" },
      { label: "AI Models Trained", value: "14" },
      { label: "Client Satisfaction", value: "100%" }
    ]
  },
  colors: {
    primary: "#D8B45C",
    secondary: "#A67C00"
  },
  about: {
    badge: "The Architect",
    heading: "Bridging the gap between <span class=\"text-[#A67C00]\">Vision</span> and Execution.",
    skills: ["AI Strategy", "React Mastery", "System Design", "Product Engineering", "UI/UX Architecture"],
    paragraphs: [
      "With over a decade of experience across the full digital stack, I specialize in building systems that aren't just functional, but emotionally resonant. My approach combines the rigor of engineering with the nuance of high-end design.",
      "I believe that the best products are those that feel invisible — where technology serves humanity without friction. This philosophy drives every project from initial prototype to final production release."
    ]
  },
  services: [
    { title: "AI Product Development", desc: "Building custom LLM-powered applications from the ground up.", why: "AI is moving from research to product. You need to be first.", what: "We design and build complete AI agents and workflows.", outcome: "A production-ready AI feature that actually solves problems.", details: ["LLM Orchestration", "Vector DB Integration", "Prompt Engineering"] },
    { title: "UI/UX Design Systems", desc: "Creating beautiful, scalable design languages for modern brands.", why: "Consistency is identity. Fragmented UI kills trust.", what: "We build atomic design systems and high-fidelity prototypes.", outcome: "A pixel-perfect UI kit that scales with your growth.", details: ["Atomic Design", "Motion Systems", "Accessibility Audits"] },
    { title: "Web & App Development", desc: "High-performance, secure applications built with cutting-edge tech.", why: "Speed is a feature. Security is a requirement.", what: "Full-stack development using React, Node, and more.", outcome: "A robust, scalable platform that users love to touch.", details: ["React/Next.js", "Cloud Architecture", "API Design"] }
  ]
};

export const DEFAULT_PROJECTS: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Orion — AI Customer Intelligence",
    category: "AI · NLP · SaaS",
    desc: "An LLM-powered platform that analyzes customer conversations in real-time, surfacing insights and automating support workflows at scale.",
    iconType: 'message',
    link: "https://vishal291137.github.io/TIME-LIGHT/",
    isActive: true,
    fullDetails: {
      overview: "# Orion Intelligence\n\nOrion is a state-of-the-art **LLM-powered platform** designed to bridge the gap between customer voices and actionable business intelligence. It processes thousands of conversations simultaneously to extract sentiment, detect urgent issues, and recommend responses.\n\n### ⚡ Strategic Impact\nBy implementing Orion, support teams see a **40% reduction in response times** and a significantly higher NPS due to more accurate and personalized interactions.",
      features: [
        "Real-time sentiment analysis using customized LLMs",
        "Automated support ticket categorization & prioritization",
        "Integration with popular CRM systems (Salesforce, Zendesk)",
        "Interactive dashboard with trend prediction & volume forecasting"
      ],
      techStack: [
        { name: "Python / FastAPI", role: "Scalable backend & AI orchestration" },
        { name: "OpenAI GPT-4", role: "Primary LLM for NLP tasks" },
        { name: "Pinecone", role: "Vector storage for semantic search" },
        { name: "React", role: "Dynamic analytics frontend" }
      ],
      license: "Proprietary License — All Rights Reserved.",
      status: "Production Stable"
    }
  },
  {
    title: "Flux — Smart City Dashboard",
    category: "Computer Vision · IoT",
    desc: "A real-time urban monitoring system using computer vision to manage traffic, energy, and public safety across a network of smart sensors.",
    iconType: 'eye',
    link: "https://vishal291137.github.io/TIME-LIGHT/",
    isActive: true,
    fullDetails: {
      overview: "# Flux Urban Monitoring\n\nFlux transforms urban management into a **data-driven science**. By leveraging advanced computer vision at the edge, Flux monitors traffic flow, detects safety incidents, and optimizes street lighting to reduce energy consumption by up to 30%.\n\n### 🌐 Vision\nTo build cities that breathe and respond in real-time, creating safer and more efficient environments for millions.",
      features: [
        "Real-time object detection for traffic flow optimization",
        "Emergency incident detection (accidents, fires) using CNNs",
        "Adaptive energy management for smart street lighting",
        "Public safety alerts via real-time edge processing"
      ],
      techStack: [
        { name: "TensorRT", role: "High-performance edge inference" },
        { name: "NVIDIA Jetson", role: "Hardware for edge computer vision" },
        { name: "Mqtt", role: "Low-latency IoT communication protocol" },
        { name: "D3.js", role: "Complex spatial data visualization" }
      ],
      license: "Open Source Apache 2.0 — Free for public municipal use.",
      status: "Deployment in Progress"
    }
  }
];
