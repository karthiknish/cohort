'use client';
import { type ChangeEvent, type FormEvent, useCallback, useMemo, useReducer, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { usePreview } from '@/shared/contexts/preview-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { settingsApi } from '@/lib/convex-api';
import { getPreviewSettingsProfile } from '@/lib/preview-data';
import { notifyFailure, notifyInfo, notifySuccess } from '@/lib/notifications';
import { getAvatarInitials } from './utils';
import { ProfileAvatarEditor } from './profile-card-avatar-editor';
import { ProfileContactFields } from './profile-card-contact-fields';
import { ProfileCardLoading } from './profile-card-loading';
import { useProfileAvatarUpload } from './profile-card-hooks';
import { createInitialProfileEditState, isPhoneValid, profileEditReducer, type ProfileUser, } from './profile-card-state';
export function ProfileCard() {
    const { isPreviewMode } = usePreview();
    const profile = useQuery(settingsApi.getMyProfile);
    const updateMyProfile = useMutation(settingsApi.updateMyProfile);
    const [previewUser, setPreviewUser] = useState<ProfileUser>(() => getPreviewSettingsProfile());
    const [editState, dispatch] = useReducer(profileEditReducer, undefined, createInitialProfileEditState);
    const user = isPreviewMode ? previewUser : profile;
    const { profileNameDraft, profilePhoneDraft, profileError, phoneError, savingProfile, avatarPreviewOverride, avatarError, avatarUploading, } = editState;
    const profileName = profileNameDraft ?? (user?.name ?? '');
    const profilePhone = profilePhoneDraft ?? (user?.phoneNumber ?? '');
    const avatarPreview = avatarPreviewOverride === undefined ? (user?.photoUrl ?? null) : avatarPreviewOverride;
    const avatar = useProfileAvatarUpload({
        isPreviewMode,
        user,
        avatarPreview,
        dispatch,
        setPreviewUser,
    });
    const hasProfileChanges = (() => {
        const originalName = user?.name ?? '';
        const originalPhone = user?.phoneNumber ?? '';
        return profileName.trim() !== originalName || profilePhone.trim() !== originalPhone;
    })();
    const avatarInitials = getAvatarInitials(profileName.trim() || user?.name, user?.email);
    const isProfileNameValid = profileName.trim().length >= 2;
    const canSaveProfile = (isPreviewMode || Boolean(user)) && hasProfileChanges && isProfileNameValid && !phoneError && !savingProfile;
    const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user && !isPreviewMode) {
            dispatch({ type: 'setProfileError', value: 'You must be signed in to update your profile.' });
            return;
        }
        const nextName = profileName.trim();
        const nextPhone = profilePhone.trim();
        if (nextName.length < 2) {
            dispatch({ type: 'setProfileError', value: 'Enter a name with at least two characters.' });
            return;
        }
        if (!isPhoneValid(nextPhone)) {
            dispatch({ type: 'setPhoneError', value: 'Enter a valid phone number (e.g. +1 555 000 1234).' });
            return;
        }
        dispatch({ type: 'setSavingProfile', value: true });
        dispatch({ type: 'clearProfileErrors' });
        if (isPreviewMode) {
            setPreviewUser((current) => ({
                ...current,
                name: nextName,
                phoneNumber: nextPhone.length ? nextPhone : null,
            }));
            dispatch({ type: 'commitProfileDraft', name: nextName, phone: nextPhone });
            dispatch({ type: 'setSavingProfile', value: false });
            notifyInfo({
                title: 'Preview mode',
                message: 'Profile changes were applied locally for this session.',
            });
            return;
        }
        await updateMyProfile({
            name: nextName,
            phoneNumber: nextPhone.length ? nextPhone : null,
        })
            .then(() => {
            dispatch({ type: 'commitProfileDraft', name: nextName, phone: nextPhone });
            notifySuccess({ title: 'Profile updated', message: 'Your changes were saved.' });
        })
            .catch((submitError) => {
            const message = submitError instanceof Error ? submitError.message : 'Failed to update profile';
            dispatch({ type: 'setProfileError', value: message });
            notifyFailure({
                title: 'Profile update failed',
                message,
            });
        })
            .finally(() => {
            dispatch({ type: 'setSavingProfile', value: false });
        });
    };
    const handleProfileNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setProfileNameDraft', value: event.target.value });
    };
    const handleProfilePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setProfilePhoneDraft', value: event.target.value });
    };
    const handleProfilePhoneBlur = () => {
        if (profilePhone.trim() && !isPhoneValid(profilePhone)) {
            dispatch({ type: 'setPhoneError', value: 'Enter a valid phone number (e.g. +1 555 000 1234).' });
        }
        else {
            dispatch({ type: 'clearPhoneErrors' });
        }
    };
    if (!isPreviewMode && profile === undefined) {
        return <ProfileCardLoading />;
    }
    return (<Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update the contact details that appear in proposals and client-facing emails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProfileAvatarEditor avatarPreview={avatarPreview} avatarInitials={avatarInitials} avatarUploading={avatarUploading} avatarError={avatarError} avatarInputRef={avatar.avatarInputRef} onAvatarButtonClick={avatar.handleAvatarButtonClick} onAvatarFileChange={avatar.handleAvatarFileChange} onAvatarRemoveClick={avatar.handleAvatarRemoveClick} disabled={savingProfile}/>
        <ProfileContactFields profileName={profileName} profilePhone={profilePhone} phoneError={phoneError} savingProfile={savingProfile} canSaveProfile={canSaveProfile} profileError={profileError} onProfileNameChange={handleProfileNameChange} onProfilePhoneChange={handleProfilePhoneChange} onProfilePhoneBlur={handleProfilePhoneBlur} onSubmit={handleProfileSubmit}/>
      </CardContent>
    </Card>);
}
