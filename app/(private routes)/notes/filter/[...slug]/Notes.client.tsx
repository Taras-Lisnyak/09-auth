"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { FetchNotesResponse } from "@/types/fetchNotesResponse";
import { fetchNotes } from "@/lib/api/clientApi";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import SearchBox from "@/components/SearchBox/SearchBox";
import css from "../NotesPage.module.css";

interface NotesClientProps {
	slug: string;
	normalizedTag?: string;
}

export default function NotesClient({ slug, normalizedTag }: NotesClientProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput);
			setCurrentPage(1);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchInput]);

	const queryKeyTag = normalizedTag ?? "all";

	const { data, isLoading, isError } = useQuery<FetchNotesResponse>(
		{
			queryKey: ["notes", currentPage, debouncedSearch, queryKeyTag],
			queryFn: () => fetchNotes(currentPage, 12, debouncedSearch, normalizedTag),
			placeholderData: keepPreviousData,
		} as import("@tanstack/react-query").UseQueryOptions<FetchNotesResponse>
	);

	const heading = useMemo(
		() => (slug === "all" ? "All Notes" : `Notes tagged "${normalizedTag}"`),
		[normalizedTag, slug]
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<>
			<div className={css.toolbar}>
				<h1>{heading}</h1>
				<Link href="/notes/action/create" className={css.button}>
					+ Create note
				</Link>
			</div>

			<div className={css.controls}>
				<div className={css.controlsLeft}>
					<SearchBox value={searchInput} onSearch={setSearchInput} />
				</div>
				<div className={css.controlsCenter}>
					{data && data.totalPages > 1 && (
						<Pagination
							pageCount={data.totalPages}
							currentPage={currentPage}
							onPageChange={handlePageChange}
						/>
					)}
				</div>
				<div className={css.controlsRight} />
			</div>

			{isLoading && <p>Loading notes...</p>}
			{isError && <p>Could not fetch the list of notes.</p>}
			{!isLoading && !isError && (!data || !data.notes || data.notes.length === 0) && (
				<p>No notes found.</p>
			)}
			{!isLoading && !isError && data?.notes && data.notes.length > 0 && (
				<NoteList notes={data.notes} />
			)}
		</>
	);
}

