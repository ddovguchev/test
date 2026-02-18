import { Variable } from "astal"

export const clockTime = Variable("").poll(1000, "date +'%I:%M %p'")
