'use client'

import { PlayingCard } from "../components/playingCard"
import { Card } from "../lib/cards"
import "../styles/table.css"

export default function Test() {

  const cards = [
    new Card(1, "♠️")
  ]
  return <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <div className="community-cards">
      <PlayingCard value={2} suit="♥️"></PlayingCard>
      <PlayingCard value={5} suit="♠️"></PlayingCard>
    </div>
  </main>
  
}