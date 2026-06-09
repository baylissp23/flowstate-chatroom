import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";

interface TimerProps {
  timer: number;
  maxTime: number;
}

function Timer({ timer, maxTime }: TimerProps) {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const progressPercentage = (timer / maxTime) * 100;

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

  return (
    <>
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-center">
            <h1
              style={{
                fontFamily: "Consolas, 'Lucida Console', Monaco, monospace",
              }}
            >
              {minutesSeconds()}
            </h1>
          </div>
        </Card.Body>
        <Card.Footer>
          <ProgressBar
            animated
            now={progressPercentage}
            variant="primary"
            style={{ height: "10px" }}
          ></ProgressBar>
        </Card.Footer>
      </Card>
    </>
  );
}

export default Timer;
