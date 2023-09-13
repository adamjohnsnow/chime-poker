/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import "../styles/modal.css";
import { ChimeProvider } from "../lib/chimeUtils";
import { useRouter } from "next/navigation";

let activityTimer: NodeJS.Timeout;
let leaveTimer: NodeJS.Timeout;
let tickTimer: NodeJS.Timeout;

export function ActivityMonitor({ chime }: { chime: ChimeProvider }) {
  const router = useRouter();

  const [hidden, setHidden] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    resetTimer();
    document.addEventListener("mousemove", resetTimer);

    return () => {
      document.removeEventListener("mousemove", resetTimer);
      clearTimeout(activityTimer);
      clearTimeout(leaveTimer);
    };
  }, []);

  useEffect(() => {
    const modal = document.getElementById("modal-background");
    if (!modal) {
      return;
    }
    if (hidden) {
      modal.classList.add("hidden");
      return;
    }
    setCountdown(30);
    modal.classList.remove("hidden");

    leaveTimer = setTimeout(() => {
      console.log("leaving");
      leaveCall();
    }, 30000);
  }, [hidden]);

  useEffect(() => {
    if (countdown === 0) {
      return;
    }
    tickTimer = setTimeout(() => {
      tick();
    }, 1000);
  }, [countdown]);

  async function leaveCall() {
    await chime.leaveCall();

    router.push("/");
  }

  function resetTimer() {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
      setHidden(false);
    }, 300000); // 5 mins
  }

  function clearModal() {
    clearTimeout(leaveTimer);
    clearTimeout(tickTimer);
    setHidden(true);
    resetTimer();
  }

  function tick() {
    setCountdown(countdown - 1);
  }

  return (
    <div id="modal-background" className="modal-background hidden">
      <div className="modal">
        <div>
          You have been inactive for some time. <br />
          You will be removed from the game in <span>{countdown}</span>.
        </div>
        <form action={clearModal}>
          <button>Click to continue</button>
        </form>
      </div>
    </div>
  );
}
