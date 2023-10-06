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
        <div className="card-suit">{letter}</div>

        <div className="card-value">
          <SuitIcon suit={suit} size={30} />
        </div>
      </div>
    </div>
  );
}

export function SmallTitleCard({
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
        <div className="card-value">{letter}</div>
      </div>
    </div>
  );
}

export function SmallTitle() {
  return (
    <>
      <div style={{ width: 400, margin: 40 }} className="opponent-cards">
        <SmallTitleCard suit={"P"} letter={"P"} red={false} />
        <SmallTitleCard suit={"O"} letter={"O"} red={true} />
        <SmallTitleCard suit={"K"} letter={"K"} red={false} />
        <SmallTitleCard suit={"E"} letter={"E"} red={true} />
        <SmallTitleCard suit={"R"} letter={"R"} red={false} />
      </div>

      <div style={{ width: 400 }} className="opponent-cards">
        <SmallTitleCard suit={"F"} letter={"F"} red={false} />
        <SmallTitleCard suit={"A"} letter={"A"} red={true} />
        <SmallTitleCard suit={"C"} letter={"C"} red={false} />
        <SmallTitleCard suit={"E"} letter={"E"} red={true} />
      </div>
    </>
  );
}
