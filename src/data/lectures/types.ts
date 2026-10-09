export type Figure =
  | { kind: "layers"; caption: string; rows: string[] }
  | { kind: "pipeline"; caption: string; stages: string[] }
  | { kind: "flow"; caption: string; steps: string[] }
  | { kind: "pair"; caption: string; leftTitle: string; rightTitle: string; left: string[]; right: string[] };

export type Lecture = {
  id: string;
  title: string;
  minutes: number;
  paragraphs: string[];
  figure: Figure;
  example: { title: string; steps: string[] };
  problems: { prompt: string; answer: string }[];
  /** Spoken opening, lecture 1 only. Plain sentences. No symbols. */
  narration?: string;
};

export type CoursePack = {
  slug: string;
  lectures: Lecture[];
};
