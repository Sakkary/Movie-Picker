import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "MoviePicker · Mood-Based Movie Picker",
  description: "Discover movies that match your mood with MoodFlix."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen gradient-hero">
          {children}
        </div>
      </body>
    </html>
  );
}
