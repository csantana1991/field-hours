/** 36-credit master's equivalent. Ten 3-credit courses plus a 6-credit capstone. */

export const DEGREE_CREDITS = 36;
export const COURSE_COUNT = 10;
export const COURSE_CREDITS = 3;
export const CAPSTONE_CREDITS = 6;

/** 30–33 hours of work per credit is 1,080–1,200 hours. The capstone is fixed at 200, so each course is 88–100. */
export const HOURS_MIN = 1080;
export const HOURS_MAX = 1200;
export const COURSE_HOURS_MIN = 88;
export const COURSE_HOURS_MAX = 100;
export const CAPSTONE_HOURS = 200;

export const phases = [
  {
    id: "spec",
    hours: 20,
    title: "Specification and tests",
    body: "Write what the system must do, in sentences a stranger can check. Name the success criteria. Write the tests that fail today. Twenty hours is the spec and the tests, not the code that will pass them.",
  },
  {
    id: "data",
    hours: 40,
    title: "The records",
    body: "A schema in third normal form or a written reason it is not. Indexes you can justify with a cost. One transaction that stays correct if the process dies after a commit and before the reply.",
  },
  {
    id: "algorithm",
    hours: 30,
    title: "One algorithm you can account for",
    body: "Scheduling, search, or a similar routine that the product actually calls. Measure it on two sizes. You should be able to say why the time grew the way it did. A library call you cannot explain does not count.",
  },
  {
    id: "machine",
    hours: 25,
    title: "The process and the crash",
    body: "A boundary between processes or threads, one lock you can justify, and a crash you can reproduce: killed after a write, or a file left half-updated. Show the recovery, not a screenshot of a happy path.",
  },
  {
    id: "network",
    hours: 25,
    title: "Two machines and a lost packet",
    body: "A client and a server. Drop a message. The retry must not create a second committed record. Timeouts are part of the design, not an error you print and ignore.",
  },
  {
    id: "model",
    hours: 20,
    title: "One decision that was learned or derived",
    body: "A prediction, a ranking, or a search policy. Hold out data you did not fit. Report the number that would embarrass you, not only the number that looks good.",
  },
  {
    id: "attack",
    hours: 20,
    title: "One attack and the fix",
    body: "A threat model in a page. Then one attack that works against your build: injection, a missing check, a secret in the wrong place. A test that failed before the fix and passes after it.",
  },
  {
    id: "person",
    hours: 20,
    title: "A person who is not you",
    body: "Five tasks, timed, with someone who did not write the system. Change one thing because of what they did. Write what you refused to change, and why.",
  },
] as const;

export type PhaseId = (typeof phases)[number]["id"];

export function clampCourseHours(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(COURSE_HOURS_MAX, Math.round(value)));
}

export function clampPhaseHours(id: PhaseId, value: number): number {
  const phase = phases.find((item) => item.id === id);
  const cap = phase?.hours ?? 0;
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(cap, Math.round(value)));
}

export function tally(slugs: string[], courseHours: Record<string, number>, phaseHours: Record<string, number>) {
  const rows = slugs.map((slug) => {
    const logged = courseHours[slug] ?? 0;
    return {
      slug,
      logged,
      inBand: logged >= COURSE_HOURS_MIN && logged <= COURSE_HOURS_MAX,
    };
  });
  const courseSum = rows.reduce((sum, row) => sum + row.logged, 0);
  const phaseRows = phases.map((phase) => ({
    ...phase,
    logged: phaseHours[phase.id] ?? 0,
    done: (phaseHours[phase.id] ?? 0) >= phase.hours,
  }));
  const capstone = phaseRows.reduce((sum, phase) => sum + phase.logged, 0);
  const total = courseSum + capstone;
  const ten = slugs.length === COURSE_COUNT;
  const coursesReady = ten && rows.every((row) => row.inBand);
  const capstoneReady = capstone === CAPSTONE_HOURS && phaseRows.every((phase) => phase.done);
  const complete = coursesReady && capstoneReady && total >= HOURS_MIN && total <= HOURS_MAX;
  return { rows, phaseRows, courseSum, capstone, total, ten, coursesReady, capstoneReady, complete };
}
