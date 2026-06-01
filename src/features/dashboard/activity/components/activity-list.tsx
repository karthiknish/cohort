'use client';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { EnhancedActivity, SortOption, DateRangeOption, ActivityType, StatusFilter } from '../types';
import { ActivityListEmptyState, ActivityListErrorState, ActivityListGroupedBody, ActivityListLoadMoreFooter, ActivityListLoadingSkeleton, ActivityListSelectAllHeader, ActivityListVirtualizedBody, useActivityListClearFilters, useActivityListData, useActivityListInfiniteScroll, } from './activity-list-sections';
interface ActivityListProps {
    activities: EnhancedActivity[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    searchQuery: string;
    typeFilter: ActivityType | 'all';
    dateRange: DateRangeOption;
    statusFilter: StatusFilter;
    sortBy: SortOption;
    onRetry: () => void;
    onLoadMore: () => void;
    onTogglePin: (id: string) => void;
    onMarkAsRead: (id: string) => void;
    onAddReaction: (id: string, emoji: string) => void;
    onAddComment: (activityId: string, text: string) => void;
    onViewDetails: (activity: EnhancedActivity) => void;
    selectedActivities: Set<string>;
    onSelectionChange: (id: string, checked: boolean) => void;
    onSelectAll: () => void;
    comments: Record<string, Array<{
        id: string;
        userId: string;
        userName: string;
        text: string;
        timestamp: string;
    }>>;
    currentUserName?: string;
    className?: string;
}
export function ActivityList({ activities, loading, error, hasMore, searchQuery, typeFilter, dateRange, statusFilter, sortBy, onRetry, onLoadMore, onTogglePin, onMarkAsRead, onAddReaction, onAddComment, onViewDetails, selectedActivities, onSelectionChange, onSelectAll, comments, currentUserName, className, }: ActivityListProps) {
    const [showReactions, setShowReactions] = useState<string | null>(null);
    const handleClearFilters = useActivityListClearFilters();
    const observerTargetRef = useActivityListInfiniteScroll({ hasMore, loading, onLoadMore });
    const { sortedActivities, groupedActivities, groupKeys, activityFlatRows, shouldVirtualizeActivity, activityScrollRef, activityVirtualizer, virtualContainerStyle, } = useActivityListData({ activities, typeFilter, searchQuery, statusFilter, sortBy });
    const itemHandlers = ({
        selectedActivities,
        showReactions,
        comments,
        onSelectionChange,
        onTogglePin,
        onMarkAsRead,
        onAddReaction,
        onAddComment,
        onShowReactionsChange: setShowReactions,
        onViewDetails,
        currentUserName,
    });
    return (<div className={cn('space-y-4', className)}>
      <ActivityListSelectAllHeader sortedCount={sortedActivities.length} selectedCount={selectedActivities.size} onSelectAll={onSelectAll}/>

      <div ref={shouldVirtualizeActivity ? activityScrollRef : undefined} className="h-[500px] sm:h-[600px] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {loading && sortedActivities.length === 0 ? (<ActivityListLoadingSkeleton />) : error ? (<ActivityListErrorState error={error} onRetry={onRetry}/>) : sortedActivities.length === 0 ? (<ActivityListEmptyState searchQuery={searchQuery} typeFilter={typeFilter} dateRange={dateRange} statusFilter={statusFilter} onClearFilters={handleClearFilters}/>) : shouldVirtualizeActivity ? (<ActivityListVirtualizedBody activityFlatRows={activityFlatRows} activityVirtualizer={activityVirtualizer} virtualContainerStyle={virtualContainerStyle} handlers={itemHandlers}/>) : (<ActivityListGroupedBody groupKeys={groupKeys} groupedActivities={groupedActivities} handlers={itemHandlers}/>)}

          <ActivityListLoadMoreFooter hasMore={hasMore} loading={loading} sortedCount={sortedActivities.length} observerTargetRef={observerTargetRef} onLoadMore={onLoadMore}/>
        </div>
      </div>
    </div>);
}
