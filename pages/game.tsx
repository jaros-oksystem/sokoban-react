'use client'

import {GamePlayable} from "@/src/Shared/Components/GamePlayable";
import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Shared/Components/SiteNav";
import React from "react";

export default function Game() {
  return (
      <div>
        <SiteNav activatePage={PagesEnum.GAME}/>
        <div className="mt-2 flex justify-center">
          <GamePlayable/>
        </div>
      </div>
  );
}