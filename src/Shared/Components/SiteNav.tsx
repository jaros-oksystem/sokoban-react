import Link from "next/link";

export enum PagesEnum {
  INDEX,
  GAME,
  EDITOR
}

interface Props {
  activatePage: PagesEnum
}

export default function SiteNav({activatePage} : Readonly<Props>) {
  const linkClassName = "mx-4 hover:text-white py-1 px-2 font-bold rounded ";

  return (
      <nav className="pt-1 h-10 bg-blue-400">
        <div className="flex justify-center">
          <Link className={linkClassName + (activatePage == PagesEnum.INDEX ? "text-white" : "")} href="/">Home</Link>
          <Link className={linkClassName + (activatePage == PagesEnum.GAME ? "text-white" : "")} href="/game">Game</Link>
          <Link className={linkClassName + (activatePage == PagesEnum.EDITOR ? "text-white" : "")} href="/editor">Level editor</Link>
        </div>
      </nav>
  );
}