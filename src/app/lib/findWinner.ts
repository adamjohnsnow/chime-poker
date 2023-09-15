import { GameState } from "./game";
import { HandEvaluator, Result } from "./hands";
import { Player } from "./player";

export type handResult = {
  playerId: string;
  result: Result;
  prize: number;
};

const evaluator = new HandEvaluator();

export async function findWinner(game: GameState, players: Player[]) {
  const results: handResult[] = [];

  if (!players) {
    return results;
  }

  await players.forEach((player) => {
    if (!player.folded && player.active && player.cards.length === 2) {
      const cards = [...game.communityCards, ...player.cards];
      const evaluatedHand = evaluator.evaluate(cards);
      results.push({
        playerId: player.id,
        result: evaluatedHand,
        prize: 0,
      });
      player.cardsShown = true;
    }
  });

  results.sort(
    (a, b) =>
      b.result.rank - a.result.rank ||
      b.result.cardsScore - a.result.cardsScore ||
      b.result.kickersScore - a.result.kickersScore
  );
  game.results = allotPrizes(results, game.prizePot);
}

export function allotPrizes(hands: handResult[], prizePot: number) {
  let winners = hands.filter(
    (hand) => hand.result.rank === hands[0].result.rank
  );

  if (winners.length > 1) {
    winners = winners.filter(
      (hand) => hand.result.cardsScore === winners[0].result.cardsScore
    );
  }

  if (winners.length > 1) {
    winners = winners.filter(
      (hand) => hand.result.kickersScore === winners[0].result.kickersScore
    );
  }

  const prizeSplit = Math.floor(prizePot / winners.length);
  const change = prizePot % winners.length;

  winners.forEach((winner) => {
    winner.prize = prizeSplit;
  });

  winners[0].prize += change;

  hands.forEach((hand) => {
    if (!winners.some((winner) => winner.playerId === hand.playerId)) {
      winners.push(hand);
    }
  });
  return hands;
}
