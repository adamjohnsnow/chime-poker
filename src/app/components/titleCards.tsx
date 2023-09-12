import { TitleCard } from "./titleCard";

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
