"use client";
import { ShedPlayer } from "@/lib/shed";
import { ChimeProvider } from "@/lib/chimeProvider";

import { useEffect, useState } from "react";
import { getChimeConfig } from "@/lib/firebase";
import { createAttendee } from "@/lib/chime";
import { Menu } from "@/components/menu";

export default function ShedPage({ params }: { params: { id: string } }) {
  const [thisPlayer, setThisPlayer] = useState<ShedPlayer>();
  const [players, setPlayers] = useState<ShedPlayer[]>([]);
  const [chimeProvider, setChimeProvider] = useState<ChimeProvider>();

  useEffect(() => {
    setUpChimeCall();
  }, []);

  useEffect(() => {
    console.log("save player");
  }, [thisPlayer]);

  async function setUpChimeCall() {
    const newPlayer = new ShedPlayer();
    await setThisPlayer(newPlayer);

    const chimeConfig = await getChimeConfig(params.id, "shed");
    if (!chimeConfig) {
      return;
    }

    const attendee = await createAttendee(chimeConfig, newPlayer.id as string);

    if (!attendee) {
      return;
    }

    const provider = await new ChimeProvider(chimeConfig, attendee);
    setChimeProvider(provider);
  }

  function startGame() {
    console.log(chimeProvider);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-32">
      <form action={startGame}>
        <button>Start</button>
      </form>
      <Menu controls={chimeProvider} />
    </main>
  );
}
