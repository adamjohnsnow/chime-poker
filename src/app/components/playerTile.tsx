import { BettingStatus, BlindButtons, Player } from "../lib/player";
import { PlayingCard } from "./playingCard";
import "../styles/player.css";
import { useEffect } from "react";
import { ButtonsWrapper } from "./buttons";

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
              player.bettingStatus === BettingStatus.BETTING
                ? "video-tile flex justify-center highlighted"
                : "video-tile flex justify-center"
            }
          >
            <video
              className={
                player.folded ? "video absolute folded" : "video absolute"
              }
              id={player.id}
            ></video>
            <div className="flex flex-col justify-between items-center text-white">
              <div className="flex m-1" id={"result-" + player.id}></div>
              <div className="flex m-1" id={"prize-" + player.id}></div>

              <ButtonsWrapper player={player} />
            </div>
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
