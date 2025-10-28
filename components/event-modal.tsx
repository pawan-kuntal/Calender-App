"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type CalendarEvent, EVENT_COLORS, CATEGORIES } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface EventModalProps {
  isOpen: boolean
  event?: CalendarEvent
  initialDate?: Date
  onSave: (event: CalendarEvent) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

export function EventModal({ isOpen, event, initialDate, onSave, onDelete, onClose }: EventModalProps) {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    color: EVENT_COLORS[0],
    category: CATEGORIES[0],
  })

  useEffect(() => {
    if (event) {
      setFormData(event)
    } else if (initialDate) {
      const endDate = new Date(initialDate)
      endDate.setHours(endDate.getHours() + 1)
      setFormData({
        title: "",
        description: "",
        startDate: initialDate,
        endDate,
        color: EVENT_COLORS[0],
        category: CATEGORIES[0],
      })
    }
  }, [event, initialDate, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.startDate || !formData.endDate) return

    const newEvent: CalendarEvent = {
      id: event?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      color: formData.color || EVENT_COLORS[0],
      category: formData.category,
    }

    onSave(newEvent)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{event ? "Edit Event" : "Create Event"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              maxLength={100}
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              maxLength={500}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date/Time *</label>
              <input
                type="datetime-local"
                value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date/Time *</label>
              <input
                type="datetime-local"
                value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {EVENT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {event && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(event.id)
                  onClose()
                }}
                className="flex-1"
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
