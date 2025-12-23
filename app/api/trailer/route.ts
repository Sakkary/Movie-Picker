import { NextResponse } from "next/server";
import { fetchMovieVideos } from "@/lib/tmdb";

const pickTrailer = (videos: Awaited<ReturnType<typeof fetchMovieVideos>>["results"]) => {
  const youtube = videos.filter((video) => video.site === "YouTube");
  const preferred = youtube.find((video) => video.type === "Trailer") ?? youtube[0];
  return preferred ?? null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = Number(searchParams.get("id"));
    if (!Number.isFinite(movieId)) {
      return NextResponse.json({ error: "Missing movie id." }, { status: 400 });
    }

    const { results } = await fetchMovieVideos(movieId);
    const trailer = pickTrailer(results);

    return NextResponse.json({ trailer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
