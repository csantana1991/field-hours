import { figureSvg } from "@/data/lectures/figure-svg";
import type { Lecture } from "@/data/lectures/types";
import { usePlan } from "@/lib/progress";

export function LectureSet({ slug, code, lectures }: { slug: string; code: string; lectures: Lecture[] }) {
  const done = usePlan((state) => state.lectures);
  const toggle = usePlan((state) => state.toggleLecture);

  return (
    <section className="mt-10">
      <h2 className="text-2xl text-ink">Lectures on this site</h2>
      <p className="mt-3 max-w-2xl text-sm text-ink">
        {lectures.length} lectures for {code}. Each one has a video, the notes, a worked example, and problems. Same topics as the catalog course. Not a reprint of another school’s class, and not university credit. Working the problems is the course. The PDF is the same text.
      </p>
      <p className="mt-3">
        <a href={`/notes/${slug}.pdf`} className="inline-flex h-11 items-center border border-line px-4 text-sm text-ink hover:bg-teal-soft">
          Download the course PDF
        </a>
      </p>
      <div className="mt-8 flex flex-col gap-10">
        {lectures.map((lecture, index) => {
          const key = `${slug}:${lecture.id}`;
          const media = `${slug}-${lecture.id}`;
          return (
            <article key={lecture.id} id={lecture.id} className="border-t border-line pt-6">
              <p className="text-xs tracking-widest text-brass uppercase">
                Lecture {String(index + 1).padStart(2, "0")} · {lecture.minutes >= 90 ? `${lecture.minutes / 60} hours with the problems` : `${lecture.minutes} min`}
              </p>
              <h3 className="mt-1 text-3xl text-ink">{lecture.title}</h3>
              <figure className="mt-4 max-w-3xl border border-line bg-ink">
                <video controls preload="metadata" className="w-full" poster={`/media/${media}.png`}>
                  <source src={`/media/${media}.mp4`} type="video/mp4" />
                </video>
                <figcaption className="bg-card px-3 py-2 text-sm text-muted">Video for this lecture. The notes and problems below are the full text.</figcaption>
              </figure>
              <div className="mt-4 max-w-2xl">
                {lecture.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="mt-3 text-ink">
                    {paragraph}
                  </p>
                ))}
              </div>
              <figure className="mt-5 max-w-3xl border border-line bg-card p-3">
                <div dangerouslySetInnerHTML={{ __html: figureSvg(lecture.figure) }} />
                <figcaption className="mt-2 text-sm text-muted">{lecture.figure.caption}</figcaption>
              </figure>
              <div className="mt-5 max-w-2xl border border-line bg-card p-4">
                <h4 className="text-lg text-ink">{lecture.example.title}</h4>
                <ol className="mt-2 list-decimal pl-5 text-sm text-ink">
                  {lecture.example.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="mt-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <ol className="mt-5 max-w-2xl list-decimal pl-5">
                {lecture.problems.map((problem, problemIndex) => (
                  <li key={problemIndex} className="mt-4 text-sm text-ink">
                    {problem.prompt}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-teal">Answer</summary>
                      <p className="mt-2 text-ink">{problem.answer}</p>
                    </details>
                  </li>
                ))}
              </ol>
              <label className="mt-4 flex h-11 items-center gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  className="size-5 accent-teal"
                  checked={Boolean(done[key])}
                  onChange={() => toggle(key)}
                />
                Lecture finished, including the problems
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}
