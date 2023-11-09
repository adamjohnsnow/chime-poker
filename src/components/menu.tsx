import { useRouter } from "next/navigation";
import { ChimeProvider } from "../lib/chimeProvider";
import "../styles/menu.css";
import { Card } from "../lib/cards";
import {
  flush,
  fourOfAKind,
  fullHouse,
  onePair,
  royalFlush,
  straight,
  straightFlush,
  threeOfAKind,
  twoPair,
} from "./exampleHands";
import { useEffect } from "react";
import { SuitIcon } from "./playingCard";

export function Menu({ controls }: { controls: ChimeProvider | undefined }) {
  const router = useRouter();
  useEffect(() => {
    setUpSwitches(controls);
  }, [controls]);

  async function leaveGame() {
    await controls?.leaveCall();
    router.push("/");
  }

  return (
    <div className="font-mono">
      <input type="checkbox" className="openSidebarMenu" id="openSidebarMenu" />
      <label htmlFor="openSidebarMenu" className="sidebarIconToggle">
        <div className="spinner diagonal part-1  dark:invert"></div>
        <div className="spinner horizontal  dark:invert"></div>
        <div className="spinner diagonal part-2  dark:invert"></div>
      </label>

      <HandsSubMenu />

      <div id="sidebarMenu" className=" dark:invert">
        <ul className="sidebarMenuInner items-end">
          <li>POKER FACE</li>
          <li className="flex flex-row items-center">
            <div className="p-4">Microphone</div>
            <label className="switch dark:invert">
              <input id="mic-control" type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </li>
          <li className="flex flex-row items-center">
            <div className="p-4">Camera</div>
            <label className="switch dark:invert">
              <input id="camera-control" type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </li>
          <li className="flex flex-row items-center">
            <div className="p-4">Speaker</div>
            <label className="switch dark:invert">
              <input id="speaker-control" type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </li>
          <li className="flex flex-row items-center">
            <div>Hand Helper</div>
            <input type="checkbox" id="openSubMenu" />
            <label htmlFor="openSubMenu" className="subMenuToggle">
              <div className="chevron diagonal part-3"></div>
              <div className="chevron diagonal part-4"></div>
            </label>
          </li>
          <li className="flex w-full">
            <form className="flex w-full" action={leaveGame}>
              <button className="flex w-full">Leave game</button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}

function HandsSubMenu() {
  return (
    <div id="subMenu" className="hide  dark:invert">
      <ul className="subMenuInner items-center  dark:invert">
        <li>WINNING HANDS</li>
        <li>
          <div className="flex items-center">1. Royal Flush</div>
          <ExampleHands cards={royalFlush} />
        </li>
        <li>
          <div>2. Straight Flush</div>
          <ExampleHands cards={straightFlush} />
        </li>
        <li>
          <div>3. Four of a Kind</div>
          <ExampleHands cards={fourOfAKind} />
        </li>
        <li>
          <div>4. Full House</div>
          <ExampleHands cards={fullHouse} />
        </li>
        <li>
          <div>5. Flush</div>
          <ExampleHands cards={flush} />
        </li>
        <li>
          <div>6. Straight</div>
          <ExampleHands cards={straight} />
        </li>
        <li>
          <div>7. Three of a Kind</div>
          <ExampleHands cards={threeOfAKind} />
        </li>
        <li>
          <div>8. Two Pair</div>
          <ExampleHands cards={twoPair} />
        </li>
        <li>
          <div>9. One Pair</div>
          <ExampleHands cards={onePair} />
        </li>
      </ul>
    </div>
  );
}
function ExampleHands({ cards }: { cards: Card[] }) {
  return (
    <div className="flex flex-row relative">
      {cards?.map((card, i) => (
        <div
          className={
            (card.value === 0 ? "bg-slate-300 " : "bg-cream ") +
            "example-card flex relative items-center justify-center"
          }
          key={i}
          style={{
            color: card.suit === "♥️" || card.suit === "♦️" ? " red" : " black",
          }}
        >
          {card.value > 0 ? (
            <div className="flex flex-col items-center">
              <div className="flex items-end">{getValue(card)}</div>
              <SuitIcon suit={card.suit} size={10} />
            </div>
          ) : (
            "?"
          )}
        </div>
      ))}
    </div>
  );
}

function getValue(card: Card) {
  switch (card.value) {
    case 14: {
      return "A";
    }
    case 13: {
      return "K";
    }
    case 12: {
      return "Q";
    }
    case 11: {
      return "J";
    }
    default: {
      return card.value;
    }
  }
}

function setUpSwitches(controls: ChimeProvider | undefined) {
  const micControl = document.getElementById("mic-control") as HTMLInputElement;
  if (micControl) {
    micControl.addEventListener("change", (event) => {
      const check = event.currentTarget as HTMLInputElement;
      if (check.checked) {
        controls?.unMuteMic();
      } else {
        controls?.muteMic();
      }
    });
  }

  const cameraControl = document.getElementById(
    "camera-control"
  ) as HTMLInputElement;
  if (cameraControl) {
    cameraControl.addEventListener("change", (event) => {
      const check = event.currentTarget as HTMLInputElement;
      if (check.checked) {
        controls?.turnOnCamera();
      } else {
        controls?.turnOffCamera();
      }
    });
  }

  const speakerControl = document.getElementById(
    "speaker-control"
  ) as HTMLInputElement;
  if (speakerControl) {
    speakerControl.addEventListener("change", (event) => {
      const check = event.currentTarget as HTMLInputElement;
      if (check.checked) {
        controls?.turnOnSpeaker();
      } else {
        controls?.turnOffSpeaker();
      }
    });
  }

  const helperControl = document.getElementById(
    "openSubMenu"
  ) as HTMLInputElement;

  const subMenu = document.getElementById("subMenu") as HTMLElement;
  if (helperControl && subMenu) {
    helperControl.addEventListener("change", (event) => {
      const check = event.currentTarget as HTMLInputElement;
      if (check.checked) {
        console.log("CCC");
        subMenu.classList.remove("hide");
      } else {
        subMenu.classList.add("hide");
      }
    });
  }

  const menuControl = document.getElementById(
    "openSidebarMenu"
  ) as HTMLInputElement;

  if (menuControl && subMenu) {
    menuControl.addEventListener("change", (event) => {
      helperControl.checked = false;
      const check = event.currentTarget as HTMLInputElement;
      if (!check.checked) {
        subMenu.classList.add("hide");
      }
    });
  }
}
