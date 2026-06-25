import Link from "next/link";
import {
  EDITOR_PAGE_PATH,
  GAME_PAGE_PATH,
  HOME_PAGE_PATH,
  LIBRARY_PAGE_PATH,
  SOLVER_PAGE_PATH,
  OPTIONS_PAGE_PATH
} from "@/src/Constants/PagePaths";

export enum PagesEnum {
  INDEX,
  GAME,
  EDITOR,
  SOLVER,
  LIBRARY,
  OPTIONS
}

interface Props {
  activatePage: PagesEnum
}

export default function SiteNav({activatePage} : Readonly<Props>) {
  const linkClassName = "px-5 hover:text-white py-1 text-lg rounded whitespace-nowrap transition-colors duration-200 ";

  return (
      <nav className="pt-1 h-11 bg-blue-400">
        <div className="flex justify-center">
          <Link className={linkClassName + (activatePage === PagesEnum.INDEX ? "text-white" : "")} href={HOME_PAGE_PATH}>{"\u2302 Home"}</Link>
          <Link className={linkClassName + (activatePage === PagesEnum.GAME ? "text-white" : "")} href={GAME_PAGE_PATH}>{"\u229E Game"}</Link>
          <Link className={linkClassName + (activatePage === PagesEnum.EDITOR ? "text-white" : "")} href={EDITOR_PAGE_PATH}>{"\u270E Editor"}</Link>
          <Link className={linkClassName + (activatePage === PagesEnum.SOLVER ? "text-white" : "")} href={SOLVER_PAGE_PATH}>{"\u2BCE Solver"}</Link>
          <Link className={linkClassName + (activatePage === PagesEnum.LIBRARY ? "text-white" : "")} href={LIBRARY_PAGE_PATH}>{"\ud83d\udd6e Library"}</Link>
          <Link className={linkClassName + (activatePage === PagesEnum.OPTIONS ? "text-white" : "")} href={OPTIONS_PAGE_PATH}>{"\u26ED Options"}</Link>
        </div>
      </nav>
  );
}