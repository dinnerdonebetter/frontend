import { Group } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useEffect, useState } from 'react';

export interface TimerComponentProps {
  durationInSeconds: number;
}

export const TimerComponent = ({ durationInSeconds }: TimerComponentProps): JSX.Element => {
  const [secondsRemaining, setSecondsRemaining] = useState(durationInSeconds);
  const [timerIsRunning, setTimerIsRunning] = useState(false);

  useEffect(() => {
    secondsRemaining > 0 && timerIsRunning && setTimeout(() => setSecondsRemaining(secondsRemaining - 1), 1000);
  }, [secondsRemaining, timerIsRunning]);

  const minimumDuration = intervalToDuration({ start: 0, end: secondsRemaining * 1000 });

  return (
    <div className="App">
      <Group>
        {!timerIsRunning && <IconPlayerPlay onClick={() => setTimerIsRunning(true)} />}
        <div>Time left: {formatDuration(minimumDuration)}</div>
      </Group>
    </div>
  );
};
