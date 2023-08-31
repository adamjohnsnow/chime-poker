"use client";
import { useEffect, useState } from "react";
import { Card } from "../lib/cards";
import { ChimeProvider } from "../lib/chimeUtils";
import { PlayingCard } from "./playingCard";

export function CommunityCards({
  cards,
  chime,
}: {
  cards: Card[];
  chime?: ChimeProvider;
}) {
  const [communityCards, setCommunityCards] = useState<Card[]>([]);

  useEffect(() => {
    setCommunityCards(cards);

    if (chime) {
      chime.registerCardsEventListener(eventHandler);
    }
  }, [cards, chime]);

  function eventHandler(data: any): void {
    if (!data.message || !data.cards) {
      return;
    }
    console.log("NEW COMMUNITY CARDS", data.cards);
    setCommunityCards(data.cards);
  }

  return (
    <div className="community-cards">
      {communityCards.map((item, i) => (
        <PlayingCard key={i} card={item}></PlayingCard>
      ))}
    </div>
  );
}
