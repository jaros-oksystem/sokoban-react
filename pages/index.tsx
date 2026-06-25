import React from "react";
import "./globals.css";
import SiteNav, {PagesEnum} from "@/src/Components/SiteNav";

export default function Home() {
  return (
      <>
        <SiteNav activatePage={PagesEnum.INDEX}/>
        <main className="mt-6 mx-auto w-150">
          <h1 className="text-2xl">Sokoban web application written in React</h1>
          <br/>
          <p>
            This web application has the following features:
          </p>
          <ul className="list-inside list-disc ml-8">
            <li>Sokoban game playable with keyboard or mouse</li>
            <li>Level editor with import/export functionality</li>
            <li>Support for 2 types of level formats: XSB and CSB</li>
            <li>Level solver with customizable parameters (the solver can only search for an optimal solution)</li>
            <li>Customizable level library (levels can then be selected in the Game and Solver pages</li>
            <li>Graphic options for the game board</li>
            <li>Operates fully on the local device</li>
          </ul>
          <br/>
          <p>
            The CSB (Compact sokoban) level format has been developed solely for this application. It has the following properties:
          </p>
          <ul className="list-inside list-disc ml-8">
            <li>Single line</li>
            <li>Uses only URL safe characters (68 characters total)</li>
            <li>Usually 3-4x shorter than the XSB format</li>
            <li>Fast encode/decode (for a level with dimensions 256x256 the encode takes ~30ms and decode ~5ms)</li>
          </ul>
        </main>
      </>
  );
};