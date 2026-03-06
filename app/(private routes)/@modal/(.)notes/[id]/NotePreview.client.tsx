"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/Modal/Modal";
import { useQuery } from "@tanstack/react-query";
import type { Note } from "@/types/note";
import { fetchNoteById } from "@/lib/api/clientApi";
import css from "@/components/NotePreview/NotePreview.module.css";

interface NotePreviewProps {
  id: string;
}

export default function NotePreviewClient({ id }: NotePreviewProps) {
  const router = useRouter();

  const { data: note, isLoading, isError } = useQuery<Note>(
    {
      queryKey: ["note", id],
      queryFn: () => fetchNoteById(id),
      refetchOnMount: false,
    } as import("@tanstack/react-query").UseQueryOptions<Note>
  );

  const handleClose = () => {
    router.back();
  };

  return (
    <Modal onClose={handleClose}>
      <div className={css.container}>
        {isLoading ? (
          <article className={css.item}>
            <p className={css.content}>Loading note...</p>
            <button type="button" className={css.backBtn} onClick={handleClose}>
              Close
            </button>
          </article>
        ) : isError || !note ? (
          <article className={css.item}>
            <p className={css.content}>Could not fetch note details. Please try again.</p>
            <button type="button" className={css.backBtn} onClick={handleClose}>
              Close
            </button>
          </article>
        ) : (
          <article className={css.item}>
            <div className={css.header}>
              <h2>{note.title}</h2>
              <span className={css.tag}>{note.tag}</span>
            </div>
            <p className={css.content}>{note.content}</p>
            <p className={css.date}>Created: {new Date(note.createdAt).toLocaleString()}</p>
            <button type="button" className={css.backBtn} onClick={handleClose}>
              Close
            </button>
          </article>
        )}
      </div>
    </Modal>
  );
}
