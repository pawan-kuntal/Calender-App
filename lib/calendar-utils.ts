import type { CalendarEvent } from "./types"

export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

export function getMonthGrid(date: Date): (number | null)[][] {
  const daysInMonth = getDaysInMonth(date)
  const firstDay = getFirstDayOfMonth(date)
  const daysInPrevMonth = getDaysInMonth(new Date(date.getFullYear(), date.getMonth() - 1))

  const grid: (number | null)[][] = []
  let day = 1

  for (let week = 0; week < 6; week++) {
    const weekDays: (number | null)[] = []
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      if (week === 0 && dayOfWeek < firstDay) {
        weekDays.push(null)
      } else if (day > daysInMonth) {
        weekDays.push(null)
      } else {
        weekDays.push(day)
        day++
      }
    }
    grid.push(weekDays)
  }

  return grid
}

export function getWeekDays(date: Date): Date[] {
  const curr = new Date(date)
  const first = curr.getDate() - curr.getDay()
  const weekDays: Date[] = []

  for (let i = 0; i < 7; i++) {
    const day = new Date(curr.setDate(first + i))
    weekDays.push(new Date(day))
  }

  return weekDays
}

export function getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter((event) => {
    const eventDate = new Date(event.startDate)
    return eventDate.toDateString() === date.toDateString()
  })
}

export function getEventsForDateRange(events: CalendarEvent[], startDate: Date, endDate: Date): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)
    return eventStart <= endDate && eventEnd >= startDate
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function getTimeSlotPosition(date: Date): number {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return (hours * 60 + minutes) / 30 // 30-minute slots
}

export function getEventDuration(startDate: Date, endDate: Date): number {
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 30) // in 30-minute slots
}
