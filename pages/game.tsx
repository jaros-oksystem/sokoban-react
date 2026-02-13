'use client'

import GamePlayable from "@/src/Components/GamePlayable";
import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Components/SiteNav";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import getLevelFromCsbCode from "@/src/Util/Codes/CsbDecodingUtils";
import Level from "@/src/Classes/Level";

export default function Game() {
  const [level, setLevel] = useState<Level | undefined>(undefined);
  const [levelUuid, setLevelUuid] = useState<string | undefined>(undefined);
  const [routerReady, setRouterReady] = useState<boolean>(false);

  // Try to load level from the query
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const urlCsbCode = router.query.level;
    if (urlCsbCode?.constructor === String) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLevel(getLevelFromCsbCode(urlCsbCode));
      } catch {
        // Invalid level
      }
    }
    const urlLevelUuid = router.query.levelUuid;
    if (urlLevelUuid?.constructor === String) {
      try {
        setLevelUuid(urlLevelUuid);
      } catch {
        // Invalid level
      }
    }
    setRouterReady(true);
  }, [router.isReady, router.query.level, router.query.levelUuid]);

  return (
      <div>
        <SiteNav activatePage={PagesEnum.GAME}/>
        <div className="mt-2">
          {
            routerReady && <GamePlayable libraryLevelUuid={levelUuid} urlLevel={level}/>
          }
        </div>
      </div>
  );
}