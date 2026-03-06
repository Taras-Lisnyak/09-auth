import type { Metadata } from "next";
import css from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Сторінку не знайдено — NoteHub",
  description: "На жаль, такої сторінки не існує. Перевірте адресу або поверніться на головну.",
  openGraph: {
    title: "Сторінку не знайдено — NoteHub",
    description: "На жаль, такої сторінки не існує.",
    url: "https://your-vercel-url.vercel.app/not-found",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "NoteHub preview",
      },
    ],
  },
};

export default function NotFound() {
  return (
    <div>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </div>
  );
}

