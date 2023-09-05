import { BlindButtons, Player } from "../lib/player";
import { PlayingCard } from "./playingCard";
import "../styles/player.css";
import { useEffect } from "react";
import {
  BigBlindButton,
  ButtonsWrapper,
  DealerButton,
  SmallBlindButton,
} from "./buttons";

export function PlayerTile({ player }: { player: Player }) {
  // const [player, setPlayer] = useState<Player>();
  useEffect(() => {
    // getPlayerStream(player.gameId, player.id, playerEventHandler);
  }, [player]);

  // function playerEventHandler(data: any): void {
  //   console.log("PLAYER MESSAGE:", data);
  //   if(data.cards == player.cards){
  //   player.cards = []
  //   }
  // }

  return (
    <>
      {player ? (
        <div className="flex flex-col items-center align-middle w-48 h-60">
          <div>
            <strong>{player.name}</strong>
          </div>
          <div>£{player.cash}</div>
          <div
            className={
              player.isBettingTurn
                ? "video-tile highlighted flex items-end"
                : "video-tile  flex items-end"
            }
          >
            <ButtonsWrapper player={player} />
            <video
              className={player.folded ? "video-tile folded" : "video-tile"}
              id={player.id}
            ></video>
          </div>
          <div>
            {player.cards?.length === 2 && player.cardsShown ? (
              <div className="opponent-cards">
                <PlayingCard card={player.cards[0]}></PlayingCard>
                <PlayingCard card={player.cards[1]}></PlayingCard>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
