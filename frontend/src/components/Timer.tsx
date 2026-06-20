import Card from "react-bootstrap/Card";
import { LightningCharge, CupHot } from "react-bootstrap-icons";

interface TimerProps {
  timer: number;
  timerType: "break" | "focus";
}

function Timer({ timer, timerType }: TimerProps) {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const minutesSeconds = () => {
    let formattedMinutes;
    let formattedSeconds;

    if (minutes < 10) {
      formattedMinutes = minutes.toString().padStart(2, "0");
    } else {
      formattedMinutes = minutes.toString();
    }

    if (seconds < 10) {
      formattedSeconds = seconds.toString().padStart(2, "0");
    } else {
      formattedSeconds = seconds.toString();
    }

    return formattedMinutes + " : " + formattedSeconds;
  };

  const TimerIcon = timerType === "break" ? CupHot : LightningCharge;

  return (
    <>
      <Card className="shadow bg-dark border-0 rounded-4 overflow-hidden mb-2">
        <Card.Body>
          <div className="d-flex justify-content-center">
            <h1
              style={{
                fontFamily: "Consolas, 'Lucida Console', Monaco, monospace",
              }}
            >
              {minutesSeconds()}
            </h1>
            <TimerIcon
              className="mx-3"
              style={{ color: timerType === "break" ? "#ae642e" : "#FFED29" }}
            />
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export default Timer;
