'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCategories } from '@/lib/api/clientApi'
import css from './CategoriesMenu.module.css'

const CategoriesMenu = () => {
  const [isOpenMenu, setIsOpenMenu] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  const toggle = () => setIsOpenMenu((prev) => !prev)

  useEffect(() => {
    getCategories().then((data) => setCategories(data))
  }, [])
  
  return (
    <div className={css.menuContainer}>
      <button onClick={toggle} className={css.menuBtn}>
        Notes
      </button>
      {isOpenMenu && (
        <ul className={css.menu}>
          <li className={css.menuItem}>
            <Link href={`/notes/filter/all`} onClick={toggle}>
              All notes
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category} className={css.menuItem}>
              <Link href={`/notes/filter/${category.toLowerCase()}`} onClick={toggle}>
                {category}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CategoriesMenu;