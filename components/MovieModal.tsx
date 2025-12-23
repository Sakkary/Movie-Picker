"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MovieResult } from "@/lib/types";
import { fetchMovieVideos, getBackdropUrl } from "@/lib/tmdb";

type Trailer = { key: string; name: string } | null;

const pickTrailer = (videos: Awaited<ReturnType<typeof fetchMovieVideos>>["results"]) => {
  const youtube = videos.filter((video) => video.site === "YouTube");
  const preferred = youtube.find((video) => video.type === "Trailer") ?? youtube[0];
  return preferred ?? null;
};

type MovieModalProps = {
  movie: MovieResult | null;
  onClose: () => void;
};

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const [trailer, setTrailer] = useState<Trailer>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movie) return;
    const loadTrailer = async () => {
      setLoading(true);
      setError(null);
      setTrailer(null);
      try {
        const { results } = await fetchMovieVideos(movie.id);
        setTrailer(pickTrailer(results));
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Unable to load trailer.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadTrailer();
  }, [movie]);

  if (!movie) return null;

  const backdropUrl = getBackdropUrl(movie.backdrop_path, "w780");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-widest text-slate-200"
        >
          Close
        </button>
        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="relative h-64 lg:h-full">
            {backdropUrl ? (
              <Image src={backdropUrl} alt={movie.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-800 text-slate-400">No backdrop</div>
            )}
          </div>
          <div className="flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">{movie.title}</h2>
              <p className="text-sm text-slate-400">{movie.genres.join(" · ")}</p>
            </div>
            <p className="text-sm leading-relaxed text-slate-200">{movie.overview}</p>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trailer</p>
              {loading ? (
                <p className="mt-2 text-sm text-slate-300">Loading trailer...</p>
              ) : error ? (
                <p className="mt-2 text-sm text-rose-200">{error}</p>
              ) : trailer ? (
                <div className="mt-3 aspect-video overflow-hidden rounded-xl">
                  <iframe
                    title={trailer.name}
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-300">Trailer not available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
