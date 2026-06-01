'use client';
import { type ChangeEvent, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
export function ProfileContactFields({ profileName, profilePhone, phoneError, savingProfile, canSaveProfile, profileError, onProfileNameChange, onProfilePhoneChange, onProfilePhoneBlur, onSubmit, }: {
    profileName: string;
    profilePhone: string;
    phoneError: string | null;
    savingProfile: boolean;
    canSaveProfile: boolean;
    profileError: string | null;
    onProfileNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onProfilePhoneChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onProfilePhoneBlur: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    return (<form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Display name</Label>
          <Input id="profile-name" value={profileName} onChange={onProfileNameChange} placeholder="e.g. Jordan Michaels" autoComplete="name"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-phone">Phone number</Label>
          <Input id="profile-phone" value={profilePhone} onChange={onProfilePhoneChange} onBlur={onProfilePhoneBlur} placeholder="+1 555 000 1234" autoComplete="tel" aria-describedby={phoneError ? 'phone-error' : 'phone-hint'} aria-invalid={phoneError ? true : undefined} className={phoneError ? 'border-destructive focus-visible:ring-destructive' : ''}/>
          {phoneError ? (<p id="phone-error" className="text-xs text-destructive">
              {phoneError}
            </p>) : (<p id="phone-hint" className="text-xs text-muted-foreground">
              Include country code for international numbers.
            </p>)}
        </div>
      </div>
      {profileError ? <p className="text-sm text-destructive">{profileError}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          We use this information across proposals and automated notifications.
        </p>
        <Button type="submit" disabled={!canSaveProfile}>
          {savingProfile ? <LoaderCircle className="mr-2 size-4 animate-spin"/> : null}
          Save changes
        </Button>
      </div>
    </form>);
}
