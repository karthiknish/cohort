'use client';

import { useCallback, useRef, useState } from 'react';
import { useConvex } from 'convex/react';
import { proposalArchivesApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { buildDownloadUrl } from '@/lib/build-download-url';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';

interface DownloadFileOptions {
  /** The original (non-proxied) storage URL to download. */
  url: string;
  /** Desired filename for the saved file. */
  filename: string;
  /** Workspace ID — needed to call refreshSignedUrl. Falls back to auth context. */
  workspaceId?: string | null;
}

export interface UseDownloadFileReturn {
  /** Triggers a download. Returns true on success. */
  download: (opts: DownloadFileOptions) => Promise<boolean>;
  /** True while a download is in progress. */
  isDownloading: boolean;
}

/**
 * Download a file through the /api/proxy/file endpoint with automatic
 * expired-URL recovery.
 *
 * When the R2 signed URL has expired (503 FILE_URL_EXPIRED), the hook
 * calls the Convex `refreshSignedUrl` action to generate a fresh signed
 * URL and retries the download automatically.
 *
 * On success, a blob download is triggered in the browser. On failure,
 * a user-friendly toast notification is shown.
 *
 * @returns `{ download, isDownloading }` — use `isDownloading` for button
 *   loader states.
 */
export function useDownloadFile(): UseDownloadFileReturn {
  const convex = useConvex();
  const { user } = useAuth();
  const { selectedClient } = useClientContext();
  const fallbackWorkspaceId = selectedClient?.workspaceId ?? user?.agencyId ?? null;
  const inFlightRef = useRef(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(
    async ({ url, filename, workspaceId }: DownloadFileOptions): Promise<boolean> => {
      if (!url) return false;
      if (inFlightRef.current) {
        notifyFailure({
          title: 'Download in progress',
          message: 'Please wait for the current download to finish.',
        });
        return false;
      }

      inFlightRef.current = true;
      setIsDownloading(true);
      const wsId = workspaceId ?? fallbackWorkspaceId;

      try {
        let currentUrl = url;
        let success = false;

        for (let attempt = 0; attempt < 2 && !success; attempt++) {
          const proxyUrl = buildDownloadUrl(currentUrl, filename);
          if (!proxyUrl) {
            notifyFailure({ title: 'Download failed', message: 'Invalid file URL.' });
            return false;
          }

          const response = await fetch(proxyUrl, {
            method: 'GET',
            credentials: 'include',
          });

          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            anchor.download = filename;
            anchor.style.display = 'none';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            // Revoke after a delay to ensure the download has started
            setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
            success = true;
            break;
          }

          // Check for expired URL
          if (response.status === 503) {
            const errorData = await response.json().catch(() => ({}));
            const errorCode = (errorData as { error?: string }).error;

            if (errorCode === 'FILE_URL_EXPIRED' && wsId && attempt === 0) {
              // Try to refresh the signed URL
              try {
                const result = await convex.action(proposalArchivesApi.refreshSignedUrl, {
                  workspaceId: wsId,
                  url: currentUrl,
                });
                const freshUrl =
                  typeof result === 'string'
                    ? result
                    : result && typeof result === 'object' && 'data' in result
                      ? (result as { data: string | null }).data
                      : null;

                if (freshUrl && freshUrl !== currentUrl) {
                  currentUrl = freshUrl;
                  continue; // retry with fresh URL
                }
              } catch (refreshErr) {
                logError(refreshErr, '[useDownloadFile] refreshSignedUrl failed');
              }
            }

            // 503 but can't refresh or refresh failed
            notifyFailure({
              title: 'Download link expired',
              message: 'The download link has expired. Please refresh the page and try again.',
            });
            return false;
          }

          if (response.status === 401 || response.status === 403) {
            notifyFailure({
              title: 'Access denied',
              message: 'You may not have permission to download this file.',
            });
            return false;
          }

          // Other errors
          notifyFailure({
            title: 'Download failed',
            message: `Unable to download file (HTTP ${response.status}). Please try again.`,
          });
          return false;
        }

        if (success) {
          notifySuccess({ message: `Downloaded ${filename}` });
          return true;
        }

        return false;
      } catch (err) {
        logError(err, '[useDownloadFile] Unexpected error');
        notifyFailure({
          title: 'Download failed',
          message: asErrorMessage(err),
        });
        return false;
      } finally {
        inFlightRef.current = false;
        setIsDownloading(false);
      }
    },
    [convex, fallbackWorkspaceId],
  );

  return { download, isDownloading };
}
