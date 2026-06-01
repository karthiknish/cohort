'use client';
import { Suspense, startTransition, useCallback, useMemo } from 'react';
import { Bell, LoaderCircle, Shield, User } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { usePreview } from '@/shared/contexts/preview-context';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { FadeInItem } from '@/shared/ui/animate-in';
import { cn } from '@/lib/utils';
import { DataExportCard } from './components/data-export-card';
import { DeleteAccountCard } from './components/delete-account-card';
import { NotificationPreferencesPanel } from './components/notification-preferences-panel';
import { PrivacySettingsCard } from './components/privacy-settings-card';
import { ProfileCard } from './components/profile-card';
import { RegionalPreferencesCard } from './components/regional-preferences-card';
import { SettingsPageHeader } from './components/settings-page-header';
type SettingsTab = 'profile' | 'notifications' | 'account';
function parseSettingsTab(value: string | null): SettingsTab {
    if (value === 'account')
        return 'account';
    if (value === 'notifications')
        return 'notifications';
    return 'profile';
}
function SettingsPageFallback() {
    return (<output className="flex min-h-[40vh] items-center justify-center" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden/>
        Loading settings…
      </div>
    </output>);
}
function SettingsPageInner() {
    const { isPreviewMode } = usePreview();
    const router = useRouter();
    const { replace } = router;
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const getSearchParam = searchParams.get.bind(searchParams);
    const activeTab = parseSettingsTab(getSearchParam('tab'));
    const handleSettingsTabChange = (value: string) => {
        const next = parseSettingsTab(value);
        startTransition(() => {
            replace(`${pathname}?tab=${next}`, { scroll: false });
        });
    };
    const previewDescription = isPreviewMode
        ? ' Changes apply locally in preview mode only.'
        : '';
    return (<main id="settings-page" className="mx-auto w-full max-w-3xl space-y-8">
      <SettingsPageHeader isPreviewMode={isPreviewMode}/>

      {isPreviewMode ? (<p className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Preview mode uses sample account data. Exports and destructive actions stay local to this session.
        </p>) : null}

      <Tabs value={activeTab} onValueChange={handleSettingsTabChange} className="space-y-6">
        <TabsList aria-label="Settings sections" className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
          <TabsTrigger value="profile" className={cn('gap-2 rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm')}>
            <User className="size-4" aria-hidden/>
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className={cn('gap-2 rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm')}>
            <Bell className="size-4" aria-hidden/>
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account" className={cn('gap-2 rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm')}>
            <Shield className="size-4" aria-hidden/>
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0 space-y-6 focus-visible:outline-none">
          <FadeInItem>
            <ProfileCard />
          </FadeInItem>
          <FadeInItem>
            <RegionalPreferencesCard />
          </FadeInItem>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0 space-y-6 focus-visible:outline-none">
          <FadeInItem>
            <NotificationPreferencesPanel />
          </FadeInItem>
        </TabsContent>

        <TabsContent value="account" className="mt-0 space-y-6 focus-visible:outline-none">
          <FadeInItem>
            <DataExportCard />
          </FadeInItem>

          <FadeInItem>
            <PrivacySettingsCard />
          </FadeInItem>

          <FadeInItem>
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
                <CardDescription>
                  Irreversible account actions.{previewDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="border-t border-destructive/20 pt-6">
                <DeleteAccountCard embedded/>
              </CardContent>
            </Card>
          </FadeInItem>
        </TabsContent>
      </Tabs>
    </main>);
}
const SETTINGS_PAGE_FALLBACK = <SettingsPageFallback />;
export default function SettingsPage() {
    return (<PageMotionShell reveal={false} className="space-y-0">
      <Suspense fallback={SETTINGS_PAGE_FALLBACK}>
        <SettingsPageInner />
      </Suspense>
    </PageMotionShell>);
}
