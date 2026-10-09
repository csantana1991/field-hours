import { createFileRoute, Link } from "@tanstack/react-router";
import { courseBySlug } from "@/data/catalog";
import { shelf } from "@/data/library";
import { External } from "@/components/external";

export const Route = createFileRoute("/library")({
  component: Library,
  head: () => ({ meta: [{ title: "Library · Field Hours" }] }),
});

function Library() {
  return (
    <div>
      <p className="text-xs tracking-widest text-muted uppercase">Thirty-one outside sources</p>
      <h1 className="mt-2 text-5xl text-ink">The shelf.</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink">
        The A&M catalog, the Fast Track pairs, and the public courses that sit next to the notes on this site. Numbered in the order you listed them. These are other institutions' materials. The lectures, PDFs, and videos written here are the ones that belong to this bulletin.
      </p>
      <ol className="mt-10 divide-y divide-line border-y border-line">
        {shelf.map((item) => {
          const course = item.slug ? courseBySlug.get(item.slug) : undefined;
          return (
            <li key={item.n} className="grid gap-3 py-5 sm:grid-cols-12">
              <span className="font-display text-xl text-brass sm:col-span-1">{item.n}</span>
              <div className="sm:col-span-11">
                <p className="text-xs tracking-widest text-muted uppercase">{item.place}</p>
                <p className="mt-1 text-lg text-ink">
                  <External href={item.url}>{item.title}</External>
                </p>
                <p className="mt-2 max-w-2xl text-sm text-ink">{item.note}</p>
                {course ? (
                  <p className="mt-2 text-sm">
                    <Link to="/course/$slug" params={{ slug: course.slug }} className="text-teal underline">
                      {course.code} {course.title}
                    </Link>
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
