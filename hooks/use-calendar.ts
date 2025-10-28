"use client"

import { useState, useCallback } from "react"
import type { CalendarEvent, CalendarState } from "@/lib/types"

export function useCalendar() {
  const [state, setState] = useState<CalendarState>({
    events: [],
    currentDate: new Date(),
    viewMode: "month",
  })

  const addEvent = useCallback((event: CalendarEvent) => {
    setState((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }))
  }, [])

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((event) => (event.id === id ? { ...event, ...updates } : event)),
    }))
  }, [])

  const deleteEvent = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((event) => event.id !== id),
    }))
  }, [])

  const setCurrentDate = useCallback((date: Date) => {
    setState((prev) => ({
      ...prev,
      currentDate: date,
    }))
  }, [])

  const setViewMode = useCallback((mode: "month" | "week") => {
    setState((prev) => ({
      ...prev,
      viewMode: mode,
    }))
  }, [])

  return {
    ...state,
    addEvent,
    updateEvent,
    deleteEvent,
    setCurrentDate,
    setViewMode,
  }
}
