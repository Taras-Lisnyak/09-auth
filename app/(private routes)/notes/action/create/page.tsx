import type { Metadata } from "next";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./page.module.css";

export const metadata = {
  title: "Create note — NoteHub",
  description: "Create a new note and keep your draft ready to continue later.",
  openGraph: {
    title: "Create note — NoteHub",
    description: "Create a new note and keep your draft ready to continue later.",
    url: "https://your-vercel-url.vercel.app/notes/action/create",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "NoteHub preview",
      },
    ],
  },
} satisfies Metadata;

export default function CreateNote() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm />
      </div>
    </main>
  );
}

