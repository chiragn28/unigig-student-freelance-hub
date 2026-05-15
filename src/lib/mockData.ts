export const stats = [
  { label: "Students", value: "5,000+" },
  { label: "Universities", value: "200+" },
  { label: "Earned by students", value: "$500k+" },
  { label: "Projects completed", value: "12k+" },
];

export const categories = [
  { name: "Web Dev", icon: "Code2", count: 842 },
  { name: "Graphic Design", icon: "Palette", count: 612 },
  { name: "Tutoring", icon: "GraduationCap", count: 489 },
  { name: "Writing", icon: "PenLine", count: 377 },
  { name: "Video Editing", icon: "Video", count: 298 },
  { name: "Social Media", icon: "Share2", count: 256 },
  { name: "Research", icon: "Search", count: 189 },
  { name: "Data Entry", icon: "Database", count: 154 },
];

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export const freelancers = [
  {
    id: "1",
    name: "Maya Chen",
    avatar: avatar("Maya"),
    university: "Stanford University",
    major: "Computer Science",
    headline: "Frontend Developer · React & TypeScript",
    rate: 35,
    rating: 4.9,
    reviews: 47,
    skills: ["React", "TypeScript", "Tailwind", "Next.js"],
    category: "Web Dev",
  },
  {
    id: "2",
    name: "Jordan Patel",
    avatar: avatar("Jordan"),
    university: "NYU",
    major: "Graphic Design",
    headline: "Brand Identity & Logo Designer",
    rate: 28,
    rating: 4.8,
    reviews: 32,
    skills: ["Figma", "Illustrator", "Branding"],
    category: "Graphic Design",
  },
  {
    id: "3",
    name: "Aiden Brooks",
    avatar: avatar("Aiden"),
    university: "UC Berkeley",
    major: "Mathematics",
    headline: "Calculus & Stats Tutor",
    rate: 22,
    rating: 5.0,
    reviews: 61,
    skills: ["Calculus", "Statistics", "SAT Math"],
    category: "Tutoring",
  },
  {
    id: "4",
    name: "Sofia Reyes",
    avatar: avatar("Sofia"),
    university: "University of Michigan",
    major: "English Literature",
    headline: "Essay Editor & Copywriter",
    rate: 25,
    rating: 4.9,
    reviews: 28,
    skills: ["Editing", "Copywriting", "SEO"],
    category: "Writing",
  },
  {
    id: "5",
    name: "Liam O'Connor",
    avatar: avatar("Liam"),
    university: "USC",
    major: "Film Production",
    headline: "Video Editor for YouTube & TikTok",
    rate: 30,
    rating: 4.7,
    reviews: 19,
    skills: ["Premiere Pro", "After Effects", "Motion"],
    category: "Video Editing",
  },
  {
    id: "6",
    name: "Priya Sharma",
    avatar: avatar("Priya"),
    university: "MIT",
    major: "Data Science",
    headline: "Python & ML Engineer",
    rate: 45,
    rating: 5.0,
    reviews: 38,
    skills: ["Python", "PyTorch", "Pandas"],
    category: "Web Dev",
  },
  {
    id: "7",
    name: "Marcus Webb",
    avatar: avatar("Marcus"),
    university: "Yale",
    major: "Marketing",
    headline: "Social Media Manager · IG & TikTok",
    rate: 26,
    rating: 4.8,
    reviews: 22,
    skills: ["Instagram", "TikTok", "Content"],
    category: "Social Media",
  },
  {
    id: "8",
    name: "Hana Tanaka",
    avatar: avatar("Hana"),
    university: "Columbia",
    major: "Architecture",
    headline: "3D Modeling & Visualization",
    rate: 38,
    rating: 4.9,
    reviews: 14,
    skills: ["Blender", "SketchUp", "Rhino"],
    category: "Graphic Design",
  },
];

export const jobs = [
  {
    id: "j1",
    title: "Build a landing page for my campus startup",
    postedAgo: "2 hours ago",
    budget: "$300 fixed",
    description:
      "Looking for a React dev to build a clean, mobile-first landing page with 3 sections, a sign-up form, and animations. Need it within 2 weeks.",
    skills: ["React", "Tailwind", "Framer Motion"],
    proposals: 12,
    client: { name: "Ethan Kim", university: "Cornell", avatar: avatar("Ethan") },
    category: "Web Dev",
  },
  {
    id: "j2",
    title: "Logo + brand kit for new student podcast",
    postedAgo: "Yesterday",
    budget: "$150 fixed",
    description:
      "Need a friendly, modern logo and a small brand kit (colors, fonts, IG templates) for a podcast about college life.",
    skills: ["Logo Design", "Branding", "Figma"],
    proposals: 24,
    client: { name: "Zoe Martinez", university: "UCLA", avatar: avatar("Zoe") },
    category: "Graphic Design",
  },
  {
    id: "j3",
    title: "Weekly Calc II tutoring – 1hr sessions",
    postedAgo: "3 days ago",
    budget: "$25/hr",
    description:
      "Struggling with integrals and series. Need a patient tutor for weekly sessions through finals.",
    skills: ["Calculus", "Tutoring"],
    proposals: 8,
    client: { name: "Noah Williams", university: "UT Austin", avatar: avatar("Noah") },
    category: "Tutoring",
  },
  {
    id: "j4",
    title: "Edit 10-min YouTube video — gaming highlights",
    postedAgo: "5 hours ago",
    budget: "$75 fixed",
    description:
      "Need clean cuts, captions, and a few zoom effects. Footage is around 45 minutes.",
    skills: ["Premiere Pro", "Captions"],
    proposals: 17,
    client: { name: "Riley Brown", university: "Penn State", avatar: avatar("Riley") },
    category: "Video Editing",
  },
  {
    id: "j5",
    title: "Proofread my 20-page senior thesis",
    postedAgo: "1 day ago",
    budget: "$80 fixed",
    description:
      "English/Lit major preferred. Looking for grammar, clarity, and structural feedback.",
    skills: ["Editing", "Proofreading"],
    proposals: 31,
    client: { name: "Ava Johnson", university: "Brown", avatar: avatar("Ava") },
    category: "Writing",
  },
  {
    id: "j6",
    title: "Run our club's Instagram for the semester",
    postedAgo: "4 days ago",
    budget: "$200/month",
    description:
      "3 posts a week, 5 stories. We'll provide brand assets. Looking for someone creative and reliable.",
    skills: ["Instagram", "Content", "Canva"],
    proposals: 19,
    client: { name: "Diego Alvarez", university: "ASU", avatar: avatar("Diego") },
    category: "Social Media",
  },
];

export const testimonials = [
  {
    id: "t1",
    name: "Olivia Park",
    university: "University of Washington",
    avatar: avatar("Olivia"),
    quote:
      "I paid for half my textbooks last semester just by tutoring through unigig. Way easier than a campus job.",
  },
  {
    id: "t2",
    name: "Andre Wilson",
    university: "Howard University",
    avatar: avatar("Andre"),
    quote:
      "Hired another student to design my club's website. Cheaper than agencies and they actually got the vibe.",
  },
  {
    id: "t3",
    name: "Mei Lin",
    university: "Carnegie Mellon",
    avatar: avatar("Mei"),
    quote:
      "Built my entire freelance portfolio here as a sophomore. Now I have real clients before I've even graduated.",
  },
  {
    id: "t4",
    name: "Tyler Grant",
    university: "Duke University",
    avatar: avatar("Tyler"),
    quote:
      "Found a video editor in 2 hours for my YouTube channel. Same school, super easy to coordinate.",
  },
];

export const conversations = [
  {
    id: "c1",
    name: "Ethan Kim",
    avatar: avatar("Ethan"),
    university: "Cornell",
    lastMessage: "Sounds great — can you start Monday?",
    time: "2m",
    unread: 2,
    online: true,
    messages: [
      { from: "them", text: "Hey! Loved your portfolio.", time: "10:14 AM" },
      { from: "them", text: "Are you available for the landing page gig?", time: "10:14 AM" },
      { from: "me", text: "Hi Ethan! Yes, I'd love to work on it.", time: "10:22 AM" },
      { from: "them", text: "Sounds great — can you start Monday?", time: "10:24 AM" },
    ],
  },
  {
    id: "c2",
    name: "Zoe Martinez",
    avatar: avatar("Zoe"),
    university: "UCLA",
    lastMessage: "Sent over the brand guidelines doc 📄",
    time: "1h",
    unread: 0,
    online: false,
    messages: [
      { from: "them", text: "Sent over the brand guidelines doc 📄", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    name: "Noah Williams",
    avatar: avatar("Noah"),
    university: "UT Austin",
    lastMessage: "Thanks for the session today!",
    time: "Yesterday",
    unread: 0,
    online: true,
    messages: [
      { from: "them", text: "Thanks for the session today!", time: "Yesterday" },
      { from: "me", text: "Anytime — see you Thursday.", time: "Yesterday" },
    ],
  },
  {
    id: "c4",
    name: "Riley Brown",
    avatar: avatar("Riley"),
    university: "Penn State",
    lastMessage: "Quick question about the edit",
    time: "2d",
    unread: 1,
    online: false,
    messages: [
      { from: "them", text: "Quick question about the edit", time: "Mon" },
    ],
  },
];

export const notifications = [
  { id: "n1", text: "Ethan accepted your proposal for 'Build a landing page'", time: "10m ago", unread: true },
  { id: "n2", text: "You earned $150 from Zoe Martinez", time: "2h ago", unread: true },
  { id: "n3", text: "Your profile was viewed 12 times this week", time: "1d ago", unread: false },
];

export const dashboardStats = [
  { label: "Active gigs", value: "3", trend: "+1 this week" },
  { label: "Earnings (mo.)", value: "$1,240", trend: "+18%" },
  { label: "Profile views", value: "248", trend: "+34" },
  { label: "Response rate", value: "98%", trend: "Keep it up" },
];

export const currentUser = {
  name: "Alex Rivera",
  avatar: avatar("Alex"),
  university: "Boston University",
  major: "Computer Science",
  graduationYear: 2026,
  headline: "Full-stack developer · Open to design work",
  bio: "CS junior at BU passionate about clean interfaces and shipping side projects. I've built apps for two campus orgs and freelanced on the side since freshman year.",
  rate: 32,
  skills: ["React", "TypeScript", "Node.js", "Tailwind", "Figma", "PostgreSQL"],
  languages: ["English", "Spanish"],
  portfolio: [
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80",
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=600&q=80",
  ],
};
