'use client'

import {LevelEditor} from "@/src/Shared/Components/LevelEditor";
import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Shared/Components/SiteNav";
import React from "react";

export default function Editor() {
  return (
      <div>
        <SiteNav activatePage={PagesEnum.EDITOR}/>
        <div className="mt-2">
          <LevelEditor/>
        </div>
      </div>
  );
}