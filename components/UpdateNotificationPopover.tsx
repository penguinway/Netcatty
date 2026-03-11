/**
 * UpdateNotificationPopover
 *
 * Renders the Bell icon button in the top bar with a colored badge dot
 * when an update is available/downloading/ready/errored. Clicking opens
 * a Radix Popover showing live update status and dismiss/install actions.
 *
 * Badge colors:
 *   ready       → green
 *   error       → red (destructive)
 *   downloading → blue + animate-pulse
 *   hasUpdate   → blue
 */
import { ArrowUpCircle, Bell, CheckCircle, Download, Loader2, XCircle } from 'lucide-react';
import React from 'react';
import { useI18n } from '../application/i18n/I18nProvider';
import type { UpdateState } from '../application/state/useUpdateCheck';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface UpdateNotificationPopoverProps {
  updateState: UpdateState;
  onDismissUpdate: () => void;
  onInstallUpdate: () => void;
  onOpenReleasePage: () => void;
  onRetryUpdateCheck?: () => void;
}

export const UpdateNotificationPopover: React.FC<UpdateNotificationPopoverProps> = ({
  updateState,
  onDismissUpdate,
  onInstallUpdate,
  onOpenReleasePage,
  onRetryUpdateCheck,
}) => {
  const { t } = useI18n();
  const { hasUpdate, autoDownloadStatus, downloadPercent, downloadError, isChecking, latestRelease } =
    updateState;

  const version = latestRelease?.version ?? '';

  // Badge is visible whenever there is actionable update state
  const showBadge =
    hasUpdate ||
    autoDownloadStatus === 'downloading' ||
    autoDownloadStatus === 'ready' ||
    autoDownloadStatus === 'error';

  const badgeClass =
    autoDownloadStatus === 'ready'
      ? 'bg-green-500'
      : autoDownloadStatus === 'error'
        ? 'bg-destructive'
        : 'bg-blue-500';

  // Pulse only during active download
  const badgePulse = autoDownloadStatus === 'downloading';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-6 w-6 text-muted-foreground hover:text-foreground app-no-drag"
          title={t('notification.title')}
          aria-label={t('notification.title')}
        >
          <Bell size={16} />
          {showBadge && (
            <span
              className={cn(
                'absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full',
                badgeClass,
                badgePulse && 'animate-pulse',
              )}
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-72 p-0">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-border/60">
          <p className="text-sm font-semibold">{t('notification.title')}</p>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-3">

          {/* ── Downloading ───────────────────────────────────── */}
          {autoDownloadStatus === 'downloading' && (
            <>
              <div className="flex items-center gap-2">
                <Download size={14} className="text-blue-500 shrink-0" />
                <p className="text-sm font-medium">{t('notification.updateAvailable')}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('notification.downloading').replace(
                  '{version}',
                  version || t('notification.newVersion'),
                )}
              </p>
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${downloadPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {t('notification.downloadProgress').replace('{percent}', String(downloadPercent))}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={onDismissUpdate}
              >
                {t('notification.ignoreVersion')}
              </Button>
            </>
          )}

          {/* ── Ready to install ──────────────────────────────── */}
          {autoDownloadStatus === 'ready' && (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500 shrink-0" />
                <p className="text-sm font-medium">{t('notification.readyToInstall')}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('notification.readyBody').replace('{version}', version)}
              </p>
              <div className="flex gap-2">
                <Button variant="default" size="sm" className="flex-1" onClick={onInstallUpdate}>
                  {t('update.restartNow')}
                </Button>
                <Button variant="ghost" size="sm" onClick={onDismissUpdate}>
                  {t('notification.ignoreVersion')}
                </Button>
              </div>
            </>
          )}

          {/* ── Download error ────────────────────────────────── */}
          {autoDownloadStatus === 'error' && (
            <>
              <div className="flex items-center gap-2">
                <XCircle size={14} className="text-destructive shrink-0" />
                <p className="text-sm font-medium">{t('notification.downloadFailed')}</p>
              </div>
              {downloadError && (
                <p className="text-xs text-muted-foreground line-clamp-2">{downloadError}</p>
              )}
              <div className="flex gap-2">
                {onRetryUpdateCheck && (
                  <Button variant="outline" size="sm" onClick={() => onRetryUpdateCheck()}>
                    {t('notification.checkAgain')}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onOpenReleasePage}>
                  {t('update.openReleases')}
                </Button>
              </div>
            </>
          )}

          {/* ── Update available, auto-download idle ─────────── */}
          {autoDownloadStatus === 'idle' && hasUpdate && (
            <>
              <div className="flex items-center gap-2">
                <ArrowUpCircle size={14} className="text-blue-500 shrink-0" />
                <p className="text-sm font-medium">{t('notification.updateAvailable')}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('notification.available').replace('{version}', version)}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onOpenReleasePage}>
                  {t('update.openReleases')}
                </Button>
                <Button variant="ghost" size="sm" onClick={onDismissUpdate}>
                  {t('notification.ignoreVersion')}
                </Button>
              </div>
            </>
          )}

          {/* ── Idle / no update ──────────────────────────────── */}
          {autoDownloadStatus === 'idle' && !hasUpdate && (
            <div className="flex items-center gap-2">
              {isChecking ? (
                <>
                  <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">{t('notification.checking')}</p>
                </>
              ) : (
                <>
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                  <p className="text-sm text-muted-foreground">{t('notification.upToDate')}</p>
                </>
              )}
            </div>
          )}

        </div>
      </PopoverContent>
    </Popover>
  );
};
