"use client"

import { SchedulerEventsTable } from "./scheduler-events-table"
import { useSchedulerEvents } from "./use-scheduler-events"

export function SchedulerEventsView() {
  const state = useSchedulerEvents()

  return <SchedulerEventsTable state={state} />
}
