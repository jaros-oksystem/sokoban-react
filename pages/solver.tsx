'use client'

import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Components/SiteNav";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import LevelSolver from "@/src/Components/LevelSolver";

export default function Solver() {
  const [levelCsbCode, setLevelCsbCode] = useState<string | undefined>(undefined);
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
        setLevelCsbCode(urlCsbCode);
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
        <SiteNav activatePage={PagesEnum.SOLVER}/>
        <div className="mt-2">
          {
              routerReady && <LevelSolver urlLevelCsbCode={levelCsbCode} urlLibraryLevelUuid={levelUuid}/>
          }
        </div>
      </div>
  );
}