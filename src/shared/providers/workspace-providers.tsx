'use client';

import { type ReactNode } from 'react';
import { ClientProvider } from '@/shared/contexts/client-context';

type WorkspaceProvidersProps = {
  children: ReactNode;
  enablePreview?: boolean;
  enableProject?: boolean;
  enablePreferences?: boolean;
};

/**
 * Single provider wrapper for the workspace area.
 * All other contexts (preview, project, preferences, navigation) are now
 * plain hooks — no provider nesting needed.
 */
export function WorkspaceProviders({ children }: WorkspaceProvidersProps) {
  return <ClientProvider>{children}</ClientProvider>;
}
