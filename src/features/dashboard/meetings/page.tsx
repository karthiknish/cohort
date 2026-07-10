'use client';
import '@/shared/ui/livekit-styles';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { MeetingsPageProvider } from './components/meetings-page-provider';
import { MeetingsPageShell } from './components/meetings-page-shell';
export default function MeetingsPage() {
    return (<PageMotionShell reveal={false}>
      <MeetingsPageProvider>
        <MeetingsPageShell />
      </MeetingsPageProvider>
    </PageMotionShell>);
}
