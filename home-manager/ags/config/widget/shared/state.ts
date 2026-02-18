import { createPoll } from "ags/time"

export const clockTime = createPoll("", 1000, "date +'%H:%M'")
