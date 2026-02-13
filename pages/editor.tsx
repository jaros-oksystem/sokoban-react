'use client'

import LevelEditor from "@/src/Components/LevelEditor";
import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Components/SiteNav";
import React, {useEffect, useState} from "react";
import Level from "@/src/Classes/Level";
import {useRouter} from "next/router";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";
import {DEFAULT_CSB_CODE_FOR_EDITOR} from "@/src/Constants/Levels";

export default function Editor() {
  const [level, setLevel] = useState<Level | null>(null);

  // Try to load level from the query
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const csbCode = router.query.level;
    if (csbCode?.constructor === String) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLevel(getLevelFromCsbCode(csbCode));
        return;
      } catch {
        // Invalid level
      }
    }
    setLevel(getLevelFromCsbCode(DEFAULT_CSB_CODE_FOR_EDITOR));
  }, [router.isReady, router.query.level]);

  return (
      <div>
        <SiteNav activatePage={PagesEnum.EDITOR}/>
        <div className="mt-4">
          {
              level != null && <LevelEditor initialLevel={level}/>
          }
        </div>
      </div>
  );
}