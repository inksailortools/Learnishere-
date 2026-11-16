export type Category = {
  slug: string;
  name: string;
  short: string;
  accent: string;
};

export type Course = {
  slug: string;
  title: string;
  category: string;
  type: "Diploma" | "Master's" | "Certification" | "Short course" | "Module";
  level: "Beginner" | "Intermediate" | "All levels";
  duration: string;
  description: string;
  outcomes: string[];
  modules: string[];
  featured?: boolean;
  image: string;
};

export const categories: Category[] = [
  {
    slug: "business-analysis",
    name: "Business Analysis",
    short: "Turn complex business needs into clear, practical solutions.",
    accent: "#AA89ED",
  },
  {
    slug: "ai-automation",
    name: "AI & Automation",
    short: "Build responsible, efficient workflows with modern AI tools.",
    accent: "#787FDA",
  },
  {
    slug: "web-development",
    name: "Web Development",
    short: "Create accessible, production-minded digital experiences.",
    accent: "#B89AF0",
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    short: "Plan measurable campaigns across search, social and email.",
    accent: "#C3AFE9",
  },
  {
    slug: "sap",
    name: "SAP Training",
    short: "Develop role-relevant capability across essential SAP modules.",
    accent: "#7774A8",
  },
  {
    slug: "cloud-computing",
    name: "Cloud Computing",
    short: "Understand scalable cloud architecture and operations.",
    accent: "#C8B0F3",
  },
  {
    slug: "devops",
    name: "DevOps",
    short: "Connect development and operations through reliable delivery.",
    accent: "#787FDA",
  },
  {
    slug: "3d-animation",
    name: "3D Animation",
    short: "Bring visual stories to life through practical production skills.",
    accent: "#AA89ED",
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    short: "Design useful, inclusive products grounded in user needs.",
    accent: "#B89AF0",
  },
  {
    slug: "languages",
    name: "Language Courses",
    short: "Build practical confidence in French, Spanish, German or English.",
    accent: "#C3AFE9",
  },
];

const photos = {
  code: "https://images.unsplash.com/photo-1489875347897-49f64b51c1f8?auto=format&fit=crop&w=1200&q=82",
  codeAlt:
    "https://images.unsplash.com/photo-1625838144804-300f3907c110?auto=format&fit=crop&w=1200&q=82",
  students:
    "https://images.unsplash.com/photo-1758270705172-07b53627dfcb?auto=format&fit=crop&w=1200&q=82",
  classroom:
    "https://images.unsplash.com/photo-1792783221344-4a9f1dff7bc6?auto=format&fit=crop&w=1200&q=82",
};

export const courses: Course[] = [
  {
    slug: "business-analysis-foundations",
    title: "Business Analysis Foundations",
    category: "Business Analysis",
    type: "Certification",
    level: "Beginner",
    duration: "8 weeks",
    description:
      "Build a practical foundation in requirements, stakeholder discovery and process improvement.",
    outcomes: [
      "Frame business problems clearly",
      "Document useful requirements",
      "Map stakeholders and processes",
    ],
    modules: [
      "The analyst mindset",
      "Discovery and stakeholder mapping",
      "Requirements in practice",
      "Process modelling",
      "Capstone case study",
    ],
    featured: true,
    image: photos.students,
  },
  {
    slug: "applied-ai-automation",
    title: "Applied AI & Automation",
    category: "AI & Automation",
    type: "Diploma",
    level: "Intermediate",
    duration: "16 weeks",
    description:
      "Design useful AI-assisted workflows while considering reliability, privacy and human oversight.",
    outcomes: [
      "Evaluate automation opportunities",
      "Prototype AI workflows",
      "Apply responsible AI practices",
    ],
    modules: [
      "AI systems today",
      "Workflow design",
      "Prompt and context engineering",
      "Automation patterns",
      "Applied portfolio project",
    ],
    featured: true,
    image: photos.codeAlt,
  },
  {
    slug: "modern-web-development",
    title: "Modern Web Development",
    category: "Web Development",
    type: "Diploma",
    level: "Beginner",
    duration: "20 weeks",
    description:
      "Move from web fundamentals to responsive, maintainable applications through guided projects.",
    outcomes: [
      "Build semantic interfaces",
      "Work with modern JavaScript",
      "Ship a portfolio-ready application",
    ],
    modules: [
      "HTML and the accessible web",
      "Modern CSS",
      "JavaScript foundations",
      "React applications",
      "Deployment and portfolio",
    ],
    featured: true,
    image: photos.code,
  },
  {
    slug: "digital-marketing-strategy",
    title: "Digital Marketing Strategy",
    category: "Digital Marketing",
    type: "Certification",
    level: "All levels",
    duration: "10 weeks",
    description:
      "Connect audience insight, channel planning and measurement into one practical marketing system.",
    outcomes: [
      "Create an audience-led plan",
      "Choose meaningful channel metrics",
      "Build a measurement framework",
    ],
    modules: [
      "Market and audience",
      "Channel strategy",
      "Content systems",
      "Campaign measurement",
      "Strategy presentation",
    ],
    featured: true,
    image: photos.classroom,
  },
  {
    slug: "sap-fico",
    title: "SAP FICO",
    category: "SAP Training",
    type: "Module",
    level: "Intermediate",
    duration: "12 weeks",
    description:
      "Develop a structured understanding of financial accounting and controlling workflows in SAP.",
    outcomes: [
      "Navigate core FICO concepts",
      "Understand common configuration flows",
      "Practice scenario-based processes",
    ],
    modules: [
      "SAP and enterprise finance",
      "General ledger",
      "Accounts payable and receivable",
      "Controlling",
      "Integrated scenarios",
    ],
    image: photos.students,
  },
  {
    slug: "sap-successfactors",
    title: "SAP SuccessFactors",
    category: "SAP Training",
    type: "Module",
    level: "Intermediate",
    duration: "10 weeks",
    description:
      "Explore the core processes that support modern people operations in SAP SuccessFactors.",
    outcomes: [
      "Understand the platform landscape",
      "Map employee lifecycle workflows",
      "Apply configuration concepts",
    ],
    modules: [
      "Platform overview",
      "Employee Central",
      "Talent processes",
      "Reporting",
      "Implementation scenarios",
    ],
    image: photos.classroom,
  },
  {
    slug: "cloud-computing-foundations",
    title: "Cloud Computing Foundations",
    category: "Cloud Computing",
    type: "Certification",
    level: "Beginner",
    duration: "8 weeks",
    description:
      "Learn the building blocks of secure, scalable cloud systems with provider-neutral concepts.",
    outcomes: [
      "Explain core cloud models",
      "Design a basic cloud architecture",
      "Recognise security responsibilities",
    ],
    modules: [
      "Cloud fundamentals",
      "Compute and storage",
      "Networking",
      "Identity and security",
      "Architecture project",
    ],
    image: photos.codeAlt,
  },
  {
    slug: "devops-delivery-practice",
    title: "DevOps Delivery Practice",
    category: "DevOps",
    type: "Certification",
    level: "Intermediate",
    duration: "10 weeks",
    description:
      "Improve delivery reliability with version control, automation, observability and collaborative practice.",
    outcomes: [
      "Design a delivery pipeline",
      "Use infrastructure automation concepts",
      "Plan meaningful observability",
    ],
    modules: [
      "DevOps principles",
      "Source and build",
      "Continuous delivery",
      "Infrastructure as code",
      "Reliability and observability",
    ],
    image: photos.code,
  },
  {
    slug: "ui-ux-product-design",
    title: "UI/UX Product Design",
    category: "UI/UX Design",
    type: "Diploma",
    level: "Beginner",
    duration: "16 weeks",
    description:
      "Research, structure, prototype and evaluate thoughtful digital product experiences.",
    outcomes: [
      "Conduct focused user research",
      "Create accessible interface systems",
      "Present a product case study",
    ],
    modules: [
      "Design foundations",
      "Research and synthesis",
      "Information architecture",
      "Interaction and interface",
      "Portfolio case study",
    ],
    image: photos.students,
  },
  {
    slug: "seo-essentials",
    title: "SEO Essentials",
    category: "Digital Marketing",
    type: "Short course",
    level: "Beginner",
    duration: "4 weeks",
    description:
      "Build a practical, ethical foundation in technical, on-page and content-focused SEO.",
    outcomes: [
      "Audit basic search visibility",
      "Plan useful search-led content",
      "Measure organic performance",
    ],
    modules: [
      "How search works",
      "Technical foundations",
      "On-page practice",
      "Content and measurement",
    ],
    image: photos.codeAlt,
  },
  {
    slug: "meta-ads-practical",
    title: "Meta Ads: Practical Campaigns",
    category: "Digital Marketing",
    type: "Short course",
    level: "Beginner",
    duration: "3 weeks",
    description:
      "Understand campaign structure, creative testing and responsible paid-social measurement.",
    outcomes: ["Structure a campaign", "Plan creative tests", "Read performance signals"],
    modules: ["Account structure", "Audiences and creative", "Measurement and iteration"],
    image: photos.classroom,
  },
  {
    slug: "wordpress-site-building",
    title: "WordPress Site Building",
    category: "Web Development",
    type: "Short course",
    level: "Beginner",
    duration: "4 weeks",
    description:
      "Plan, build and maintain a useful WordPress website with sound content and security practices.",
    outcomes: [
      "Set up a clear site structure",
      "Build accessible pages",
      "Maintain a safer installation",
    ],
    modules: [
      "Planning your site",
      "Themes and content",
      "Performance and accessibility",
      "Maintenance and handover",
    ],
    image: photos.code,
  },
];

export const shortCourseNames = [
  "SEO",
  "Meta Ads",
  "Google Ads",
  "LinkedIn Marketing",
  "Email Marketing",
  "E-commerce Marketing",
  "Shopify",
  "WordPress",
  "Social Media Automation",
];

export const instructors = [
  {
    name: "Amara Okafor",
    area: "Business analysis & product practice",
    image:
      "https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?auto=format&fit=crop&w=700&q=82",
  },
  {
    name: "Daniel Mercer",
    area: "Web engineering & cloud systems",
    image:
      "https://images.unsplash.com/photo-1676378385638-135ca6ef4619?auto=format&fit=crop&w=700&q=82",
  },
  {
    name: "Leila Hassan",
    area: "Digital strategy & growth",
    image:
      "https://images.unsplash.com/photo-1683848644087-c3cb69b77d4f?auto=format&fit=crop&w=700&q=82",
  },
];

export const faqs = [
  [
    "Are LearnIsphere programmes accredited?",
    "Programme type, awarding institution and recognition details are shown individually. We do not describe a programme as accredited unless that status is officially supported.",
  ],
  [
    "Can I study from anywhere?",
    "The learning experience is designed for worldwide access. Availability, schedules, payments and any regional requirements are confirmed on each programme page.",
  ],
  [
    "What happens after I enrol?",
    "Django grants course access only after payment is verified. Enrolled courses then appear in the LearnIsphere Student Dashboard.",
  ],
  [
    "Do short courses include certificates?",
    "Certificate eligibility and completion requirements are configured per course. A purchase alone never guarantees a certificate.",
  ],
  [
    "Can organisations train a team?",
    "Yes. Use the contact form to discuss group learning, tailored pathways and operational requirements.",
  ],
];
