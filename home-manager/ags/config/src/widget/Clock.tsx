import { createPoll } from "astal/time";

const time = createPoll("--:-- --", 1000, ["date", "+%I:%M %p"]);

export default function Clock(): JSX.Element {
  return (
    <box cssName="clock-wrap">
      <label label={time} cssClasses={["clock"]} />
    </box>
  ) as JSX.Element;
}
