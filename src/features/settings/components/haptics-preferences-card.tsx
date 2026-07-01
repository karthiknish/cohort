'use client';
import { Vibrate } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { useHaptics, useHapticsSettings } from '@/shared/lib/haptics';

export function HapticsPreferencesCard() {
    const { enabled, setEnabled, supported, active } = useHapticsSettings();
    const haptics = useHaptics();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Vibrate className="size-5" aria-hidden />
                    Haptic feedback
                </CardTitle>
                <CardDescription>
                    Subtle vibrations on supported mobile devices for taps, selections, and
                    notifications. Automatically disabled when reduced motion is on.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!supported ? (
                    <p className="text-sm text-muted-foreground">
                        This device does not support haptic feedback (Vibration API unavailable).
                    </p>
                ) : null}

                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="haptics-enabled">Enable haptics</Label>
                        <p className="text-sm text-muted-foreground">
                            {active
                                ? 'Haptics are active on this device.'
                                : supported
                                  ? 'Haptics are paused (disabled or reduced motion is on).'
                                  : 'Not supported on this device.'}
                        </p>
                    </div>
                    <Switch
                        id="haptics-enabled"
                        checked={enabled}
                        onCheckedChange={setEnabled}
                        disabled={!supported}
                        aria-label="Toggle haptic feedback"
                    />
                </div>

                {supported ? (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => haptics.success()}
                            disabled={!active}
                        >
                            Test haptic
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Plays the success pattern.
                        </span>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
