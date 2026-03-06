"use client";

import { useRouter } from "next/navigation";
import Modal from "../Modal/Modal";
import type { Note } from "../../types/note";
import css from "./NotePreview.module.css";

interface NotePreviewProps {
  note?: Note;
  errorMessage?: string;
}

export default function NotePreview({ note, errorMessage }: NotePreviewProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <Modal onClose={handleClose}>
      <div className={css.container}>
        {!note ? (
          <article className={css.item}>
            <p className={css.content}>{errorMessage ?? "Could not fetch note details."}</p>
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
            <p className={css.date}>
              Updated: {new Date(note.updatedAt).toLocaleString()}
            </p>
            <button type="button" className={css.backBtn} onClick={handleClose}>
              Close
            </button>
          </article>
        )}
      </div>
    </Modal>
  );
}

