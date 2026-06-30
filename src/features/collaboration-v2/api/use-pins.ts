'use client';

import { useMutation } from 'convex/react';
import { api as generatedApi } from '/_generated/api';

export function usePinMessage() {
  return useMutation(generatedApi.collaborationMessages.pinMessage);
}

export function useUnpinMessage() {
  return useMutation(generatedApi.collaborationMessages.unpinMessage);
}
