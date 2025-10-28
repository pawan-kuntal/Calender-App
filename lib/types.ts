export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  color: string
  category?: string
}

export interface CalendarState {
  events: CalendarEvent[]
  currentDate: Date
  viewMode: "month" | "week"
}

export const EVENT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
]

export const CATEGORIES = ["Work", "Personal", "Meeting", "Birthday", "Holiday", "Other"]
