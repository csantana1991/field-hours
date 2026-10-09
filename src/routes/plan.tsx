import { createFileRoute, Link } from "@tanstack/react-router";
import { courseBySlug, courses } from "@/data/catalog";
import { CAPSTONE_CREDITS, CAPSTONE_HOURS, DEGREE_CREDITS, HOURS_MAX, HOURS_MIN } from "@/data/degree";
import { trackById, tracks } from "@/data/tracks";
import { planSlugs, usePlan } from "@/lib/progress";
import { useState } from "react";

export const Route = createFileRoute("/plan")({
  component: PlanPage,
  head: () => ({ meta: [{ title: "My plan · Field Hours" }] }),
});

function PlanPage() {
  const trackId = usePlan((state) => state.trackId);
  const custom = usePlan((state) => state.custom);
  const done = usePlan((state) => state.done);
  const setTrack = usePlan((state) => state.setTrack);
  const toggleDone = usePlan((state) => state.toggleDone);
  const addCourse = usePlan((state) => state.addCourse);
  const removeCourse = usePlan((state) => state.removeCourse);
  const reset = usePlan((state) => state.reset);
  const [addSlug, setAddSlug] = useState(courses[0]?.slug ?? "");

  const slugs = planSlugs(trackId, custom);
  const planCourses = slugs.map((slug) => courseBySlug.get(slug)).filter((course) => course !== undefined);
  const credits = planCourses.reduce((sum, course) => sum + (done[course.slug] ? course.creditValue : 0), 0);
  const listed = planCourses.reduce((sum, course) => sum + course.creditValue, 0);
  const hours = planCourses.reduce((sum, course) => sum + course.hours, 0) + CAPSTONE_HOURS;
  const track = trackById(trackId);
  const options = courses.filter((course) => !slugs.includes(course.slug) && course.creditValue > 0);

  return (
    <div>
      <p className="text-xs tracking-widest text-muted uppercase">{custom ? "Custom" : track.name}</p>
      <h1 className="mt-2 text-5xl text-ink">My plan</h1>
      <p className="mt-4 max-w-2xl text-ink">
        {credits} course credits marked done, of {listed} listed, plus the {CAPSTONE_CREDITS}-credit capstone. The degree is {DEGREE_CREDITS} credits and {hours.toLocaleString()} hours. The equivalent is only inside {HOURS_MIN.toLocaleString()}–{HOURS_MAX.toLocaleString()}, which this plan meets when you do every hour, including the {CAPSTONE_HOURS} on the capstone.
      </p>

      <div className="mt-6 h-2 w-full bg-line" aria-hidden>
        <div className="h-2 bg-teal" style={{ width: `${Math.min(100, (credits / (DEGREE_CREDITS - CAPSTONE_CREDITS)) * 100)}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {Math.min(DEGREE_CREDITS - CAPSTONE_CREDITS, credits)} / {DEGREE_CREDITS - CAPSTONE_CREDITS} course credits. The capstone is the other {CAPSTONE_CREDITS}, after the hours are done.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm text-ink">
          Printed plan
          <select
            value={trackId}
            onChange={(event) => setTrack(event.target.value)}
            className="mt-1 h-11 w-full border border-line bg-card px-3 text-ink"
          >
            {tracks.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={reset} className="h-11 border border-line px-4 text-sm text-ink hover:bg-teal-soft">
          Clear checks and edits
        </button>
      </div>

      <ol className="mt-8 divide-y divide-line border-y border-line">
        {planCourses.map((course, index) => (
          <li key={course.slug} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={Boolean(done[course.slug])}
                onChange={() => toggleDone(course.slug)}
                className="mt-1 size-5 accent-teal"
              />
              <span>
                <span className="font-display text-lg text-brass">{String(index + 1).padStart(2, "0")}</span>{" "}
                <Link to="/course/$slug" params={{ slug: course.slug }} className="text-ink hover:text-teal">
                  {course.code} {course.title}
                </Link>
                <span className="mt-1 block text-sm text-muted">
                  {course.creditValue} credits · {course.hours} hours
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={() => removeCourse(course.slug)}
              className="h-11 self-start px-3 text-sm text-muted underline hover:text-ink"
            >
              Remove
            </button>
          </li>
        ))}
      </ol>

      <form
        className="mt-8 flex flex-col gap-3 border border-line bg-card p-4 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          if (addSlug) addCourse(addSlug);
        }}
      >
        <label className="block flex-1 text-sm text-ink">
          Add a catalog course
          <select
            value={addSlug}
            onChange={(event) => setAddSlug(event.target.value)}
            className="mt-1 h-11 w-full border border-line bg-paper px-3 text-ink"
          >
            {options.map((course) => (
              <option key={course.slug} value={course.slug}>
                {course.code} {course.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-11 bg-teal px-4 text-sm text-paper">
          Add
        </button>
      </form>
      <p className="mt-3 text-sm text-muted">
        Adding turns this into your list. Seminar, internship, and research numbers are left out of the menu because they are not lecture credits. They remain in the catalog.
      </p>
    </div>
  );
}
