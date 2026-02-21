import { createPoll } from "astal/time";

const time = createPoll("00:00", 1000, ["date", "+%I:%M %p"]);

export default function Clock(): JSX.Element {
  return <label label={time} /> as JSX.Element;
}
