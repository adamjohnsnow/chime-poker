'use client'

import { useRouter } from "next/router";
import Game from "./pages/game";

export default function Home() {
  return Game()
}