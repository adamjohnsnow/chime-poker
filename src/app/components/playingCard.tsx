import Image from "next/image";
import { Card } from "../lib/cards";
import "../styles/playingCard.css";

export function PlayingCard({ card }: { card: Card }) {
  function getColour() {
    if (card.suit === "♦️" || card.suit === "♥️") {
      return "#FF0000";
    } else {
      return "#000";
    }
  }

  return (
    <div
      id={"card-" + card.value + "-" + card.suit}
      className={"card-wrapper"}
      style={{ color: getColour() }}
    >
      <div className="card-back"></div>
      <div className="card-face">
        <div className="card-value">
          <div>{getValue(card)}</div>
          <SuitIcon suit={card.suit} size={15} />
        </div>
        <SuitIcon suit={card.suit} size={50} />
      </div>
    </div>
  );
}

export function MiniCard({ card }: { card: Card }) {
  function getColour() {
    if (card.suit === "♦️" || card.suit === "♥️") {
      return "#FF0000";
    } else {
      return "#000";
    }
  }

  return (
    <div
      id={"card-" + card.value + "-" + card.suit}
      className={"card-wrapper"}
      style={{ color: getColour() }}
    >
      <div className="card-back"></div>
      <div className="flex flex-col card-face">
        <div className="card-value p-2 text-base">
          <div>{getValue(card)}</div>
        </div>
        <div>
          <SuitIcon suit={card.suit} size={25} />
        </div>
      </div>
    </div>
  );
}

export function SuitIcon({ suit, size }: { suit: string; size: number }) {
  let imageRef: string = "";
  let altText: string = "";
  switch (suit) {
    case "♥️": {
      imageRef = "/heart.svg";
      altText = "Heart Logo";
      break;
    }
    case "♦️": {
      imageRef = "/diamond.svg";
      altText = "Diamond Logo";
      break;
    }
    case "♠️": {
      imageRef = "/spade.svg";
      altText = "Spade Logo";
      break;
    }
    case "♣️": {
      imageRef = "/club.svg";
      altText = "Club Logo";
      break;
    }
  }

  return (
    <Image src={imageRef} alt={altText} width={size} height={size} priority />
  );
}

function getValue(card: Card) {
  switch (card.value) {
    case 14: {
      return "A";
    }
    case 13: {
      return "K";
    }
    case 12: {
      return "Q";
    }
    case 11: {
      return "J";
    }
    default: {
      return card.value;
    }
  }
}
