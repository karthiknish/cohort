export function isPhoneValid(phone: string): boolean {
  const trimmed = phone.trim()
  if (!trimmed) return true
  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/.test(trimmed)
}

export type ProfileUser = {
  name?: string | null
  email?: string | null
  phoneNumber?: string | null
  photoUrl?: string | null
}

export type ProfileEditState = {
  profileNameDraft: string | null
  profilePhoneDraft: string | null
  profileError: string | null
  phoneError: string | null
  savingProfile: boolean
  avatarPreviewOverride: string | null | undefined
  avatarError: string | null
  avatarUploading: boolean
}

export type ProfileEditAction =
  | { type: 'setProfileNameDraft'; value: string }
  | { type: 'setProfilePhoneDraft'; value: string }
  | { type: 'setProfileError'; value: string | null }
  | { type: 'setPhoneError'; value: string | null }
  | { type: 'setSavingProfile'; value: boolean }
  | { type: 'setAvatarPreviewOverride'; value: string | null | undefined }
  | { type: 'setAvatarError'; value: string | null }
  | { type: 'setAvatarUploading'; value: boolean }
  | { type: 'clearProfileErrors' }
  | { type: 'clearPhoneErrors' }
  | { type: 'commitProfileDraft'; name: string; phone: string }

export function createInitialProfileEditState(): ProfileEditState {
  return {
    profileNameDraft: null,
    profilePhoneDraft: null,
    profileError: null,
    phoneError: null,
    savingProfile: false,
    avatarPreviewOverride: undefined,
    avatarError: null,
    avatarUploading: false,
  }
}

export function profileEditReducer(state: ProfileEditState, action: ProfileEditAction): ProfileEditState {
  switch (action.type) {
    case 'setProfileNameDraft':
      return { ...state, profileNameDraft: action.value, profileError: null }
    case 'setProfilePhoneDraft':
      return { ...state, profilePhoneDraft: action.value, phoneError: null, profileError: null }
    case 'setProfileError':
      return { ...state, profileError: action.value }
    case 'setPhoneError':
      return { ...state, phoneError: action.value }
    case 'setSavingProfile':
      return { ...state, savingProfile: action.value }
    case 'setAvatarPreviewOverride':
      return { ...state, avatarPreviewOverride: action.value }
    case 'setAvatarError':
      return { ...state, avatarError: action.value }
    case 'setAvatarUploading':
      return { ...state, avatarUploading: action.value }
    case 'clearProfileErrors':
      return { ...state, profileError: null }
    case 'clearPhoneErrors':
      return { ...state, phoneError: null }
    case 'commitProfileDraft':
      return {
        ...state,
        profileNameDraft: action.name,
        profilePhoneDraft: action.phone,
      }
    default:
      return state
  }
}
