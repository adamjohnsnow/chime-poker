import { useRouter } from "next/navigation";
import { ChimeProvider } from "../lib/chimeUtils";
import "../styles/menu.css";
import { Card } from "../lib/cards";
import {
  flush,
  fourOfAKind,
  fullHouse,
  royalFlush,
  straightFlush,
} from "./exampleHands";
import { useEffect } from "react";

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
        <div className="spinner diagonal part-1"></div>
        <div className="spinner horizontal"></div>
        <div className="spinner diagonal part-2"></div>
      </label>
      <div id="subMenu" className="hide">
        <ul className="subMenuInner items-center">
          <li>WINNING HANDS</li>
          <li>1. Royal Flush</li>
          <li>
            <ExampleHands cards={royalFlush} />
          </li>
          <li>2. Straight Flush</li>
          <li>
            <ExampleHands cards={straightFlush} />
          </li>
          <li>3. Four of a Kind</li>
          <li>
            <ExampleHands cards={fourOfAKind} />
          </li>
          <li>4. Full House</li>
          <li>
            <ExampleHands cards={fullHouse} />
          </li>
          <li>5. Flush</li>
          <li>
            <ExampleHands cards={flush} />
          </li>
        </ul>
      </div>

      <div id="sidebarMenu">
        <ul className="sidebarMenuInner items-end">
          <li>POKER FACE</li>
          <li className="flex flex-row items-center">
            <div className="p-4">Microphone</div>
            <label className="switch">
              <input id="mic-control" type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </li>
          <li className="flex flex-row items-center">
            <div className="p-4">Camera</div>
            <label className="switch">
              <input id="camera-control" type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </li>
          <li className="flex flex-row items-center">
            <div className="p-4">Speaker</div>
            <label className="switch">
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

function ExampleHands({ cards }: { cards: Card[] }) {
  return (
    <div className="opponent-cards flex flex-row relative">
      {cards?.map((card, i) => (
        <div
          key={i}
          style={{
            color: card.suit === "♥️" || card.suit === "♦️" ? "red" : "black",
          }}
          className="example-card flex relative items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-end">{getValue(card)}</div>
            <div>{card.suit}</div>
          </div>
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
  console.log(helperControl, subMenu);
  if (helperControl && subMenu) {
    helperControl.addEventListener("change", (event) => {
      const check = event.currentTarget as HTMLInputElement;
      if (check.checked) {
        subMenu.classList.remove("hide");
      } else {
        subMenu.classList.add("hide");
      }
    });

    console.log("SHOW");
  }
}
