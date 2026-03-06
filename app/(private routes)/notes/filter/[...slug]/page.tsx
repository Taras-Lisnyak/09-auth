import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api/serverApi";
import NotesClient from "./Notes.client";
import css from "../NotesPage.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug: slugParts } = await params;
  const slug = slugParts.join(", ");

  return {
    title: `Фільтр: ${slug} — NoteHub`,
    description: `Нотатки, відфільтровані за тегами: ${slug}.`,
    openGraph: {
      title: `Фільтр: ${slug} — NoteHub`,
      description: `Нотатки, відфільтровані за тегами: ${slug}.`,
      url: `https://your-vercel-url.vercel.app/notes/filter/${slugParts.join("/")}`,
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

export default async function FilteredNotesPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const resolved = await params;
  const slug = resolved.slug[0];

  const normalizedTag =
    slug === "all" ? undefined : slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", 1, "", normalizedTag ?? "all"],
    queryFn: () => fetchNotes(1, 12, "", normalizedTag),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <main className={css.container}>
      <HydrationBoundary state={dehydratedState}>
        <NotesClient slug={slug} normalizedTag={normalizedTag} />
      </HydrationBoundary>
    </main>
  );
}

