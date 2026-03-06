import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api/serverApi";
import NotePreviewClient from "./NotePreview.client";

export default async function NotePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const normalizedIdMatch = id.match(/[a-z0-9]{20,}$/i);
  const normalizedId = normalizedIdMatch ? normalizedIdMatch[0] : id;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["note", normalizedId],
    queryFn: () => fetchNoteById(normalizedId),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <NotePreviewClient id={normalizedId} />
    </HydrationBoundary>
  );
}
