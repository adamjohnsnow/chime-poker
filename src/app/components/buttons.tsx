import { BlindButtons, Player } from "../lib/player";
import "../styles/buttons.css";

export function ButtonsWrapper({ player }: { player: Player }) {
  return (
    <div className="flex absolute m-1">
      {player.cardsShown ? null : (
        <>
          {player.isDealer ? <DealerButton /> : null}
          {player.blindButton === BlindButtons.BIGBLIND ? (
            <BigBlindButton />
          ) : null}
          {player.blindButton === BlindButtons.SMALLBLIND ? (
            <SmallBlindButton />
          ) : null}
        </>
      )}
    </div>
  );
}
export function DealerButton() {
  return (
    <div id="dealer-button" className="button dealer">
      Dealer
    </div>
  );
}
export function SmallBlindButton() {
  return (
    <div id="small-blind-button" className="button small">
      Small
    </div>
  );
}
export function BigBlindButton() {
  return (
    <div id="big-blind-button" className="button big">
      Big
    </div>
  );
}
