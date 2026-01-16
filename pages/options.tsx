'use client'

import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Components/SiteNav";
import React from "react";
import Options from "@/src/Components/Options";

export default function Editor() {

  return (
      <div>
        <SiteNav activatePage={PagesEnum.OPTIONS}/>
        <div className="mt-4">
          {
            <Options/>
          }
        </div>
      </div>
  );
}