import { createPoll } from "astal/time";

const script = `
t1=$(awk '/^cpu /{t=0; for(i=2;i<=NF;i++) t+=$i; print t,$5}' /proc/stat)
sleep 1
t2=$(awk '/^cpu /{t=0; for(i=2;i<=NF;i++) t+=$i; print t,$5}' /proc/stat)
cpu=$(echo "$t1 $t2" | awk '{u=100*(1-($4-$2)/($3-$1)); if(u<0) u=0; if(u>100) u=100; printf "%.0f", u}')
ram=$(awk '/MemTotal/{t=$2} /MemAvailable/{a=$2} END{printf "%.0f", 100*(t-a)/t}' /proc/meminfo)
gpu=$(nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits 2>/dev/null | head -1 | tr -d ' ' || echo "0")
echo "$cpu $ram $gpu"
`;

function parse(out: string, prev: string): string {
  const s = out.trim();
  if (!s) return prev;
  const parts = s.split(/\s+/);
  const [c = "0", r = "0", g = "0"] = parts;
  return `CPU ${c}% | RAM ${r}% | GPU ${g}%`;
}

const stats = createPoll("CPU 0% | RAM 0% | GPU 0%", 2000, ["sh", "-c", script], parse);

export default function SysMonitor(): JSX.Element {
  return <label label={stats} /> as JSX.Element;
}
