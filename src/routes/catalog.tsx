import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AREAS, courses, KIND_LABEL, MATCH_LABEL, type Area, type Match } from "@/data/catalog";

export const Route = createFileRoute("/catalog")({
  component: Catalog,
  head: () => ({ meta: [{ title: "Catalog · Field Hours" }] }),
});

const MATCHES: { id: Match | "all"; label: string }[] = [
  { id: "all", label: "Any match" },
  { id: "full", label: "Full" },
  { id: "close", label: "Close" },
  { id: "partial", label: "Partial" },
  { id: "practice", label: "Not a lecture" },
];

const bulletin = courses.filter((course) => !course.foundation);

function Catalog() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<Area | "all">("all");
  const [match, setMatch] = useState<Match | "all">("all");

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bulletin.filter((course) => {
      if (area !== "all" && course.area !== area) return false;
      if (match !== "all" && course.match !== match) return false;
      if (!needle) return true;
      const hay = [course.code, course.title, course.blurb, ...course.resources.map((item) => item.title)]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [query, area, match]);

  return (
    <div>
      <p className="text-xs tracking-widest text-muted uppercase">CSCE graduate catalog</p>
      <h1 className="mt-2 text-5xl text-ink">Every course you listed.</h1>
      <p className="mt-4 max-w-2xl text-ink">
        {bulletin.length} graduate entries, the list you pasted. Every taught course has lectures, a video, and a PDF on this site. Research numbers, the seminar, the internship, and directed study are not lectures. A full match means a public semester covers the same topics. Partial means there isn’t one, and the links are a second explanation. The undergraduate courses those master’s classes assume are on the{" "}
        <Link to="/prerequisites" className="text-teal underline">
          prerequisites
        </Link>{" "}
        page. They are not inside the 36 credits.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <label className="block">
          <span className="text-xs tracking-widest text-muted uppercase">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try compilers, Boneh, robotics"
            className="mt-1 h-11 w-full border border-line bg-card px-3 text-ink outline-none focus:border-teal"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Field">
          {AREAS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setArea(item.id as Area | "all")}
              className={
                "h-11 px-3 text-sm " + (area === item.id ? "bg-teal text-paper" : "border border-line text-ink hover:bg-teal-soft")
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="How close the free course is">
          {MATCHES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMatch(item.id)}
              className={
                "h-11 px-3 text-sm " + (match === item.id ? "bg-ink text-paper" : "border border-line text-ink hover:bg-teal-soft")
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        {shown.length} shown
      </p>
      <ul className="mt-2 divide-y divide-line border-y border-line">
        {shown.map((course) => (
          <li key={course.slug} className="grid gap-2 py-4 sm:grid-cols-12 sm:gap-4">
            <div className="sm:col-span-8">
              <Link to="/course/$slug" params={{ slug: course.slug }} className="text-lg text-ink hover:text-teal">
                <span className="text-teal">{course.code}</span>
                <span> {course.title}</span>
              </Link>
              <p className="mt-1 text-sm text-muted">{course.blurb}</p>
            </div>
            <div className="text-sm sm:col-span-4 sm:text-right">
              <p className="text-ink">{MATCH_LABEL[course.match]}</p>
              <p className="text-muted">{course.credits} credits · {KIND_LABEL[course.resources[0]?.kind ?? "site"]}</p>
              {course.resources[0] ? (
                <a href={course.resources[0].url} target="_blank" rel="noreferrer" className="text-teal underline decoration-line underline-offset-4">
                  {course.resources[0].source}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {shown.length === 0 ? <p className="mt-6 text-ink">Nothing under that filter. Clear the search or widen the field.</p> : null}
    </div>
  );
}
