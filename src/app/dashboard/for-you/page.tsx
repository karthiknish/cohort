import { permanentRedirect } from 'next/navigation';
/** For You lives at /for-you (workspace home), not under /dashboard. */
export default function DashboardForYouLegacyRedirect() {
    permanentRedirect('/for-you');
}
