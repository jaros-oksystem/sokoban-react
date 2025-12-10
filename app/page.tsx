'use client'

import {GamePlayable} from "@/app/Shared/Components/GamePlayable";

export default function Home() {
  return (
      <div>
        <div className="my-10 flex justify-center">
          <GamePlayable/>
        </div>
      </div>
  );
}