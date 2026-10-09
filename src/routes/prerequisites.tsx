import { createFileRoute, Link } from "@tanstack/react-router";
import { courseBySlug } from "@/data/catalog";
import { foundationCourses, foundationsFor } from "@/data/foundations";
import { trackById } from "@/data/tracks";

export const Route = createFileRoute("/prerequisites")({
  component: Prerequisites,
  head: () => ({ meta: [{ title: "Prerequisites · Field Hours" }] }),
});

const CAVEAT: Record<string, string> = {
  "csce-629": "The catalog line says graduate classification. The preparation is data structures, discrete math, and the undergraduate algorithms course.",
  "csce-611": "The catalog names CSCE 313. Data structures and computer organization come before that.",
  "csce-614": "The catalog accepts CSCE 312 or CSCE 350. Take 312 if you have never built a datapath. One of them is enough.",
  "csce-612": "Only one of CSCE 463 and CSCE 612 counts toward a degree. Here 463 is preparation, outside the 36, and 612 is the master’s course.",
  "csce-608": "The catalog names CSCE 310. Do not also count 310 as a master’s database course. CSCE 221 comes before it.",
  "csce-625": "The catalog names CSCE 411. Data structures and discrete math come before 411.",
  "csce-633": "The catalog accepts CSCE 420 or CSCE 625. If 625 is already one of your ten, you can skip 420.",
  "csce-606": "The catalog names CSCE 431.",
  "csce-701": "The catalog line says graduate classification. Take the systems introduction and the undergraduate security course first.",
  "csce-655": "The catalog also names CSCE 444. This site teaches that preparation as CSCE 436. Take one, not both.",
};

function Prerequisites() {
  const plan = trackById("general").courses
    .map((slug) => courseBySlug.get(slug))
    .filter((course) => course !== undefined);

  return (
    <div>
      <p className="text-xs tracking-widest text-muted uppercase">Before the ten</p>
      <h1 className="mt-2 text-5xl text-ink">Prerequisites.</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink">
        Twelve undergraduate courses the professional master’s plan assumes. Six lectures each, with a video, notes, and problems. About 60 hours apiece. None of those hours sit inside the 1,080–1,200.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Start with data structures and discrete math if those are new. The six-month calendar does not include this work. A course you have already taken is a course you can mark done and skip.
      </p>

      <section className="mt-12">
        <h2 className="text-3xl text-ink">Before each master’s course</h2>
        <ol className="mt-6 divide-y divide-line border-y border-line">
          {plan.map((course) => {
            const prep = foundationsFor(course.slug);
            return (
              <li key={course.slug} className="grid gap-3 py-5 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <Link to="/course/$slug" params={{ slug: course.slug }} className="text-lg text-ink hover:text-teal">
                    {course.code}
                    <span className="text-muted"> — </span>
                    {course.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{course.prereq}</p>
                </div>
                <div className="sm:col-span-7">
                  <ul className="flex flex-col gap-2">
                    {prep.map((item) => (
                      <li key={item.slug}>
                        <Link to="/course/$slug" params={{ slug: item.slug }} className="text-ink hover:text-teal">
                          {item.code} {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {CAVEAT[course.slug] ? <p className="mt-2 text-sm text-muted">{CAVEAT[course.slug]}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl text-ink">The twelve</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          {foundationCourses.length} courses, {foundationCourses.length * 60} hours if you do every one. Most plans need a subset. Where two courses say “or,” do not take both unless you want the extra practice.
        </p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {foundationCourses.map((course) => (
            <li key={course.slug} className="grid gap-2 py-4 sm:grid-cols-12">
              <div className="sm:col-span-8">
                <Link to="/course/$slug" params={{ slug: course.slug }} className="text-lg text-ink hover:text-teal">
                  <span className="text-teal">{course.code}</span>
                  <span> {course.title}</span>
                </Link>
                <p className="mt-1 text-sm text-muted">{course.blurb}</p>
              </div>
              <p className="text-sm text-ink sm:col-span-4 sm:text-right">{course.hours} hours · 6 lectures</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
