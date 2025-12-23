"use client";

import type { MoodInput } from "@/lib/mood";

const sliderLabel = (value: number, left: string, right: string) => {
  if (value <= 35) return left;
  if (value >= 66) return right;
  return "Balanced";
};

type MoodControlsProps = {
  mood: MoodInput;
  onMoodChange: (nextMood: MoodInput) => void;
  onSubmit: () => void;
};

export default function MoodControls({ mood, onMoodChange, onSubmit }: MoodControlsProps) {
  const update = (key: keyof MoodInput, value: number | boolean) => {
    onMoodChange({ ...mood, [key]: value });
  };

  return (
    <section className="card-glass rounded-3xl p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chill ↔ Intense</h2>
          <span className="text-sm text-slate-300">{sliderLabel(mood.chillIntense, "Chill", "Intense")}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={mood.chillIntense}
          onChange={(event) => update("chillIntense", Number(event.target.value))}
          className="w-full accent-aurora"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Happy ↔ Dark</h2>
          <span className="text-sm text-slate-300">{sliderLabel(mood.happyDark, "Happy", "Dark")}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={mood.happyDark}
          onChange={(event) => update("happyDark", Number(event.target.value))}
          className="w-full accent-ember"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Short ↔ Epic</h2>
          <span className="text-sm text-slate-300">{sliderLabel(mood.shortEpic, "Short", "Epic")}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={mood.shortEpic}
          onChange={(event) => update("shortEpic", Number(event.target.value))}
          className="w-full accent-purple-400"
        />
      </div>

      <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
        <span className="text-sm font-medium text-slate-200">Family friendly</span>
        <button
          type="button"
          onClick={() => update("familyFriendly", !mood.familyFriendly)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
            mood.familyFriendly ? "bg-aurora" : "bg-slate-700"
          }`}
          aria-pressed={mood.familyFriendly}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              mood.familyFriendly ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </label>

      <button
        type="button"
        onClick={onSubmit}
        className="w-full rounded-2xl bg-gradient-to-r from-aurora to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-glow transition hover:scale-[1.01]"
      >
        Find Movies
      </button>
    </section>
  );
}
