'use client'

import LevelEditor from "@/src/Shared/Components/LevelEditor";
import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Shared/Components/SiteNav";
import React, {useEffect, useState} from "react";
import Level from "@/src/Shared/Classes/Level";
import {useRouter} from "next/router";
import getLevelFromLevelCode from "@/src/Shared/Util/LevelCode/DecodingUtils";
import {DEFAULT_LEVEL_CODE} from "@/src/Shared/Contants/Levels";

export default function Editor() {
  const [level, setLevel] = useState<Level | null>(null);

  // Try to load level from the query
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const levelCode = router.query.level;
    if (levelCode?.constructor === String) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLevel(getLevelFromLevelCode(levelCode));
        return;
      } catch {
        // Invalid level
      }
    }
    setLevel(getLevelFromLevelCode(DEFAULT_LEVEL_CODE));
  }, [router.isReady, router.query.level]);

  return (
      <div>
        <SiteNav activatePage={PagesEnum.EDITOR}/>
        <div className="mt-2">
          {
              level != null && <LevelEditor initialLevel={level}/>
          }
        </div>
      </div>
  );
}