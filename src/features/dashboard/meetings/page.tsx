'use client'

import { MeetingsPageProvider } from './components/meetings-page-provider'
import { MeetingsPageShell } from './components/meetings-page-shell'

export default function MeetingsPage() {
  return (
    <MeetingsPageProvider>
      <MeetingsPageShell />
    </MeetingsPageProvider>
  )
}
