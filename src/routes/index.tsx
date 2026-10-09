import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { courseBySlug, courses, MATCH_LABEL } from "@/data/catalog";
import { CAPSTONE_HOURS, DEGREE_CREDITS, HOURS_MAX, HOURS_MIN } from "@/data/degree";
import { trackById, tracks } from "@/data/tracks";
import { planSlugs, usePlan } from "@/lib/progress";

export const Route = createFileRoute("/")({ component: Home });

const RULES = [
  {
    n: "01",
    title: "Thirty-six credits",
    body: "Ten courses at three credits, plus a six-credit capstone. That is 36 credits. The work is 1,080 to 1,200 hours: 88 to 100 hours on each course, and 200 hours on the capstone.",
  },
  {
    n: "02",
    title: "One field",
    body: "The catalog says most of the time goes to one or two related fields, with the rest in support. A sampler of unrelated electives is not a master’s.",
  },
  {
    n: "03",
    title: "Hours mean the work",
    body: "A course counts only if you spend its full hours on the notes, the problems, and the labs. Watching the opening video is not the course.",
  },
  {
    n: "04",
    title: "No diploma",
    body: "You will have the study. You will not have a university transcript or a degree. The capstone is part of the hours. It is not a thesis defense.",
  },
];

function Home() {
  const trackId = usePlan((state) => state.trackId);
  const custom = usePlan((state) => state.custom);
  const done = usePlan((state) => state.done);
  const setTrack = usePlan((state) => state.setTrack);
  const track = trackById(trackId);
  const slugs = planSlugs(trackId, custom);
  const [hoursPerWeek, setHoursPerWeek] = useState(25);

  const planCourses = slugs
    .map((slug) => courseBySlug.get(slug))
    .filter((course) => course !== undefined);
  const totalHours = planCourses.reduce((sum, course) => sum + course.hours, 0);
  const load = totalHours + CAPSTONE_HOURS;
  const weeks = Math.max(1, Math.round(load / hoursPerWeek));
  const doneCount = planCourses.filter((course) => done[course.slug]).length;
  const next = planCourses.find((course) => !done[course.slug]);
  const bridges = courses.filter((course) => course.bridge);

  return (
    <div className="flex flex-col gap-14">
      <section className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-xs tracking-widest text-teal uppercase">Self-directed computer science</p>
          <h1 className="mt-3 max-w-xl text-5xl text-ink sm:text-7xl">Thirty-six credits.</h1>
          <p className="mt-6 max-w-xl text-lg text-ink">
            Ten courses and a 200-hour capstone. {HOURS_MIN.toLocaleString()} to {HOURS_MAX.toLocaleString()} hours, which is the work in a 36-credit master’s. Same topics as the catalog. Not a degree.
          </p>
          <p className="mt-4 max-w-xl text-sm text-ink">
            The six-month calendar is the same ten courses, at the longer weekly hours.{" "}
            <Link to="/six-months" className="text-teal underline">
              Open the 26 weeks
            </Link>
            . It assumes the undergraduate prerequisites are already done. Those twelve courses, with their own lectures, live on the{" "}
            <Link to="/prerequisites" className="text-teal underline">
              prerequisites
            </Link>{" "}
            page and are not inside the 1,080 hours. The outside courses, from the A&M catalog through 6.824, are on the{" "}
            <Link to="/library" className="text-teal underline">
              library shelf
            </Link>
            .
          </p>
          <ol className="mt-8 divide-y divide-line border-y border-line">
            {RULES.map((rule) => (
              <li key={rule.n} className="grid grid-cols-12 gap-3 py-4">
                <span className="col-span-2 font-display text-xl text-brass sm:col-span-1">{rule.n}</span>
                <div className="col-span-10 sm:col-span-11">
                  <h2 className="text-xl text-ink">{rule.title}</h2>
                  <p className="mt-1 text-sm text-muted">{rule.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="border border-line bg-card p-5 lg:col-span-5">
          <h2 className="text-2xl text-ink">Choose the field</h2>
          <p className="mt-2 text-sm text-muted">
            Each plan is ten courses, {DEGREE_CREDITS - 6} credits, plus the {CAPSTONE_HOURS}-hour capstone. Switching fields resets a custom list. Your checkmarks stay.
          </p>
          <div className="mt-4 flex flex-col" role="listbox" aria-label="Degree plans">
            {tracks.map((item) => {
              const selected = item.id === trackId && !custom;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTrack(item.id)}
                  className={
                    "border-l-4 px-3 py-3 text-left " +
                    (selected ? "border-teal bg-teal-soft" : "border-transparent hover:bg-paper")
                  }
                  aria-pressed={selected}
                >
                  <span className="block text-sm text-ink">{item.name}</span>
                  <span className="block text-xs text-muted">{item.field}</span>
                </button>
              );
            })}
          </div>
          {custom ? (
            <p className="mt-4 text-sm text-ink">
              You are on a custom list, not the printed {track.name} plan.{" "}
              <button type="button" className="text-teal underline" onClick={() => setTrack(trackId)}>
                Restore {track.name}
              </button>
              .
            </p>
          ) : null}
        </aside>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-muted uppercase">{custom ? "Custom plan" : track.name}</p>
            <h2 className="mt-1 text-4xl text-ink">{custom ? "Your ten" : track.field}</h2>
          </div>
          <p className="text-sm text-muted">
            {doneCount} of {planCourses.length} marked done
          </p>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-muted">{custom ? "Edited from the bulletin. Keep it at ten courses. The capstone is still required." : track.summary}</p>
        <ol className="mt-6 divide-y divide-line border-y border-line">
          {planCourses.map((course, index) => (
            <li key={course.slug} className="grid gap-2 py-4 sm:grid-cols-12 sm:items-baseline sm:gap-4">
              <span className="font-display text-xl text-brass sm:col-span-1">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="sm:col-span-7">
                <Link to="/course/$slug" params={{ slug: course.slug }} className="text-lg text-ink hover:text-teal">
                  {course.code}
                  <span className="text-muted"> — </span>
                  {course.title}
                </Link>
                <p className="text-sm text-muted">{MATCH_LABEL[course.match]}</p>
              </div>
              <div className="sm:col-span-4 sm:text-right">
                <p className="text-sm text-ink">{course.hours} hours</p>
                {done[course.slug] ? <p className="text-xs tracking-widest text-teal uppercase">Done</p> : null}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-ink">
          Then the capstone: 6 credits, {CAPSTONE_HOURS} hours, after the ten. A plan is finished only when the courses and the capstone are both done.
        </p>
        {next ? (
          <p className="mt-4 text-sm text-ink">
            Next up:{" "}
            <Link to="/course/$slug" params={{ slug: next.slug }} className="text-teal underline">
              {next.code} {next.title}
            </Link>
            . Open the course page and start with the first link, not a highlight reel.
          </p>
        ) : (
          <p className="mt-4 text-sm text-ink">Every course on this plan is marked done. Read rule 04 again before you call it a degree.</p>
        )}
      </section>

      <section className="grid gap-8 border border-line bg-card p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <h2 className="text-2xl text-ink">Pace</h2>
          <p className="mt-2 text-sm text-muted">
            {load.toLocaleString()} hours on this plan, courses plus the capstone. The equivalent sits between {HOURS_MIN.toLocaleString()} and {HOURS_MAX.toLocaleString()}. At {hoursPerWeek} hours a week, about {weeks} weeks. That assumes you do the work, not only press play.
          </p>
          <label className="mt-4 block text-sm text-ink" htmlFor="pace">
            Hours each week: {hoursPerWeek}
          </label>
          <input
            id="pace"
            type="range"
            min={15}
            max={45}
            step={1}
            value={hoursPerWeek}
            onChange={(event) => setHoursPerWeek(Number(event.target.value))}
            className="mt-2 w-full accent-teal"
          />
        </div>
        <div>
          <h2 className="text-2xl text-ink">If you do not program yet</h2>
          <p className="mt-2 text-sm text-muted">
            CSCE 706, 708, and 709 are bridge courses for non-majors. They are real, and they are not part of the ten.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {bridges.map((course) => (
              <li key={course.slug}>
                <Link to="/course/$slug" params={{ slug: course.slug }} className="text-sm text-teal underline">
                  {course.code} {course.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
