/**
 * Realm sample data and helpers.
 *
 * Static realm definitions for Phase 2 frontend previews.
 * Will be replaced by API calls once the backend realm endpoints are built.
 */

import type { Realm } from "@dreamrealm/types";

export const SAMPLE_REALMS: Realm[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    slug: "temple-of-thoughts",
    name: "The Temple of Thoughts",
    description:
      "A quiet sanctuary for deep conversations, philosophical debates, and meaningful connection through ideas. Leave small talk at the door.",
    category: "Intellectual",
    image_url: null,
    status: "active",
    member_count: 12480,
    is_featured: true,
    is_joined: false,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2025-05-10T00:00:00Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    slug: "cupids-corner",
    name: "Cupid's Corner",
    description:
      "The heart of DreamRealm dating. Browse, match, and spark romance in a space designed for genuine connections.",
    category: "Dating",
    image_url: null,
    status: "active",
    member_count: 89340,
    is_featured: true,
    is_joined: false,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2025-05-12T00:00:00Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    slug: "creators-market",
    name: "The Creator's Market",
    description:
      "A bustling bazaar of creative minds. Share your art, discover collaborators, and monetize your passion with DreamCoin.",
    category: "Creative",
    image_url: null,
    status: "active",
    member_count: 34200,
    is_featured: true,
    is_joined: false,
    created_at: "2024-03-10T00:00:00Z",
    updated_at: "2025-05-11T00:00:00Z",
  },
  {
    id: "d4e5f6a7-b8c9-0123-def1-234567890123",
    slug: "dating-dreamer-lounge",
    name: "Dating Dreamer Lounge",
    description:
      "A relaxed lounge for dreamers and romantics. Share stories, plan dates, and find your kindred spirit in a laid-back atmosphere.",
    category: "Dating",
    image_url: null,
    status: "active",
    member_count: 56700,
    is_featured: false,
    is_joined: false,
    created_at: "2024-04-05T00:00:00Z",
    updated_at: "2025-05-09T00:00:00Z",
  },
  {
    id: "e5f6a7b8-c9d0-1234-ef12-345678901234",
    slug: "afterdark-realm",
    name: "The AfterDark Realm",
    description:
      "For the night owls and the bold. A space for mature conversations, late-night streams, and electrifying encounters after sunset.",
    category: "Social",
    image_url: null,
    status: "active",
    member_count: 21500,
    is_featured: false,
    is_joined: false,
    created_at: "2024-05-20T00:00:00Z",
    updated_at: "2025-05-13T00:00:00Z",
  },
  {
    id: "f6a7b8c9-d0e1-2345-f123-456789012345",
    slug: "business-builder-realm",
    name: "Business Builder Realm",
    description:
      "Connect with founders, investors, and professionals. Pitch ideas, find co-founders, and grow your empire within the Dreamcadian ecosystem.",
    category: "Business",
    image_url: null,
    status: "beta",
    member_count: 8700,
    is_featured: false,
    is_joined: false,
    created_at: "2024-06-15T00:00:00Z",
    updated_at: "2025-05-08T00:00:00Z",
  },
];

export function getRealmBySlug(slug: string): Realm | undefined {
  return SAMPLE_REALMS.find((r) => r.slug === slug);
}

export function getRealmsByCategory(category: string): Realm[] {
  return SAMPLE_REALMS.filter((r) => r.category === category);
}

export function getFeaturedRealms(): Realm[] {
  return SAMPLE_REALMS.filter((r) => r.is_featured);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(SAMPLE_REALMS.map((r) => r.category)));
}
