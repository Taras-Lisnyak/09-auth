"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import css from "./NoteForm.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote, type CreateNoteParams } from "../../lib/api/clientApi";
import { initialDraft, useNoteStore } from "@/lib/store/noteStore";

interface NoteFormProps {
  onCancel?: () => void;
}

const tagOptions = ["Todo", "Work", "Personal", "Meeting", "Shopping"];

export default function NoteForm({ onCancel }: NoteFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const draft = useNoteStore((state) => state.draft);
  const setDraft = useNoteStore((state) => state.setDraft);
  const clearDraft = useNoteStore((state) => state.clearDraft);

  const handleOptionalCancel = () => {
    if (typeof onCancel === "function") {
      onCancel();
      return true;
    }

    return false;
  };

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      clearDraft();

      if (handleOptionalCancel()) {
        return;
      }

      router.back();
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setSubmitError("Session expired. Please sign in again.");
        return;
      }

      console.error("Failed to create note");
      setSubmitError("Could not create note. Please try again.");
    },
  });

  const handleCreateNote = async (formData: FormData) => {
    setSubmitError(null);

    const title = formData.get("title")?.toString().trim() ?? initialDraft.title;
    const content = formData.get("content")?.toString().trim() ?? initialDraft.content;
    const tag = formData.get("tag")?.toString().trim() ?? initialDraft.tag;

    if (!title || title.length < 3 || title.length > 50 || !tagOptions.includes(tag)) {
      setSubmitError("Please fill the form correctly.");
      return;
    }

    if (content.length > 500) {
      setSubmitError("Content max length is 500 characters.");
      return;
    }

    const payload: CreateNoteParams = { title, content, tag };
    mutation.mutate(payload);
  };

  const handleCancel = () => {
    if (handleOptionalCancel()) {
      return;
    }

    router.back();
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft({ title: event.target.value });
  };

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft({ content: event.target.value });
  };

  const handleTagChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDraft({ tag: event.target.value });
  };

  return (
    <form className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={css.input}
          value={draft.title}
          onChange={handleTitleChange}
          required
          minLength={3}
          maxLength={50}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          value={draft.content}
          onChange={handleContentChange}
          maxLength={500}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          required
          value={draft.tag}
          onChange={handleTagChange}
        >
          {tagOptions.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {submitError && <span className={css.error}>{submitError}</span>}

      <div className={css.actions}>
        <button type="button" className={css.cancelButton} onClick={handleCancel}>
          Cancel
        </button>
        <button
          type="submit"
          formAction={handleCreateNote}
          className={css.submitButton}
          disabled={mutation.isPending}
        >
          Create note
        </button>
      </div>
    </form>
  );
}

