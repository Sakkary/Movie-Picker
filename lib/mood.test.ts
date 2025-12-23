import { describe, expect, it } from "vitest";
import { moodToFilters } from "./mood";

describe("moodToFilters", () => {
  it("maps chill mood to calmer genres and lower vote count", () => {
    const filters = moodToFilters({
      chillIntense: 10,
      happyDark: 20,
      shortEpic: 20,
      familyFriendly: false
    });

    expect(filters.withGenres).toContain(18); // Drama
    expect(filters.withoutGenres).toContain(10752); // War
    expect(filters.voteCountGte).toBe(50);
    expect(filters.runtimeLte).toBe(100);
  });

  it("maps intense mood to action-forward mix", () => {
    const filters = moodToFilters({
      chillIntense: 90,
      happyDark: 80,
      shortEpic: 90,
      familyFriendly: false
    });

    expect(filters.withGenres).toContain(28); // Action
    expect(filters.withGenres).toContain(53); // Thriller
    expect(filters.voteCountGte).toBe(500);
    expect(filters.runtimeGte).toBe(130);
  });

  it("applies family-friendly constraints", () => {
    const filters = moodToFilters({
      chillIntense: 50,
      happyDark: 50,
      shortEpic: 50,
      familyFriendly: true
    });

    expect(filters.withoutGenres).toContain(27);
    expect(filters.voteAverageGte).toBe(5);
    expect(filters.certificationLte).toBe("PG");
  });
});
