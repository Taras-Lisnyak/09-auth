import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMe } from '@/lib/api/serverApi';
import css from './Profile.module.css';

export const metadata: Metadata = {
  title: 'Profile Page | NoteHub',
  description: 'User profile page with account information and quick profile edit access.',
  openGraph: {
    title: 'Profile Page | NoteHub',
    description: 'User profile page with account information and quick profile edit access.',
    url: 'https://your-vercel-url.vercel.app/profile',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'Profile page preview',
      },
    ],
  },
};

const Profile = async () => {
  const user = await getMe().catch(() => null);

  if (!user) {
    redirect('/sign-in');
  }

  const fallbackAvatar = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href="/profile/edit" className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>

        <div className={css.avatarWrapper}>
          <Image
            src={user.avatar || fallbackAvatar}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        </div>

        <div className={css.profileInfo}>
          <p>Username: {user.username || 'your_username'}</p>
          <p>Email: {user.email ?? 'your_email@example.com'}</p>
        </div>
      </div>
    </main>
  );
};

export default Profile;