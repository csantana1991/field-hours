import { createFileRoute, Link } from "@tanstack/react-router";
import { courseBySlug } from "@/data/catalog";
import { CAPSTONE_HOURS, HOURS_MAX, HOURS_MIN, phases } from "@/data/degree";
import { MONTHS, semester } from "@/data/semester";
import { External } from "@/components/external";
import { usePlan } from "@/lib/progress";

export const Route = createFileRoute("/six-months")({
  component: SixMonths,
  head: () => ({ meta: [{ title: "Six months · Field Hours" }] }),
});

function SixMonths() {
  const weeks = usePlan((state) => state.weeks);
  const toggleWeek = usePlan((state) => state.toggleWeek);
  const doneCount = semester.filter((item) => weeks[String(item.week)]).length;
  const hours = semester.reduce((sum, item) => sum + item.hours, 0);
  const total = hours + CAPSTONE_HOURS;

  return (
    <div>
      <p className="text-xs tracking-widest text-muted uppercase">Professional plan</p>
      <h1 className="mt-2 text-5xl text-ink">Six months.</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink">
        Twenty-six weeks, {hours} hours on the ten courses, then {CAPSTONE_HOURS} hours on the capstone. {total.toLocaleString()} hours in all, inside the {HOURS_MIN.toLocaleString()}–{HOURS_MAX.toLocaleString()} band. About {Math.round(hours / semester.length)} hours a week before the capstone.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        If a week slips, steal time from month 6 before you skip a lab in algorithms, operating systems, networks, or databases. The capstone starts only after the ten. The undergraduate prerequisites are not in these weeks.{" "}
        <Link to="/prerequisites" className="text-teal underline">
          Do those first
        </Link>{" "}
        if you have not already. This is still not a degree.
      </p>
      <p className="mt-4 text-sm text-ink">
        {doneCount} of {semester.length} weeks checked.
      </p>

      <div className="mt-10 flex flex-col gap-12">
        {MONTHS.map((label, index) => {
          const month = index + 1;
          const block = semester.filter((item) => item.month === month);
          return (
            <section key={label}>
              <h2 className="text-3xl text-ink">
                <span className="text-brass">Month {month}. </span>
                {label}
              </h2>
              <ol className="mt-4 divide-y divide-line border-y border-line">
                {block.map((item) => {
                  const course = courseBySlug.get(item.slug);
                  const resource = course?.resources[item.resource];
                  const checked = Boolean(weeks[String(item.week)]);
                  return (
                    <li key={item.week} className="grid gap-3 py-4 sm:grid-cols-12">
                      <label className="flex items-start gap-3 sm:col-span-4">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleWeek(item.week)}
                          className="mt-1 size-5 accent-teal"
                          aria-label={`Week ${item.week} done`}
                        />
                        <span>
                          <span className="block font-display text-xl text-brass">Week {item.week}</span>
                          <span className="block text-sm text-muted">{item.hours} hours</span>
                        </span>
                      </label>
                      <div className="sm:col-span-8">
                        <h3 className="text-xl text-ink">{item.title}</h3>
                        {course ? (
                          <p className="mt-1 text-sm text-teal">
                            <Link to="/course/$slug" params={{ slug: course.slug }} className="underline">
                              {course.code} {course.title}
                            </Link>
                          </p>
                        ) : null}
                        <p className="mt-2 text-sm text-ink">{item.detail}</p>
                        {course ? (
                          <p className="mt-2 text-sm">
                            <Link to="/course/$slug" params={{ slug: course.slug }} className="text-teal underline">
                              Lectures for {course.code} on this site
                            </Link>
                          </p>
                        ) : null}
                        {resource ? (
                          <p className="mt-1 text-sm text-muted">
                            Optional second explanation: <External href={resource.url}>{resource.title}</External>
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
      <section className="mt-12">
        <h2 className="text-3xl text-ink">
          <span className="text-brass">After month 6. </span>
          Capstone
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-ink">
          {CAPSTONE_HOURS} hours, 6 credits. One system that uses the ten courses. The phases below add to {CAPSTONE_HOURS}. Do them in order.
        </p>
        <ol className="mt-6 divide-y divide-line border-y border-line">
          {phases.map((phase, index) => (
            <li key={phase.id} className="grid gap-2 py-4 sm:grid-cols-12">
              <span className="font-display text-xl text-brass sm:col-span-1">{String(index + 1).padStart(2, "0")}</span>
              <div className="sm:col-span-9">
                <p className="text-lg text-ink">{phase.title}</p>
                <p className="mt-1 text-sm text-ink">{phase.body}</p>
              </div>
              <p className="text-sm text-muted sm:col-span-2 sm:text-right">{phase.hours} hours</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
