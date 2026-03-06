"use client";

import React from "react";

interface ErrorProps {
	error: Error;
	reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
	// Log to console for debugging during development
	console.error(error);

	return (
		<main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
			<h1>Something went wrong</h1>
			<p>We encountered an unexpected error.</p>
			<pre style={{ whiteSpace: "pre-wrap", color: "#b00020" }}>{error?.message}</pre>
			<div style={{ marginTop: 16 }}>
				<button onClick={() => reset()} style={{ padding: "8px 12px", borderRadius: 6 }}>
					Try again
				</button>
			</div>
		</main>
	);
}

