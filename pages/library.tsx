'use client'

import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Components/SiteNav";
import React from "react";
import LevelLibrary from "@/src/Components/LevelLibrary";

export default function Editor() {

  return (
      <div>
        <SiteNav activatePage={PagesEnum.LIBRARY}/>
        <div className="mt-4">
          {
            <LevelLibrary/>
          }
        </div>
      </div>
  );
}