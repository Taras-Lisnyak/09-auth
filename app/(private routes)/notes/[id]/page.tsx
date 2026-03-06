import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api/serverApi";
import NoteDetailsClient from "./NoteDetails.client";
import type { Note } from "@/types/note";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const note: Note = await fetchNoteById(id);

    return {
      title: `${note.title} — NoteHub`,
      description: `${note.content.slice(0, 100)}...`,
      openGraph: {
        title: `${note.title} — NoteHub`,
        description: `${note.content.slice(0, 100)}...`,
        url: `https://your-vercel-url.vercel.app/notes/${id}`,
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
  } catch {
    return {
      title: "Нотатку не знайдено — NoteHub",
      description: "Не вдалося завантажити нотатку. Можливо, вона була видалена або не існує.",
      openGraph: {
        title: "Нотатку не знайдено — NoteHub",
        description: "Не вдалося завантажити нотатку.",
        url: `https://your-vercel-url.vercel.app/notes/${id}`,
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
  }
}

export default async function NoteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const normalizedIdMatch = id.match(/[a-z0-9]{20,}$/i);
  const normalizedId = normalizedIdMatch ? normalizedIdMatch[0] : id;
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ["note", normalizedId],
      queryFn: () => fetchNoteById(normalizedId),
    });
  } catch {
    return <NoteDetailsClient id={normalizedId} />;
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <NoteDetailsClient id={normalizedId} />
    </HydrationBoundary>
  );
}

