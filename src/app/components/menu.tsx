import { useRouter } from "next/navigation";
import { ChimeProvider } from "../lib/chimeUtils";
import "../styles/menu.css";

export function Menu({ controls }: { controls: ChimeProvider | undefined }) {
  const router = useRouter();

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
      <div id="sidebarMenu">
        <ul className="sidebarMenuInner">
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
          <li>
            <form action={leaveGame}>
              <button>Leave game</button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}
