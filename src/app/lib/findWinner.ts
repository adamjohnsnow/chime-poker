import { gameState, newHand } from "./game";
import { HandEvaluator, Rank } from "./hands";
import { Player } from "./player";

export async function findWinner(game: gameState, players: Player[]) {
  const results: newHand[] = [];

  if (!players) {
    return results;
  }

  await players.forEach((player) => {
    const cards = [...game.communityCards, ...player.cards];
    const evaluatedHand = new HandEvaluator(cards).result;
    results.push({
      playerId: player.id,
      cards: evaluatedHand.cards,
      rank: evaluatedHand.rank,
      result: Rank[evaluatedHand.rank],
    });
    player.cardsShown = true;
  });

  game.results = results.sort((a, b) => b.rank - a.rank);
}
