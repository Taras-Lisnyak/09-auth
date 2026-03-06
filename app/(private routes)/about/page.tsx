import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | NoteHub',
  description: 'About NoteHub application.',
};

export default function AboutPage() {
  return (
    <main style={{ padding: '24px' }}>
      <h1>About</h1>
      <p>NoteHub helps you create and organize personal notes.</p>
    </main>
  );
}
