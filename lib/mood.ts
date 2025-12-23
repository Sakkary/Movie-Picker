export type MoodInput = {
  chillIntense: number;
  happyDark: number;
  shortEpic: number;
  familyFriendly: boolean;
};

export type DiscoverFilters = {
  withGenres: number[];
  withoutGenres: number[];
  voteCountGte: number;
  voteAverageGte?: number;
  runtimeGte?: number;
  runtimeLte?: number;
  sortBy: string;
  certificationCountry?: string;
  certificationLte?: string;
};

const genreIds = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Drama: 18,
  Family: 10751,
  Horror: 27,
  Mystery: 9648,
  Romance: 10749,
  Thriller: 53,
  War: 10752
} as const;

const bucket = (value: number) => {
  if (value <= 35) return "low";
  if (value <= 65) return "mid";
  return "high";
};

export const moodToFilters = (mood: MoodInput): DiscoverFilters => {
  const chillBucket = bucket(mood.chillIntense);
  const happyBucket = bucket(mood.happyDark);
  const lengthBucket = bucket(mood.shortEpic);

  const withGenres = new Set<number>();
  const withoutGenres = new Set<number>();

  if (chillBucket === "low") {
    (["Drama", "Romance", "Animation", "Family"] as const).forEach((name) => withGenres.add(genreIds[name]));
    withoutGenres.add(genreIds.War);
  } else if (chillBucket === "mid") {
    (["Drama", "Comedy", "Adventure"] as const).forEach((name) => withGenres.add(genreIds[name]));
  } else {
    (["Action", "Thriller", "Crime", "War"] as const).forEach((name) => withGenres.add(genreIds[name]));
  }

  if (happyBucket === "low") {
    (["Comedy", "Romance", "Family", "Animation"] as const).forEach((name) => withGenres.add(genreIds[name]));
  } else if (happyBucket === "mid") {
    (["Adventure", "Drama", "Mystery"] as const).forEach((name) => withGenres.add(genreIds[name]));
  } else {
    (["Thriller", "Horror", "Crime", "Mystery"] as const).forEach((name) => withGenres.add(genreIds[name]));
  }

  let runtimeGte: number | undefined;
  let runtimeLte: number | undefined;
  if (lengthBucket === "low") {
    runtimeLte = 100;
  } else if (lengthBucket === "mid") {
    runtimeGte = 95;
    runtimeLte = 140;
  } else {
    runtimeGte = 130;
  }

  const voteCountGte = chillBucket === "low" ? 50 : chillBucket === "mid" ? 200 : 500;
  const sortBy = chillBucket === "high" ? "vote_average.desc" : "popularity.desc";

  const filters: DiscoverFilters = {
    withGenres: Array.from(withGenres),
    withoutGenres: Array.from(withoutGenres),
    voteCountGte,
    sortBy,
    runtimeGte,
    runtimeLte
  };

  if (mood.familyFriendly) {
    filters.withoutGenres.push(genreIds.Horror);
    filters.voteAverageGte = 5;
    filters.certificationCountry = "US";
    filters.certificationLte = "PG";
  }

  return filters;
};

export const relaxFilters = (filters: DiscoverFilters): DiscoverFilters => ({
  ...filters,
  withoutGenres: filters.withoutGenres.filter((genre) => genre !== genreIds.War),
  voteCountGte: Math.max(20, Math.floor(filters.voteCountGte / 2)),
  runtimeGte: filters.runtimeGte ? Math.max(70, filters.runtimeGte - 15) : undefined,
  runtimeLte: filters.runtimeLte ? filters.runtimeLte + 15 : undefined,
  sortBy: "popularity.desc"
});

export const genreNameMap: Record<number, string> = Object.fromEntries(
  Object.entries(genreIds).map(([name, id]) => [id, name])
);
