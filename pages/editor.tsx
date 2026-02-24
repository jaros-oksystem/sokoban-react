'use client'

import LevelEditor from "@/src/Components/LevelEditor";
import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Components/SiteNav";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";

export default function Editor() {
  const [levelCsbCode, setLevelCsbCode] = useState<string | null | undefined>(undefined);

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
        setLevelCsbCode(csbCode);
        return;
      } catch {
        // Invalid level code
      }
    }
    setLevelCsbCode(null);
  }, [router.isReady, router.query.level]);

  return (
      <div>
        <SiteNav activatePage={PagesEnum.EDITOR}/>
        <div className="mt-4">
          {
              levelCsbCode !== undefined && <LevelEditor initialLevelCsbCode={levelCsbCode}/>
          }
        </div>
      </div>
  );
}