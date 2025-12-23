"use client";

import type { MovieResult } from "@/lib/types";
import MovieCard from "./MovieCard";

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60">
    <div className="h-64 rounded-t-2xl bg-slate-800" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 rounded bg-slate-800" />
      <div className="h-3 w-1/2 rounded bg-slate-800" />
      <div className="h-8 rounded bg-slate-800" />
    </div>
  </div>
);

type MovieGridProps = {
  movies: MovieResult[];
  loading: boolean;
  error: string | null;
  onSelect: (movie: MovieResult) => void;
};

export default function MovieGrid({ movies, loading, error, onSelect }: MovieGridProps) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
        {error}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300">
        No matches yet. Adjust your mood and hit “Find Movies”.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />
      ))}
    </div>
  );
}
