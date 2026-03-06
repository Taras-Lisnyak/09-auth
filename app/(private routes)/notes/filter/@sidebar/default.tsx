import Link from "next/link";
import css from "./SidebarNotes.module.css";

const tags = ["all", "todo", "work", "personal", "meeting", "shopping"];

const tagLabel: Record<string, string> = {
  all: "All notes",
  todo: "Todo",
  work: "Work",
  personal: "Personal",
  meeting: "Meeting",
  shopping: "Shopping",
};

export default function DefaultSidebar() {
  return (
    <ul className={css.menuList}>
      {tags.map((tag) => (
        <li key={tag} className={css.menuItem}>
          <Link href={`/notes/filter/${tag}`} className={css.menuLink}>
            {tagLabel[tag]}
          </Link>
        </li>
      ))}
    </ul>
  );
}

