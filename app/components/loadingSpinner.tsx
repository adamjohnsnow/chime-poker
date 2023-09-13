import { Player } from "@lottiefiles/react-lottie-player";

export function LoadingSpinner({ show }: { show: boolean }) {
  if (show) {
    return (
      <Player
        autoplay
        loop
        src="https://lottie.host/6b75f037-210a-4462-b6f0-b059dbc69a71/gxBom6i1xS.json"
        style={{ height: "150px", width: "100px" }}
      ></Player>
    );
  }
}
