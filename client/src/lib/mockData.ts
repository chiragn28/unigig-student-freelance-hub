// Static marketing content for the landing page. Dynamic user/job data
// is fetched from the backend via @/lib/queries.

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
