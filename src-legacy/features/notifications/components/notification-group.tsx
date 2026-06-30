'use client';
import type { WorkspaceNotification } from '@/types/notifications';
import type { GroupedNotifications } from '../lib/group-notifications';
import { NotificationItem } from './notification-item';
type NotificationGroupListProps = {
    groups: GroupedNotifications;
    compact?: boolean;
    selectedIds?: Set<string>;
    ackInFlight?: boolean;
    onOpen?: (notification: WorkspaceNotification) => void;
    onDismiss?: (id: string, title?: string) => void;
    onMarkRead?: (id: string, title?: string) => void;
    onSelectToggle?: (id: string) => void;
};
export function NotificationGroupList({ groups, compact = false, selectedIds, ackInFlight, onOpen, onDismiss, onMarkRead, onSelectToggle, }: NotificationGroupListProps) {
    return (<div className="flex flex-col">
      {groups.map((group) => (<section key={group.key} className="flex flex-col">
          <h3 className={compact
                ? 'sticky top-0 z-10 border-b border-border/50 bg-popover/95 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm'
                : 'px-1 pb-2 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground'}>
            {group.label}
          </h3>
          {group.items.map((notification) => (<NotificationItem key={notification.id} notification={notification} compact={compact} selected={selectedIds?.has(notification.id)} ackInFlight={ackInFlight} onOpen={onOpen} onDismiss={onDismiss} onMarkRead={onMarkRead} onSelectToggle={onSelectToggle}/>))}
        </section>))}
    </div>);
}
