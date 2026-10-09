import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { clampCourseHours, clampPhaseHours, type PhaseId } from "@/data/degree";
import { trackById } from "@/data/tracks";

type PlanState = {
  trackId: string;
  custom: string[] | null;
  done: Record<string, boolean>;
  weeks: Record<string, boolean>;
  lectures: Record<string, boolean>;
  courseHours: Record<string, number>;
  phaseHours: Record<string, number>;
  setTrack: (trackId: string) => void;
  toggleDone: (slug: string) => void;
  toggleWeek: (week: number) => void;
  toggleLecture: (key: string) => void;
  setCourseHours: (slug: string, hours: number) => void;
  setPhaseHours: (id: PhaseId, hours: number) => void;
  addCourse: (slug: string) => void;
  removeCourse: (slug: string) => void;
  reset: () => void;
};

export const usePlan = create<PlanState>()(
  persist(
    (set, get) => ({
      trackId: "general",
      custom: null,
      done: {},
      weeks: {},
      lectures: {},
      courseHours: {},
      phaseHours: {},
      setTrack: (trackId) => set({ trackId, custom: null }),
      toggleDone: (slug) =>
        set({ done: { ...get().done, [slug]: !get().done[slug] } }),
      toggleWeek: (week) => {
        const key = String(week);
        set({ weeks: { ...get().weeks, [key]: !get().weeks[key] } });
      },
      toggleLecture: (key) =>
        set({ lectures: { ...get().lectures, [key]: !get().lectures[key] } }),
      setCourseHours: (slug, hours) =>
        set({ courseHours: { ...get().courseHours, [slug]: clampCourseHours(hours) } }),
      setPhaseHours: (id, hours) =>
        set({ phaseHours: { ...get().phaseHours, [id]: clampPhaseHours(id, hours) } }),
      addCourse: (slug) => {
        const current = get().custom ?? [...trackById(get().trackId).courses];
        if (current.includes(slug)) return;
        set({ custom: [...current, slug] });
      },
      removeCourse: (slug) => {
        const current = get().custom ?? [...trackById(get().trackId).courses];
        set({ custom: current.filter((item) => item !== slug) });
      },
      reset: () =>
        set({
          trackId: "general",
          custom: null,
          done: {},
          weeks: {},
          lectures: {},
          courseHours: {},
          phaseHours: {},
        }),
    }),
    {
      name: "field-hours-plan",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export function planSlugs(trackId: string, custom: string[] | null): string[] {
  if (custom) return custom;
  return trackById(trackId).courses;
}
