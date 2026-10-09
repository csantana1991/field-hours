import type { Figure, Lecture } from "../types";

export function lec(
  id: string,
  title: string,
  paragraphs: string[],
  figure: Figure,
  exampleTitle: string,
  steps: string[],
  problems: { prompt: string; answer: string }[],
): Lecture {
  return {
    id,
    title,
    minutes: 90,
    paragraphs,
    figure,
    example: { title: exampleTitle, steps },
    problems,
  };
}
