import React from "react";
import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Components/SiteNav";

export default function Home() {
  return (
      <>
        <SiteNav activatePage={PagesEnum.INDEX}/>
        <main className="mt-6 mx-auto w-150">
          <p>
            Sokoban is a classic puzzle game that originated in Japan in the early 1980s.
            The objective is simple: push all the boxes onto designated storage locations.
            The game follows these rules:
          </p>
          <ul className="list-inside list-disc">
            <li>You control a character who can move up, down, left, or right.</li>
            <li>You can push boxes, but you cannot pull them.</li>
            <li>A box can only be pushed if there is an empty space behind it.</li>
            <li>The goal is to move all boxes onto the marked storage locations.</li>
            <li>You cannot walk through walls or boxes.</li>
          </ul>
        </main>
      </>
  );
};