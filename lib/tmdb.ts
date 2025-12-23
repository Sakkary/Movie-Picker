import type { DiscoverFilters } from "./mood";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
//npm run dev
export type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  runtime?: number;
};

export type TmdbMovieDetails = {
  id: number;
  runtime: number | null;
};

export type TmdbVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
};

const getApiKey = () => {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not configured.");
  }
  return key;
};

const buildQuery = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
};

const fetchJson = async <T>(path: string, params: Record<string, string | number | boolean | undefined>) => {
  const apiKey = getApiKey();
  const query = buildQuery({ ...params, api_key: apiKey });
  const response = await fetch(`${TMDB_BASE_URL}${path}?${query}`, {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`TMDB error (${response.status}).`);
  }

  return (await response.json()) as T;
};

export const discoverMovies = async (filters: DiscoverFilters, page: number) => {
  const params: Record<string, string | number | boolean | undefined> = {
    include_adult: false,
    include_video: false,
    sort_by: filters.sortBy,
    page,
    with_genres: filters.withGenres.length ? filters.withGenres.join(",") : undefined,
    without_genres: filters.withoutGenres.length ? filters.withoutGenres.join(",") : undefined,
    "vote_count.gte": filters.voteCountGte,
    "vote_average.gte": filters.voteAverageGte,
    "with_runtime.gte": filters.runtimeGte,
    "with_runtime.lte": filters.runtimeLte,
    certification_country: filters.certificationCountry,
    "certification.lte": filters.certificationLte
  };

  return fetchJson<{ results: TmdbMovie[] }>("/discover/movie", params);
};

export const fetchMovieDetails = async (movieId: number): Promise<TmdbMovieDetails> => {
  return fetchJson<TmdbMovieDetails>(`/movie/${movieId}`, {});
};

export const fetchMovieVideos = async (movieId: number) => {
  return fetchJson<{ results: TmdbVideo[] }>(`/movie/${movieId}/videos`, {});
};

export const getPosterUrl = (path: string | null, size: "w342" | "w500" = "w342") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;

export const getBackdropUrl = (path: string | null, size: "w780" | "w1280" = "w780") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
