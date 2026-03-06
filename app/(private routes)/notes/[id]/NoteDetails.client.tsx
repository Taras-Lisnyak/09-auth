"use client";

import { useQuery } from "@tanstack/react-query";
import type { Note } from "../../../types/note";
import { fetchNoteById } from "../../../lib/api/clientApi";
import css from "./NoteDetails.module.css";
import Link from "next/link";

interface NoteDetailsClientProps {
  id: string;
  isModal?: boolean;
}

export default function NoteDetailsClient({ id, isModal = false }: NoteDetailsClientProps) {
  const { data, isLoading, isError, error } = useQuery<Note>(
    {
      queryKey: ["note", id],
      queryFn: () => fetchNoteById(id),
      refetchOnMount: false, // avoid redundant fetch when component mounts
    } as import("@tanstack/react-query").UseQueryOptions<Note>
  );

  if (isLoading) return <p>Loading note...</p>;
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching note:", error);
    return <p>Could not fetch the note. Error: {errorMessage}</p>;
  }
  if (!data) return <p>Note not found.</p>;

  return (
    <article className={css.article}>
      {!isModal && (
        <Link href="/notes/filter/all" className={css.backLink}>
          ← Back to Notes
        </Link>
      )}
      <h1 className={css.title}>{data.title}</h1>
      <p className={css.content}>{data.content}</p>
      <span className={css.tag}>{data.tag}</span>
    </article>
  );
}
