import { Card } from "../lib/cards";
import "../styles/playingCard.css";

export function TitleCard({
  suit,
  letter,
  red,
}: {
  suit: string;
  letter: string;
  red: boolean;
}) {
  function getColour() {
    if (red) {
      return "#FF0000";
    } else {
      return "#000";
    }
  }

  return (
    <div className={"card-wrapper"} style={{ color: getColour() }}>
      <div className="card-back"></div>
      <div className="card-face">
        <div className="card-value">
          <div>{suit}</div>
        </div>
        <div className="card-suit">{letter}</div>
      </div>
    </div>
  );
}
