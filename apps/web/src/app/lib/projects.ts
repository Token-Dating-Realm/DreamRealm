/**
 * Dreamcadian ecosystem project data.
 *
 * Static project definitions for Phase 3 frontend previews.
 */

export type ProjectStatus = "active" | "beta" | "coming_soon";

export interface DreamcadianProject {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: ProjectStatus;
  color: string;
  url: string | null;
}

export const DREAMCADIAN_PROJECTS: DreamcadianProject[] = [
  {
    id: "proj-001",
    name: "DreamRealm",
    tagline: "Your digital world for connection",
    description: "The flagship social ecosystem. Realms, dating, creators, streams, events, and DreamCoin — all in one immersive platform.",
    category: "Social",
    status: "active",
    color: "purple",
    url: "https://dreamrealm.app",
  },
  {
    id: "proj-002",
    name: "DatingDreamer",
    tagline: "Find your kindred spirit",
    description: "Advanced matchmaking with AI-assisted compatibility scoring, video dates, and realm-based dating experiences.",
    category: "Dating",
    status: "beta",
    color: "pink",
    url: null,
  },
  {
    id: "proj-003",
    name: "Cupid's Adult Toys",
    tagline: "Premium intimacy products",
    description: "Curated adult wellness and intimacy marketplace with discreet shipping, expert reviews, and DreamCoin rewards.",
    category: "Wellness",
    status: "coming_soon",
    color: "red",
    url: null,
  },
  {
    id: "proj-004",
    name: "Dreamcadian Classifieds",
    tagline: "Buy, sell, and trade in the ecosystem",
    description: "A secure marketplace powered by DreamCoin. From creative services to real estate — all within the Dreamcadian trust network.",
    category: "Commerce",
    status: "beta",
    color: "green",
    url: null,
  },
  {
    id: "proj-005",
    name: "Creator Marketplace",
    tagline: "Monetize your creativity",
    description: "Where creators sell art, music, services, and experiences. Tip with DreamCoin, subscribe to exclusive content, and build your fanbase.",
    category: "Creative",
    status: "active",
    color: "orange",
    url: null,
  },
  {
    id: "proj-006",
    name: "The Temple of Thoughts",
    tagline: "Intellectual sanctuary",
    description: "A quiet sanctuary for deep conversations, philosophical debates, and meaningful connection through ideas and knowledge sharing.",
    category: "Intellectual",
    status: "active",
    color: "indigo",
    url: null,
  },
  {
    id: "proj-007",
    name: "Business Builder Tools",
    tagline: "Tools for entrepreneurs",
    description: "Connect with founders, investors, and professionals. Pitch ideas, find co-founders, and grow your empire within the Dreamcadian ecosystem.",
    category: "Business",
    status: "beta",
    color: "blue",
    url: null,
  },
];

export function getAllProjects(): DreamcadianProject[] {
  return DREAMCADIAN_PROJECTS;
}

export function getProjectById(id: string): DreamcadianProject | undefined {
  return DREAMCADIAN_PROJECTS.find((p) => p.id === id);
}

export function getProjectsByStatus(status: ProjectStatus): DreamcadianProject[] {
  return DREAMCADIAN_PROJECTS.filter((p) => p.status === status);
}

export function getProjectsByCategory(category: string): DreamcadianProject[] {
  return DREAMCADIAN_PROJECTS.filter((p) => p.category === category);
}
