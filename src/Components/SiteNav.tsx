import Link from "next/link";
import {EDITOR_PAGE_PATH, GAME_PAGE_PATH, HOME_PAGE_PATH, OPTIONS_PAGE_PATH} from "@/src/Constants/PagePaths";
import Image from "next/image";
import logo from "../Svg/logo.svg"

export enum PagesEnum {
  INDEX,
  GAME,
  EDITOR,
  OPTIONS
}

interface Props {
  activatePage: PagesEnum
}

export default function SiteNav({activatePage} : Readonly<Props>) {
  const linkClassName = "px-5 hover:text-white py-1 font-bold rounded whitespace-nowrap transition-colors duration-100 ";

  return (
      <nav className="pt-1 h-10 bg-blue-400">
        <div className="flex">
          <Image className="ml-4 mr-3 h-8 w-7" src={logo} alt="Tile" loading={"eager"}/>
          <Link className={linkClassName + (activatePage == PagesEnum.INDEX ? "text-white" : "")} href={HOME_PAGE_PATH}>Home</Link>
          <Link className={linkClassName + (activatePage == PagesEnum.GAME ? "text-white" : "")} href={GAME_PAGE_PATH}>Game</Link>
          <Link className={linkClassName + (activatePage == PagesEnum.EDITOR ? "text-white" : "")} href={EDITOR_PAGE_PATH}>Level editor</Link>
          <Link className={linkClassName + (activatePage == PagesEnum.OPTIONS ? "text-white" : "")} href={OPTIONS_PAGE_PATH}>Options</Link>
        </div>
      </nav>
  );
}