import "../styles/playingCard.css";
import { SuitIcon } from "./playingCard";

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
          <SuitIcon suit={suit} size={30} />
        </div>
        <div className="card-suit">{letter}</div>
      </div>
    </div>
  );
}
export function SmallTitle() {
  return (
    <>
      <div style={{ width: 400, margin: 40 }} className="opponent-cards">
        <TitleCard suit={"P"} letter={"P"} red={false} />
        <TitleCard suit={"O"} letter={"O"} red={true} />
        <TitleCard suit={"K"} letter={"O"} red={false} />
        <TitleCard suit={"E"} letter={"O"} red={true} />
        <TitleCard suit={"R"} letter={"O"} red={false} />
      </div>

      <div style={{ width: 400 }} className="opponent-cards">
        <TitleCard suit={"F"} letter={"P"} red={false} />
        <TitleCard suit={"A"} letter={"O"} red={true} />
        <TitleCard suit={"C"} letter={"O"} red={false} />
        <TitleCard suit={"E"} letter={"O"} red={true} />
      </div>
    </>
  );
}
