import { createFileRoute, Link } from "@tanstack/react-router";
import { courses, courseBySlug, KIND_LABEL, MATCH_LABEL } from "@/data/catalog";
import { COURSE_HOURS_MAX, COURSE_HOURS_MIN } from "@/data/degree";
import { foundationsFor } from "@/data/foundations";
import { lecturesFor } from "@/data/lectures";
import { External } from "@/components/external";
import { LectureSet } from "@/components/lectures";
import { planSlugs, usePlan } from "@/lib/progress";

export const Route = createFileRoute("/course/$slug")({
  component: CoursePage,
  head: ({ params }) => {
    const course = courseBySlug.get(params.slug);
    const title = course ? `${course.code} ${course.title} · Field Hours` : "Course · Field Hours";
    return { meta: [{ title }] };
  },
});

function CoursePage() {
  const { slug } = Route.useParams();
  const course = courseBySlug.get(slug);
  const trackId = usePlan((state) => state.trackId);
  const custom = usePlan((state) => state.custom);
  const done = usePlan((state) => state.done);
  const toggleDone = usePlan((state) => state.toggleDone);
  const addCourse = usePlan((state) => state.addCourse);
  const removeCourse = usePlan((state) => state.removeCourse);
  const onPlan = planSlugs(trackId, custom).includes(slug);

  if (!course) {
    return (
      <div>
        <h1 className="text-4xl text-ink">Not in the bulletin.</h1>
        <p className="mt-3 text-muted">That number is not one of the CSCE courses loaded here.</p>
        <Link to="/catalog" className="mt-4 inline-flex h-11 items-center text-teal underline">
          Back to the catalog
        </Link>
      </div>
    );
  }

  const siblings = courses.filter((item) => Boolean(item.foundation) === Boolean(course.foundation));
  const siblingIndex = siblings.findIndex((item) => item.slug === course.slug);
  const previous = siblings[siblingIndex - 1];
  const next = siblings[siblingIndex + 1];
  const lectures = lecturesFor(course.slug);
  const earlier = foundationsFor(course.slug);
  const prepares = (course.prepares ?? [])
    .map((slug) => courseBySlug.get(slug))
    .filter((item) => item !== undefined);

  return (
    <article>
      <p className="text-xs tracking-widest text-teal uppercase">
        {course.foundation ? "Undergraduate prerequisite · not one of the 36 credits · " : ""}
        {course.code} · {course.credits} credits{course.foundation ? "" : ` · ${MATCH_LABEL[course.match]}`}
      </p>
      <h1 className="mt-2 max-w-3xl text-4xl text-ink sm:text-6xl">{course.title}</h1>
      <p className="mt-6 max-w-2xl text-lg text-ink">{course.blurb}</p>
      <p className="mt-3 max-w-2xl text-sm text-muted">Prerequisite, as catalogued: {course.prereq}</p>
      {course.foundation ? (
        <p className="mt-2 max-w-2xl text-sm text-ink">
          About {course.hours} hours of notes and problems. These hours sit outside the master’s 1,080–1,200. Finishing this course does not add a credit to the ten.
        </p>
      ) : course.hours > 0 ? (
        <p className="mt-2 max-w-2xl text-sm text-ink">
          This course is {course.hours} hours, inside the {COURSE_HOURS_MIN}–{COURSE_HOURS_MAX} hours each of the ten must take. The capstone is separate.
        </p>
      ) : null}

      {earlier.length > 0 ? (
        <section className="mt-6 max-w-2xl">
          <h2 className="text-xl text-ink">Take these first</h2>
          <p className="mt-2 text-sm text-muted">
            Undergraduate preparation. Not counted inside the 36 credits. Where the catalog says “or,” one of the named courses is enough.
          </p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {earlier.map((item) => (
              <li key={item.slug} className="py-3">
                <Link to="/course/$slug" params={{ slug: item.slug }} className="text-ink hover:text-teal">
                  {item.code}
                  <span className="text-muted"> — </span>
                  {item.title}
                </Link>
                <p className="text-sm text-muted">{item.why}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {prepares.length > 0 ? (
        <section className="mt-6 max-w-2xl">
          <h2 className="text-xl text-ink">Opens these courses</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {prepares.map((item) => (
              <li key={item.slug} className="py-3">
                <Link to="/course/$slug" params={{ slug: item.slug }} className="text-ink hover:text-teal">
                  {item.code}
                  <span className="text-muted"> — </span>
                  {item.title}
                </Link>
                {item.foundation ? <p className="text-sm text-muted">Also a prerequisite, not a master’s credit.</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggleDone(course.slug)}
          className={
            "h-11 px-4 text-sm " + (done[course.slug] ? "bg-teal text-paper" : "border border-line text-ink hover:bg-teal-soft")
          }
        >
          {done[course.slug] ? "Marked done" : "Mark done"}
        </button>
        {course.foundation ? null : onPlan ? (
          <button
            type="button"
            onClick={() => removeCourse(course.slug)}
            className="h-11 border border-line px-4 text-sm text-ink hover:bg-teal-soft"
          >
            Remove from my plan
          </button>
        ) : (
          <button
            type="button"
            onClick={() => addCourse(course.slug)}
            className="h-11 border border-line px-4 text-sm text-ink hover:bg-teal-soft"
          >
            Add to my plan
          </button>
        )}
        {course.foundation ? (
          <Link to="/prerequisites" className="inline-flex h-11 items-center px-3 text-sm text-teal underline">
            All prerequisites
          </Link>
        ) : (
          <Link to="/plan" className="inline-flex h-11 items-center px-3 text-sm text-teal underline">
            View my plan
          </Link>
        )}
      </div>

      {lectures.length > 0 ? <LectureSet slug={course.slug} code={course.code} lectures={lectures} /> : null}

      {course.resources.length > 0 ? (
        <>
          <section className="mt-10">
            <h2 className="text-2xl text-ink">{lectures.length > 0 ? "Other public courses" : "Why this path"}</h2>
            <p className="mt-3 max-w-2xl text-sm text-ink">{lectures.length > 0 ? "These are someone else’s lectures. Use them only if you want a second explanation. The notes above are the ones that live on this site." : course.why}</p>
            {lectures.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                About {course.hours} hours if you do the labs. Coursera and edX certificates cost money; the lectures are usually free to audit.
              </p>
            ) : null}
          </section>

          <section className="mt-10">
            <h2 className="text-2xl text-ink">{lectures.length > 0 ? "Optional outside links" : "Do these in order"}</h2>
            <ol className="mt-4 divide-y divide-line border-y border-line">
              {course.resources.map((resource, position) => (
                <li key={resource.url + resource.title} className="grid gap-2 py-4 sm:grid-cols-12">
                  <span className="font-display text-xl text-brass sm:col-span-1">{String(position + 1).padStart(2, "0")}</span>
                  <div className="sm:col-span-11">
                    <p className="text-xs tracking-widest text-muted uppercase">{KIND_LABEL[resource.kind]} · {resource.source}</p>
                    <p className="mt-1 text-lg text-ink">
                      <External href={resource.url}>{resource.title}</External>
                    </p>
                    <p className="mt-1 text-sm text-muted">{resource.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : (
        <p className="mt-10 max-w-2xl text-sm text-ink">{course.why}</p>
      )}

      <nav className="mt-10 flex flex-wrap justify-between gap-4 text-sm" aria-label="Nearby catalog entries">
        {previous ? (
          <Link to="/course/$slug" params={{ slug: previous.slug }} className="text-teal underline">
            {previous.code}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/course/$slug" params={{ slug: next.slug }} className="text-teal underline">
            {next.code}
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
