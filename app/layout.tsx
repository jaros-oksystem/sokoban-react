import type { Metadata } from "next";
import "./globals.css";
import Home from "@/app/page";

export const metadata: Metadata = {
  title: "Sokoban solver"
};

export default function RootLayout() {
  return (
    <html lang="en">
      <body>
        <Home/>
      </body>
    </html>
  );
}
