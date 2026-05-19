/**
 * Dreamcadian Hub Page
 *
 * Central overview of the Dreamcadian ecosystem. Lists DreamRealm and
 * future Dreamcadian properties as project cards.
 */

"use client";

import AppShell from "../components/AppShell";
import ProjectCard from "../components/ProjectCard";

const PROJECTS = [
  {
    name: "DreamRealm",
    tagline: "Your digital world for connection",
    description:
      "The flagship social ecosystem. Realms, dating, creators, streams, events, and DreamCoin — all in one immersive platform.",
    status: "live" as const,
    color: "purple",
    url: "https://dreamrealm.app",
  },
  {
    name: "Dreamcadian Classifieds",
    tagline: "Buy, sell, and trade in the ecosystem",
    description:
      "A secure marketplace powered by DreamCoin. From creative services to real estate — all within the Dreamcadian trust network.",
    status: "beta" as const,
    color: "green",
  },
  {
    name: "Dreamcadian Stories",
    tagline: "Immersive storytelling network",
    description:
      "Where creators publish serialized worlds, readers subscribe with DreamCoin, and communities form around narratives.",
    status: "coming_soon" as const,
    color: "pink",
  },
  {
    name: "Dreamcadian Studios",
    tagline: "Production and talent hub",
    description:
      "Connect projects with talent. Casting, crew, production management, and funding — all on-chain tracked for transparency.",
    status: "coming_soon" as const,
    color: "blue",
  },
  {
    name: "Dreamcadian Foundation",
    tagline: "The governing layer",
    description:
      "Token governance, treasury, grants, and community proposals. The decentralized backbone of the entire ecosystem.",
    status: "coming_soon" as const,
    color: "orange",
  },
];

export default function HubPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-bold text-glow">Dreamcadian Hub</h1>
          <p className="mx-auto max-w-2xl text-text-muted">
            DreamRealm is one star in a constellation. The Dreamcadian ecosystem connects
            communities, commerce, stories, and creation into a unified digital world.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.name} {...project} />
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-text">DreamCoin Powers Everything</h2>
          <p className="mx-auto max-w-lg text-sm text-text-muted">
            One token across all properties. Tip creators, unlock content, subscribe to
            stories, and trade in the marketplace. DreamCoin is the lifeblood of the ecosystem.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
