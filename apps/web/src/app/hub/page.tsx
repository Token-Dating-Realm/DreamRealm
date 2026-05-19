/**
 * Dreamcadian Hub Page
 *
 * Central overview of the Dreamcadian ecosystem. Lists DreamRealm and
 * future Dreamcadian properties as project cards.
 */

"use client";

import AppShell from "../components/AppShell";
import ProjectCard from "../components/ProjectCard";
import FilterTabs from "../components/FilterTabs";
import { useState } from "react";
import { DREAMCADIAN_PROJECTS, type ProjectStatus } from "../lib/projects";

const STATUS_ORDER: Record<ProjectStatus, number> = {
  active: 0,
  beta: 1,
  coming_soon: 2,
};

export default function HubPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const statusOptions = ["Active", "Beta", "Coming Soon"];

  const filtered = DREAMCADIAN_PROJECTS.filter((p) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Active" && p.status === "active") return true;
    if (activeFilter === "Beta" && p.status === "beta") return true;
    if (activeFilter === "Coming Soon" && p.status === "coming_soon") return true;
    return false;
  }).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

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

        <div className="mb-8 flex justify-center">
          <FilterTabs
            options={statusOptions}
            active={activeFilter}
            onSelect={setActiveFilter}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              tagline={project.tagline}
              description={project.description}
              status={project.status}
              color={project.color}
              url={project.url ?? undefined}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-text">No projects match this filter.</p>
          </div>
        )}

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
