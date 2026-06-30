'use client';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

export function AppearanceSettingsCard() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const currentTheme = theme ?? 'system';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription>
                    Choose how Cohorts looks on this device.
                    {resolvedTheme ? ` Currently using ${resolvedTheme} mode.` : null}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Label htmlFor="appearance-theme">Theme</Label>
                <Select value={currentTheme} onValueChange={setTheme}>
                    <SelectTrigger id="appearance-theme" className="w-full max-w-xs">
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">
                            <span className="inline-flex items-center gap-2">
                                <Sun className="size-4" aria-hidden />
                                Light
                            </span>
                        </SelectItem>
                        <SelectItem value="dark">
                            <span className="inline-flex items-center gap-2">
                                <Moon className="size-4" aria-hidden />
                                Dark
                            </span>
                        </SelectItem>
                        <SelectItem value="system">
                            <span className="inline-flex items-center gap-2">
                                <Monitor className="size-4" aria-hidden />
                                System
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
}
