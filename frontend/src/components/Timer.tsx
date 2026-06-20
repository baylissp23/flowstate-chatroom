import Card from "react-bootstrap/Card";

interface TimerProps {
  timer: number;
}

function Timer({ timer }: TimerProps) {
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
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export default Timer;
