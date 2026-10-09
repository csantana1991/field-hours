import { courseBySlug } from "@/data/catalog";

export type Track = {
  id: string;
  name: string;
  field: string;
  summary: string;
  courses: string[];
};

export const tracks: Track[] = [
  {
    id: "general",
    name: "Professional",
    field: "One field, with support",
    summary: "The shape of the non-thesis Master of Computer Science: algorithms, the four systems courses, then one intelligent system, one engineering course, one security course, and one human course.",
    courses: [
      "csce-629",
      "csce-611",
      "csce-614",
      "csce-612",
      "csce-608",
      "csce-625",
      "csce-633",
      "csce-606",
      "csce-701",
      "csce-655",
    ],
  },
  {
    id: "intelligence",
    name: "Machine intelligence",
    field: "Learning and language",
    summary: "Algorithms, then the intelligence sequence: classical AI, statistical learning, deep models, language, reinforcement, data mining, pattern analysis, agents, and vision.",
    courses: [
      "csce-629",
      "csce-625",
      "csce-633",
      "csce-636",
      "csce-638",
      "csce-642",
      "csce-676",
      "csce-666",
      "csce-631",
      "csce-753",
    ],
  },
  {
    id: "systems",
    name: "Systems",
    field: "Machines and the network",
    summary: "Algorithms plus the stack: operating systems, architecture, networks, databases, distributed systems, parallel programming, reverse engineering, supercomputing, and compilers.",
    courses: [
      "csce-629",
      "csce-611",
      "csce-614",
      "csce-612",
      "csce-608",
      "csce-678",
      "csce-735",
      "csce-652",
      "csce-654",
      "csce-605",
    ],
  },
  {
    id: "security",
    name: "Security",
    field: "Definitions, then attacks",
    summary: "Algorithms, a foundations survey, modern cryptography, software security, network security, forensics, blockchains, advanced network attacks, authentication, and applied cryptography.",
    courses: [
      "csce-629",
      "csce-701",
      "csce-711",
      "csce-713",
      "csce-765",
      "csce-712",
      "csce-716",
      "csce-665",
      "csce-715",
      "csce-749",
    ],
  },
  {
    id: "theory",
    name: "Theory",
    field: "Proofs and limits",
    summary: "Algorithms, computability, complexity, randomness, quantum algorithms, combinatorial optimization, algorithmic game theory, distributed algorithms, geometry, and big-data algorithms.",
    courses: [
      "csce-629",
      "csce-627",
      "csce-637",
      "csce-658",
      "csce-640",
      "csce-669",
      "csce-717",
      "csce-668",
      "csce-620",
      "csce-727",
    ],
  },
  {
    id: "data",
    name: "Data",
    field: "Storage, search, and models",
    summary: "Algorithms, database internals, retrieval, mining, visualization, learning, deep learning, language, sketching, and statistical pattern analysis.",
    courses: [
      "csce-629",
      "csce-608",
      "csce-670",
      "csce-676",
      "csce-679",
      "csce-633",
      "csce-636",
      "csce-638",
      "csce-727",
      "csce-666",
    ],
  },
  {
    id: "image",
    name: "Image and interaction",
    field: "Pictures, interfaces, space",
    summary: "Graphics, digital images, image synthesis, visualization, computational photography, virtual reality, human-centered computing, interaction theory, geometric modeling, and vision.",
    courses: [
      "csce-641",
      "csce-646",
      "csce-647",
      "csce-679",
      "csce-748",
      "csce-650",
      "csce-655",
      "csce-671",
      "csce-645",
      "csce-753",
    ],
  },
];

for (const track of tracks) {
  if (track.courses.length !== 10) {
    throw new Error(`${track.id} should list 10 courses`);
  }
  for (const slug of track.courses) {
    const course = courseBySlug.get(slug);
    if (!course) throw new Error(`Missing course ${slug} in ${track.id}`);
    if (course.creditValue !== 3) throw new Error(`${slug} is not a 3-credit lecture`);
  }
}

export function trackById(id: string): Track {
  return tracks.find((track) => track.id === id) ?? tracks[0];
}
