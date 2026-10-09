import { moreLearning } from "./more-learning";
import { moreNetDb } from "./more-netdb";
import { moreOs } from "./more-os";
import { morePractice } from "./more-practice";
import { moreSystems } from "./more-systems";
import { moreTheory } from "./more-theory";
import { packs as restAiA } from "./rest/ai-a";
import { packs as restAiB } from "./rest/ai-b";
import { packs as restBridges } from "./rest/bridges";
import { packs as restDataIx } from "./rest/data-ix";
import { packs as restGraphics } from "./rest/graphics";
import { packs as restSecurityA } from "./rest/security-a";
import { packs as restSecurityB } from "./rest/security-b";
import { packs as restSystems } from "./rest/systems";
import { packs as restTheoryA } from "./rest/theory-a";
import { packs as restTheoryB } from "./rest/theory-b";
import { packs as practice } from "./practice";
import { prereqMore } from "./prereq-more";
import { prereqPacks } from "./prereq";
import { packs as systems } from "./systems";
import { packs as theory } from "./theory";
import type { CoursePack, Lecture } from "./types";

const extras = [...moreTheory, ...moreLearning, ...moreSystems, ...moreOs, ...moreNetDb, ...morePractice];

function withWeeks(packs: CoursePack[]): CoursePack[] {
  return packs.map((pack) => {
    const more = extras.find((item) => item.slug === pack.slug);
    if (!more) return pack;
    return { slug: pack.slug, lectures: [...pack.lectures, ...more.lectures] };
  });
}

export const coursePacks: CoursePack[] = [
  ...withWeeks([...theory, ...systems, ...practice]),
  ...prereqPacks,
  ...prereqMore,
  ...restSystems,
  ...restTheoryA,
  ...restTheoryB,
  ...restAiA,
  ...restAiB,
  ...restGraphics,
  ...restDataIx,
  ...restSecurityA,
  ...restSecurityB,
  ...restBridges,
];

const bySlug = new Map(coursePacks.map((pack) => [pack.slug, pack]));

export function packFor(slug: string): CoursePack | undefined {
  return bySlug.get(slug);
}

export function lecturesFor(slug: string): Lecture[] {
  return bySlug.get(slug)?.lectures ?? [];
}

export const VIDEO_SLUGS = [
  "csce-629",
  "csce-614",
  "csce-611",
  "csce-612",
  "csce-608",
  "csce-625",
  "csce-633",
  "csce-606",
  "csce-701",
  "csce-655",
] as const;
