'use client'

import GamePlayable from "@/src/Shared/Components/GamePlayable";
import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Shared/Components/SiteNav";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import getLevelFromLevelCode from "@/src/Shared/Util/LevelCode/DecodingUtils";
import Level from "@/src/Shared/Classes/Level";
import {DEFAULT_LEVEL_CODE} from "@/src/Shared/Contants/Levels";

export default function Game() {
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
        <SiteNav activatePage={PagesEnum.GAME}/>
        <div className="mt-2">
          {
            level != null && <GamePlayable level={level}/>
          }
        </div>
      </div>
  );
}