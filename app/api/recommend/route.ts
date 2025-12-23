import { NextResponse } from "next/server";
import { discoverMovies, fetchMovieDetails } from "@/lib/tmdb";
import { genreNameMap, moodToFilters, relaxFilters, type MoodInput } from "@/lib/mood";

const parseNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : fallback;
};

const parseBoolean = (value: string | null) => value === "true" || value === "1";

const buildMoodFromParams = (params: URLSearchParams): MoodInput => ({
  chillIntense: parseNumber(params.get("ci"), 50),
  happyDark: parseNumber(params.get("hd"), 50),
  shortEpic: parseNumber(params.get("se"), 50),
  familyFriendly: parseBoolean(params.get("family"))
});

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mood = buildMoodFromParams(searchParams);
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

    const unique = Array.from(new Map(results.map((movie) => [movie.id, movie])).values());
    const selected = pickDiverse(unique).slice(0, 12);
    const enriched = await enrichMovies(selected);

    return NextResponse.json({
      mood,
      filters,
      results: enriched
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
