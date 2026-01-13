"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MoodControls from "@/components/MoodControls";
import MovieGrid from "@/components/MovieGrid";
import MovieModal from "@/components/MovieModal";
import { genreNameMap, moodToFilters, relaxFilters, type MoodInput } from "@/lib/mood";
import { discoverMovies, fetchMovieDetails, fetchPopularMovies } from "@/lib/tmdb";
import type { MovieResult } from "@/lib/types";

const defaultMood: MoodInput = {
  chillIntense: 50,
  happyDark: 50,
  shortEpic: 50,
  familyFriendly: false
};

const parseNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : fallback;
};

const moodFromParams = (params: URLSearchParams): MoodInput => ({
  chillIntense: parseNumber(params.get("ci"), defaultMood.chillIntense),
  happyDark: parseNumber(params.get("hd"), defaultMood.happyDark),
  shortEpic: parseNumber(params.get("se"), defaultMood.shortEpic),
  familyFriendly: params.get("family") === "1"
});

const buildParams = (mood: MoodInput) => {
  const params = new URLSearchParams();
  params.set("ci", String(mood.chillIntense));
  params.set("hd", String(mood.happyDark));
  params.set("se", String(mood.shortEpic));
  if (mood.familyFriendly) {
    params.set("family", "1");
  }
  return params;
};

const pickDiverse = (movies: Awaited<ReturnType<typeof discoverMovies>>["results"]) => {
  const withPoster = movies.filter((movie) => movie.poster_path || movie.backdrop_path);
  const withoutPoster = movies.filter((movie) => !movie.poster_path && !movie.backdrop_path);
  const sorted = [...withPoster, ...withoutPoster];
  const picked: typeof movies = [];
  const usedGenres = new Set<number>();

  for (const movie of sorted) {
    const primary = movie.genre_ids[0];
    if (primary && !usedGenres.has(primary)) {
      picked.push(movie);
      usedGenres.add(primary);
    }
    if (picked.length === 12) return picked;
  }

  for (const movie of sorted) {
    if (!picked.find((item) => item.id === movie.id)) {
      picked.push(movie);
    }
    if (picked.length === 12) break;
  }

  return picked;
};

const enrichMovies = async (movies: Awaited<ReturnType<typeof discoverMovies>>["results"]) => {
  const detailResults = await Promise.all(
    movies.map(async (movie) => {
      try {
        const details = await fetchMovieDetails(movie.id);
        return {
          ...movie,
          runtime: details.runtime ?? undefined
        };
      } catch (error) {
        return movie;
      }
    })
  );

  return detailResults.map((movie) => ({
    ...movie,
    genres: movie.genre_ids.map((id) => genreNameMap[id]).filter(Boolean)
  }));
};

const fetchRecommendations = async (mood: MoodInput) => {
  const filters = moodToFilters(mood);
  const pages = [1, 2, 3];
  let results: Awaited<ReturnType<typeof discoverMovies>>["results"] = [];

  for (const page of pages) {
    const pageResults = await discoverMovies(filters, page);
    results = results.concat(pageResults.results);
  }

  if (results.length === 0) {
    const relaxed = relaxFilters(filters);
    for (const page of pages) {
      const pageResults = await discoverMovies(relaxed, page);
      results = results.concat(pageResults.results);
    }
  }

  if (results.length < 12) {
    for (const page of pages) {
      const pageResults = await fetchPopularMovies(page);
      results = results.concat(pageResults.results);
    }
  }

  const unique = Array.from(new Map(results.map((movie) => [movie.id, movie])).values());
  const selected = pickDiverse(unique).slice(0, 12);
  return enrichMovies(selected);
};

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialMood = useMemo(() => moodFromParams(searchParams), [searchParams]);
  const [mood, setMood] = useState<MoodInput>(initialMood);
  const [movies, setMovies] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MovieResult | null>(null);

  useEffect(() => {
    setMood(initialMood);
  }, [initialMood]);

  const updateUrl = useCallback(
    (nextMood: MoodInput) => {
      const params = buildParams(nextMood);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleMoodChange = (nextMood: MoodInput) => {
    setMood(nextMood);
    updateUrl(nextMood);
  };

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchRecommendations(mood);
      setMovies(results as MovieResult[]);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unable to load recommendations.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [mood]);

  // Debounce fetchMovies by 200ms to avoid excessive API calls during rapid slider changes.
  // Each slider change clears the previous timeout, so requests only fire after user stops adjusting.
  useEffect(() => {
    if (searchParams.size > 0) {
      const timeoutId = setTimeout(() => {
        fetchMovies();
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [fetchMovies, searchParams.size]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-aurora">MoviePicker</p>
        <h1 className="text-3xl font-semibold text-white sm:text-5xl">
          Discover movies that match exactly how you feel.
        </h1>
        <p className="text-base text-slate-300">
          Slide into your mood, tap find, and share the perfect lineup with friends.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1fr,2fr]">
        <MoodControls mood={mood} onMoodChange={handleMoodChange} onSubmit={fetchMovies} />
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
            <p>
              Current mood mix: Chill {mood.chillIntense}, Happy {mood.happyDark}, Short {mood.shortEpic}
              {mood.familyFriendly ? ", Family friendly" : ""}.
            </p>
          </div>
          <MovieGrid movies={movies} loading={loading} error={error} onSelect={setSelected} />
        </div>
      </section>

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
