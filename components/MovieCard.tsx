"use client";

import Image from "next/image";
import type { MovieResult } from "@/lib/types";
import { getPosterUrl } from "@/lib/tmdb";

const formatYear = (date: string) => (date ? new Date(date).getFullYear() : "—");

const formatRuntime = (runtime?: number) => {
  if (!runtime) return "—";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

type MovieCardProps = {
  movie: MovieResult;
  onSelect: (movie: MovieResult) => void;
};

export default function MovieCard({ movie, onSelect }: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path, "w342");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-card">
      <div className="relative h-64 w-full">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-800 text-slate-400">No poster</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{movie.title}</h3>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {formatYear(movie.release_date)} · ⭐ {movie.vote_average.toFixed(1)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-300">
          {movie.genres.slice(0, 3).map((genre) => (
            <span key={genre} className="rounded-full bg-slate-800 px-2 py-1">
              {genre}
            </span>
          ))}
          <span className="rounded-full bg-slate-800 px-2 py-1">{formatRuntime(movie.runtime)}</span>
        </div>
        <button
          type="button"
          onClick={() => onSelect(movie)}
          className="mt-auto rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-aurora hover:text-white"
        >
          More
        </button>
      </div>
    </article>
  );
}
