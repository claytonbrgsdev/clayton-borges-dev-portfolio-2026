export type StackItem = {
  name: string;
  note?: string;
};

export type StackCategory = {
  title: string;
  items: StackItem[];
};

export const stack: StackCategory[] = [
  {
    title: "Frontend",
    items: [
      { name: "JavaScript" },
      { name: "TypeScript" },
      { name: "React" },
      { name: "Next.js" },
      { name: "Vite" },
      { name: "HTML" },
      { name: "CSS" },
      { name: "Tailwind CSS" },
      { name: "GSAP" },
      { name: "Lenis" },
      { name: "TipTap" },
      { name: "dnd-kit" },
      { name: "Radix UI" },
    ],
  },
  {
    title: "3D / Creative",
    items: [
      { name: "Three.js" },
      { name: "React Three Fiber" },
      { name: "WebGL" },
      { name: "GLSL" },
      { name: "p5.js" },
      { name: "Web Audio API" },
      { name: "Figma" },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "Node.js" },
      { name: "Express" },
      { name: "FastAPI", note: "production" },
      { name: "REST APIs" },
      { name: "WebSocket" },
      { name: "PostgreSQL" },
      { name: "Redis" },
      { name: "Supabase" },
      { name: "Firebase" },
      { name: "Prisma" },
      { name: "SQLAlchemy" },
      { name: "Alembic" },
    ],
  },
  {
    title: "Infrastructure / Tools",
    items: [
      { name: "Docker" },
      { name: "NGINX" },
      { name: "AWS S3" },
      { name: "Vercel" },
      { name: "Git" },
      { name: "GitHub" },
      { name: "Metabase" },
      { name: "Apache Airflow" },
      { name: "DBT" },
    ],
  },
  {
    title: "Other Languages",
    items: [
      { name: "Python", note: "FastAPI · Streamlit · DSP · data pipelines" },
      { name: "Ruby", note: "Rack · WebSocket · LLM integration" },
      { name: "C++", note: "ESP32 embedded audio" },
    ],
  },
];
