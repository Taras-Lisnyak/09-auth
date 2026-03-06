import css from './Header.module.css';
import Link from 'next/link';
import CategoriesMenu from '../CategoriesMenu/CategoriesMenu';
import AuthNavigation from '../AuthNavigation/AuthNavigation';

const Header = () => {
	// Прибираємо запит
  // const categories = await getCategories()
  
  return (
    <header className={css.header}>
      <Link href='/' aria-label='Home'>
        Note HUB
      </Link>
      <nav aria-label='Main Navigation'>
        <ul className={css.navigation}>
          <li>
            <Link href='/'>Home</Link>
          </li>
          <li>
            {/* Пропс categories тепер не приходять з SSR */}
            <CategoriesMenu />
          </li>
          <li>
            <Link href='/about'>About</Link>
          </li>
          <AuthNavigation />
        </ul>
      </nav>
    </header>
  );
};

export default Header;