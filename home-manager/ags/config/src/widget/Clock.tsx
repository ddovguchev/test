import { createPoll } from "astal/time";

const time = createPoll("--:-- --", 1000, ["date", "+%I:%M %p"]);

export default function Clock(): JSX.Element {
  const el = <label label={time} cssClasses={["clock"]} />;
  return el as JSX.Element;
}
