import { formatProviderName } from '@/lib/themes';
import type { AgentDataSection, ListItem, MetricItem } from './types';
import { asNumber, asRecord, asRecordArray, asString, buildMetricsFromAnalyticsTotals, buildMetricsFromTotals, compact, formatCurrency, formatCtrPercent, formatDateValue, formatDeltaPercent, formatLabel, formatPercent, formatRatio, formatTaskDueDate, formatWholeNumber, getDeltaTone, resolveCurrencyCode, resolveMetricsAvailable, resolveTotals, } from './helpers';
export function buildAgentDataSections(operation: string | undefined, data: Record<string, unknown> | undefined): AgentDataSection[] {
    if (!data)
        return [];
    const sections: AgentDataSection[] = [];
    const details: MetricItem[] = [];
    const periodLabel = asString(data.periodLabel);
    const providerLabel = asString(data.providerLabel);
    const startDate = asString(data.startDate);
    const endDate = asString(data.endDate);
    const comparison = asRecord(data.comparison);
    const previousWindow = asRecord(comparison?.previousWindow) ?? asRecord(data.previousWindow);
    const campaignQuery = asString(data.campaignQuery);
    const matchedCampaignCount = asNumber(data.matchedCampaignCount);
    const metricsAvailable = resolveMetricsAvailable(data);
    const currencyCode = resolveCurrencyCode(data);
    const dataKind = asString(data.dataKind);
    const isAnalytics = operation === 'summarizeAnalyticsPerformance' || dataKind === 'analytics';
    const isSocial = operation === 'summarizeSocialPerformance' || dataKind === 'social';
    if (periodLabel)
        details.push({ label: 'Window', value: periodLabel });
    if (startDate || endDate)
        details.push({ label: 'Dates', value: startDate && endDate ? `${startDate} → ${endDate}` : startDate ?? endDate ?? '' });
    if (providerLabel)
        details.push({ label: 'Source', value: providerLabel });
    if (currencyCode && currencyCode !== 'USD')
        details.push({ label: 'Currency', value: currencyCode });
    if (metricsAvailable === false) {
        details.push({
            label: isAnalytics ? 'Analytics Data' : isSocial ? 'Social Data' : 'Ads Data',
            value: isAnalytics
                ? 'No synced Google Analytics traffic in this window'
                : isSocial
                    ? 'No synced organic social metrics in this window'
                    : 'No synced metrics in this window',
        });
    }
    if (campaignQuery)
        details.push({ label: 'Campaign Filter', value: campaignQuery });
    if (matchedCampaignCount !== null)
        details.push({ label: 'Matches', value: formatWholeNumber(matchedCampaignCount) });
    if (previousWindow) {
        const prevStart = asString(previousWindow.startDate);
        const prevEnd = asString(previousWindow.endDate);
        if (prevStart || prevEnd) {
            details.push({ label: 'Compared To', value: prevStart && prevEnd ? `${prevStart} → ${prevEnd}` : prevStart ?? prevEnd ?? '' });
        }
    }
    const campaignCounts = asRecord(data.campaignCounts);
    if (campaignCounts && !isAnalytics) {
        const active = asNumber(campaignCounts.active);
        const paused = asNumber(campaignCounts.paused);
        const total = asNumber(campaignCounts.total);
        if (total !== null)
            details.push({ label: 'Campaigns', value: `${formatWholeNumber(total)} total` });
        if (active !== null)
            details.push({ label: 'Active', value: formatWholeNumber(active) });
        if (paused !== null)
            details.push({ label: 'Paused', value: formatWholeNumber(paused) });
    }
    const currentSituation = asString(data.currentSituation);
    if (currentSituation) {
        sections.push({
            type: 'metrics',
            title: 'Insight',
            items: [{ label: 'Summary', value: currentSituation }],
        });
    }
    if (details.length > 0)
        sections.push({ type: 'metrics', title: 'Overview', items: details });
    const metricsScopeNote = asString(data.metricsScopeNote);
    const syncHint = asString(data.syncHint);
    const syncTimeframeDays = asNumber(data.syncTimeframeDays);
    const suggestedActionRoute = asString(data.suggestedActionRoute);
    const insightsWarnings = Array.isArray(data.insightsWarnings)
        ? data.insightsWarnings.flatMap((warning) => {
            const message = asString(warning);
            return message ? [message] : [];
        })
        : [];
    const syncedDays = asNumber(data.syncedDays);
    if (metricsScopeNote)
        details.push({ label: 'Scope', value: metricsScopeNote });
    if (syncTimeframeDays !== null) {
        details.push({ label: 'Sync Window', value: `Last ${formatWholeNumber(syncTimeframeDays)} days` });
    }
    if (syncHint)
        details.push({ label: 'Sync', value: syncHint });
    if (suggestedActionRoute)
        details.push({ label: 'Open', value: suggestedActionRoute });
    if (syncedDays !== null && isAnalytics) {
        details.push({ label: 'Synced Days', value: formatWholeNumber(syncedDays) });
    }
    for (const warning of insightsWarnings.slice(0, 2)) {
        details.push({ label: 'Note', value: warning });
    }
    const totalsMetrics = isAnalytics
        ? buildMetricsFromAnalyticsTotals(asRecord(data.totals), comparison, currencyCode)
        : isSocial
            ? []
            : buildMetricsFromTotals(resolveTotals(data), comparison, currencyCode);
    if (totalsMetrics.length > 0 && metricsAvailable !== false) {
        sections.push({ type: 'metrics', title: isAnalytics ? 'Traffic & Conversions' : 'Performance', items: totalsMetrics });
    }
    const providerBreakdown = asRecordArray(data.providerBreakdown);
    if (providerBreakdown.length > 0 && metricsAvailable !== false && !isAnalytics && !isSocial) {
        sections.push({
            type: 'list',
            title: 'Platform Breakdown',
            items: providerBreakdown.slice(0, 4).map<ListItem>((provider) => {
                const providerId = asString(provider.providerId) ?? 'unknown';
                const totals = asRecord(provider.totals);
                const deltaPercent = asRecord(provider.deltaPercent);
                const spend = asNumber(totals?.spend);
                const roas = asNumber(totals?.roas);
                const conversionsValue = asNumber(totals?.conversions);
                const deltaValue = asNumber(deltaPercent?.roas) ?? asNumber(deltaPercent?.revenue) ?? asNumber(deltaPercent?.spend);
                return {
                    primary: asString(provider.label) ?? formatProviderName(providerId),
                    secondary: [
                        spend !== null ? formatCurrency(spend, currencyCode) : null,
                        roas !== null ? `${formatRatio(roas)} ROAS` : null,
                        conversionsValue !== null ? `${formatWholeNumber(conversionsValue)} conv` : null,
                    ].filter((item): item is string => Boolean(item)).join(' • ') || undefined,
                    numericValue: spend ?? undefined,
                    delta: formatDeltaPercent(deltaValue),
                    deltaTone: getDeltaTone(deltaValue),
                };
            }),
        });
    }
    const activeCampaigns = asRecordArray(data.activeCampaigns);
    if (activeCampaigns.length > 0 && !isAnalytics && !isSocial) {
        sections.push({
            type: 'list',
            title: campaignQuery ? 'Matching Campaigns' : 'Active Campaigns',
            items: activeCampaigns.slice(0, 6).map<ListItem>((campaign) => ({
                primary: asString(campaign.name) ?? 'Unnamed campaign',
                secondary: formatProviderName(asString(campaign.providerId) ?? 'unknown'),
                href: asString(campaign.route),
            })),
        });
    }
    const currencyBreakdown = asRecordArray(data.currencyBreakdown);
    if (currencyBreakdown.length > 0 && !isAnalytics && !isSocial) {
        sections.push({
            type: 'list',
            title: 'Spend by currency',
            items: currencyBreakdown.map<ListItem>((row) => {
                const currency = asString(row.currency) ?? 'USD';
                const spend = asNumber(row.spend);
                const revenue = asNumber(row.revenue);
                return {
                    primary: currency,
                    secondary: [
                        spend !== null ? `${formatCurrency(spend, currency)} spend` : null,
                        revenue !== null ? `${formatCurrency(revenue, currency)} revenue` : null,
                    ]
                        .filter((item): item is string => Boolean(item))
                        .join(' • ') || undefined,
                    numericValue: spend ?? undefined,
                };
            }),
        });
    }
    const topCampaigns = asRecordArray(data.topCampaigns);
    if (topCampaigns.length > 0 && !isAnalytics && !isSocial) {
        sections.push({
            type: 'list',
            title: 'Top Campaigns',
            items: topCampaigns.slice(0, 5).map<ListItem>((campaign) => {
                const spend = asNumber(campaign.spend);
                const roas = asNumber(campaign.roas);
                const conversions = asNumber(campaign.conversions);
                const pieces = [
                    spend !== null ? formatCurrency(spend, currencyCode) : null,
                    roas !== null ? `${formatRatio(roas)} ROAS` : null,
                    conversions !== null ? `${formatWholeNumber(conversions)} conv` : null,
                ].filter((item): item is string => Boolean(item));
                return {
                    primary: asString(campaign.name) ?? 'Unnamed campaign',
                    secondary: pieces.join(' • ') || undefined,
                    href: asString(campaign.route),
                    numericValue: spend ?? undefined,
                };
            }),
        });
    }
    if (operation === 'summarizeSocialPerformance') {
        const connection = asRecord(data.connection);
        const connectionItems = compact<MetricItem>([
            connection?.connected === true
                ? { label: 'Meta', value: 'Connected', emphasis: 'primary' }
                : { label: 'Meta', value: 'Not connected' },
            asString(connection?.facebookPageName)
                ? { label: 'Facebook Page', value: asString(connection?.facebookPageName)! }
                : null,
            asString(connection?.instagramBusinessName)
                ? { label: 'Instagram', value: asString(connection?.instagramBusinessName)! }
                : null,
            asString(connection?.lastSyncStatus)
                ? { label: 'Sync', value: formatLabel(asString(connection?.lastSyncStatus)!) }
                : null,
        ]);
        if (connectionItems.length > 0) {
            sections.push({ type: 'metrics', title: 'Connection', items: connectionItems });
        }
        const appendSurfaceMetrics = (surface: Record<string, unknown> | null, title: string) => {
            if (!surface)
                return;
            const reach = asNumber(surface.reach);
            const engagedUsers = asNumber(surface.engagedUsers);
            const impressions = asNumber(surface.impressions);
            const engagementRate = asNumber(surface.engagementRate);
            const followerDelta = asNumber(surface.followerDeltaTotal);
            const items = compact<MetricItem>([
                reach !== null ? { label: 'Reach', value: formatWholeNumber(reach), numericValue: reach, emphasis: 'primary' } : null,
                impressions !== null ? { label: 'Impressions', value: formatWholeNumber(impressions), numericValue: impressions } : null,
                engagedUsers !== null ? { label: 'Engaged Users', value: formatWholeNumber(engagedUsers), numericValue: engagedUsers } : null,
                engagementRate !== null ? { label: 'Engagement Rate', value: formatPercent(engagementRate), numericValue: engagementRate } : null,
                followerDelta !== null && followerDelta !== 0
                    ? {
                        label: 'Follower Change',
                        value: `${followerDelta > 0 ? '+' : ''}${formatWholeNumber(followerDelta)}`,
                        numericValue: followerDelta,
                    }
                    : null,
            ]);
            if (items.length > 0)
                sections.push({ type: 'metrics', title, items });
        };
        appendSurfaceMetrics(asRecord(data.facebook), 'Facebook');
        appendSurfaceMetrics(asRecord(data.instagram), 'Instagram');
        const topContent = asRecord(data.topContent);
        for (const surface of ['facebook', 'instagram'] as const) {
            const posts = asRecordArray(topContent?.[surface]);
            if (posts.length === 0)
                continue;
            sections.push({
                type: 'list',
                title: `Top ${formatLabel(surface)} Posts`,
                items: posts.map<ListItem>((post) => {
                    const reach = asNumber(post.reach);
                    const engaged = asNumber(post.engagedUsers);
                    const preview = asString(post.message);
                    return {
                        primary: preview && preview.length > 0 ? (preview.length > 72 ? `${preview.slice(0, 69)}…` : preview) : 'Post',
                        secondary: [
                            reach !== null ? `${formatWholeNumber(reach)} reach` : null,
                            engaged !== null ? `${formatWholeNumber(engaged)} engaged` : null,
                            asString(post.publishedAt) ? asString(post.publishedAt)! : null,
                        ].filter((item): item is string => Boolean(item)).join(' • ') || undefined,
                    };
                }),
            });
        }
    }
    if (operation === 'requestSocialSync') {
        const jobId = asString(data.jobId);
        const timeframeDays = asNumber(data.timeframeDays);
        const surface = asString(data.surface);
        const syncItems = compact<MetricItem>([
            jobId ? { label: 'Sync Job', value: jobId } : null,
            timeframeDays !== null ? { label: 'Window', value: `Last ${formatWholeNumber(timeframeDays)} days` } : null,
            surface ? { label: 'Surfaces', value: formatLabel(surface) } : null,
        ]);
        if (syncItems.length > 0)
            sections.push({ type: 'metrics', title: 'Sync Requested', items: syncItems });
    }
    const proposalSummary = asRecord(data.proposalSummary);
    const delivery = asRecord(data.delivery);
    const reportItems: MetricItem[] = [];
    const totalSubmitted = asNumber(proposalSummary?.totalSubmitted);
    const aiSuccessRate = asNumber(proposalSummary?.aiSuccessRate);
    const deliveredInApp = typeof delivery?.inApp === 'boolean' ? delivery.inApp : null;
    if (metricsAvailable === false)
        reportItems.push({ label: 'Ads Data', value: 'Awaiting synced metrics' });
    if (totalSubmitted !== null)
        reportItems.push({ label: 'Proposals', value: formatWholeNumber(totalSubmitted), numericValue: totalSubmitted });
    if (aiSuccessRate !== null)
        reportItems.push({ label: 'AI Success', value: formatPercent(aiSuccessRate), numericValue: aiSuccessRate });
    if (deliveredInApp !== null)
        reportItems.push({ label: 'In-app Delivery', value: deliveredInApp ? 'Delivered' : 'Not delivered' });
    if (operation === 'generatePerformanceReport' && reportItems.length > 0) {
        sections.push({ type: 'metrics', title: 'Report Highlights', items: reportItems });
    }
    const totalTasks = asNumber(data.totalTasks);
    const openTasks = asNumber(data.openTasks);
    const completedTasks = asNumber(data.completedTasks);
    const overdueTasks = asNumber(data.overdueTasks);
    const dueSoonTasks = asNumber(data.dueSoonTasks);
    const highPriorityTasks = asNumber(data.highPriorityTasks);
    const clientName = asString(data.clientName);
    if (operation === 'summarizeClientTasks' || operation === 'summarizeMyTasks') {
        const timeWindowLabel = asString(data.timeWindowLabel);
        const dueThisWeekTasks = asNumber(data.dueThisWeekTasks);
        const unscheduledOpen = asNumber(data.unscheduledOpen);
        const taskSummaryItems = compact<MetricItem>([
            clientName ? { label: 'Client', value: clientName } : null,
            timeWindowLabel ? { label: 'Focus', value: timeWindowLabel } : null,
            totalTasks !== null ? { label: 'Total Tasks', value: formatWholeNumber(totalTasks), numericValue: totalTasks, emphasis: 'primary' } : null,
            openTasks !== null ? { label: 'Open', value: formatWholeNumber(openTasks), numericValue: openTasks, emphasis: 'primary' } : null,
            completedTasks !== null ? { label: 'Completed', value: formatWholeNumber(completedTasks), numericValue: completedTasks } : null,
            overdueTasks !== null ? { label: 'Overdue', value: formatWholeNumber(overdueTasks), numericValue: overdueTasks } : null,
            dueThisWeekTasks !== null ? { label: 'Due This Week', value: formatWholeNumber(dueThisWeekTasks), numericValue: dueThisWeekTasks } : null,
            dueSoonTasks !== null ? { label: 'Due Soon', value: formatWholeNumber(dueSoonTasks), numericValue: dueSoonTasks } : null,
            highPriorityTasks !== null ? { label: 'High Priority', value: formatWholeNumber(highPriorityTasks), numericValue: highPriorityTasks } : null,
            unscheduledOpen !== null && unscheduledOpen > 0
                ? { label: 'No Due Date', value: formatWholeNumber(unscheduledOpen), numericValue: unscheduledOpen }
                : null,
        ]);
        if (taskSummaryItems.length > 0) {
            sections.push({ type: 'metrics', title: 'Task Summary', items: taskSummaryItems });
        }
        const statusBreakdown = asRecordArray(data.statusBreakdown);
        if (statusBreakdown.length > 0) {
            sections.push({
                type: 'metrics',
                title: 'Status Breakdown',
                items: statusBreakdown.slice(0, 5).map((entry) => ({
                    label: formatLabel(asString(entry.status) ?? 'unknown'),
                    value: formatWholeNumber(asNumber(entry.count) ?? 0),
                    numericValue: asNumber(entry.count) ?? 0,
                })),
            });
        }
        const mapTaskListItems = (tasks: Record<string, unknown>[]) => tasks.slice(0, 8).map<ListItem>((task) => {
            const status = asString(task.status);
            const priority = asString(task.priority);
            const dueLabel = asString(task.dueLabel);
            const dueDate = dueLabel ?? formatTaskDueDate(asNumber(task.dueDate) ?? asString(task.dueDate));
            const taskClientName = asString(task.clientName);
            const projectName = asString(task.projectName);
            const assignedTo = Array.isArray(task.assignedTo)
                ? task.assignedTo.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
                : [];
            const secondary = [
                dueDate,
                status ? formatLabel(status) : null,
                priority ? formatLabel(priority) : null,
                taskClientName,
                projectName,
                assignedTo.length > 0 ? assignedTo.join(', ') : null,
            ].filter((item): item is string => Boolean(item)).join(' • ');
            return {
                primary: asString(task.title) ?? 'Untitled task',
                secondary: secondary || undefined,
            };
        });
        const focusTasks = asRecordArray(data.focusTasks);
        const timeWindow = asString(data.timeWindow);
        if (focusTasks.length > 0 && timeWindow && timeWindow !== 'all') {
            sections.push({
                type: 'list',
                title: timeWindowLabel ?? 'Focused Tasks',
                items: mapTaskListItems(focusTasks),
            });
        }
        const overdueTaskList = asRecordArray(data.overdueTaskList);
        if (overdueTaskList.length > 0 && timeWindow === 'all') {
            sections.push({
                type: 'list',
                title: 'Overdue',
                items: mapTaskListItems(overdueTaskList),
            });
        }
        const dueThisWeekList = asRecordArray(data.dueThisWeekList);
        if (dueThisWeekList.length > 0 && timeWindow === 'all') {
            sections.push({
                type: 'list',
                title: 'Due This Week',
                items: mapTaskListItems(dueThisWeekList),
            });
        }
        const dueSoonList = asRecordArray(data.dueSoonList);
        if (dueSoonList.length > 0) {
            sections.push({
                type: 'list',
                title: 'Due Soon',
                items: mapTaskListItems(dueSoonList),
            });
        }
        const highPriorityList = asRecordArray(data.highPriorityList);
        if (highPriorityList.length > 0) {
            sections.push({
                type: 'list',
                title: 'High Priority',
                items: mapTaskListItems(highPriorityList),
            });
        }
        const tasks = asRecordArray(data.tasks);
        if (tasks.length > 0 && (timeWindow === 'all' || focusTasks.length === 0)) {
            sections.push({
                type: 'list',
                title: 'Tasks',
                items: mapTaskListItems(tasks),
            });
        }
    }
    if (operation === 'listWorkspaceClients') {
        const total = asNumber(data.total);
        const clients = asRecordArray(data.clients);
        const clientOverview = compact<MetricItem>([
            total !== null ? { label: 'Clients', value: formatWholeNumber(total), numericValue: total, emphasis: 'primary' } : null,
        ]);
        if (clientOverview.length > 0) {
            sections.push({ type: 'metrics', title: 'Clients', items: clientOverview });
        }
        if (clients.length > 0) {
            sections.push({
                type: 'list',
                title: 'Workspace Clients',
                items: clients.slice(0, 12).map<ListItem>((client) => ({
                    primary: asString(client.name) ?? 'Unnamed client',
                    secondary: asString(client.clientId) ?? undefined,
                })),
            });
        }
    }
    if (operation === 'listActiveProjects') {
        const total = asNumber(data.total);
        const projects = asRecordArray(data.projects);
        const projectOverview = compact<MetricItem>([
            total !== null ? { label: 'Active Projects', value: formatWholeNumber(total), numericValue: total, emphasis: 'primary' } : null,
        ]);
        if (projectOverview.length > 0) {
            sections.push({ type: 'metrics', title: 'Projects', items: projectOverview });
        }
        if (projects.length > 0) {
            sections.push({
                type: 'list',
                title: 'Active Projects',
                items: projects.map<ListItem>((project) => ({
                    primary: asString(project.name) ?? 'Unnamed project',
                    secondary: [
                        asString(project.clientName),
                        asString(project.status) ? formatLabel(asString(project.status)!) : null,
                    ].filter((item): item is string => Boolean(item)).join(' • ') || undefined,
                    href: asString(project.route),
                })),
            });
        }
    }
    if (operation === 'listProposals') {
        const total = asNumber(data.total);
        const proposals = asRecordArray(data.proposals);
        const proposalOverview = compact<MetricItem>([
            total !== null ? { label: 'Proposals', value: formatWholeNumber(total), numericValue: total, emphasis: 'primary' } : null,
        ]);
        if (proposalOverview.length > 0) {
            sections.push({ type: 'metrics', title: 'Proposals', items: proposalOverview });
        }
        if (proposals.length > 0) {
            sections.push({
                type: 'list',
                title: 'Proposal Drafts',
                items: proposals.map<ListItem>((proposal) => ({
                    primary: asString(proposal.title) ?? 'Untitled proposal',
                    secondary: [
                        asString(proposal.clientName),
                        asString(proposal.status) ? formatLabel(asString(proposal.status)!) : null,
                        asNumber(proposal.stepProgress) !== null ? `${formatWholeNumber(asNumber(proposal.stepProgress)!)}% complete` : null,
                    ].filter((item): item is string => Boolean(item)).join(' • ') || undefined,
                    href: asString(proposal.route),
                })),
            });
        }
    }
    if (operation === 'summarizeMeetings') {
        const total = asNumber(data.total);
        const withNotes = asNumber(data.withNotes);
        const meetings = asRecordArray(data.meetings);
        const meetingOverview = compact<MetricItem>([
            total !== null ? { label: 'Meetings', value: formatWholeNumber(total), numericValue: total, emphasis: 'primary' } : null,
            withNotes !== null ? { label: 'With Notes', value: formatWholeNumber(withNotes), numericValue: withNotes } : null,
        ]);
        if (meetingOverview.length > 0) {
            sections.push({ type: 'metrics', title: 'Meetings', items: meetingOverview });
        }
        if (meetings.length > 0) {
            sections.push({
                type: 'list',
                title: 'Upcoming & Recent',
                items: meetings.map<ListItem>((meeting) => ({
                    primary: asString(meeting.title) ?? 'Untitled meeting',
                    secondary: [
                        asString(meeting.when),
                        asString(meeting.status) ? formatLabel(asString(meeting.status)!) : null,
                        meeting.hasTranscript === true ? 'Transcript available' : null,
                    ].filter((item): item is string => Boolean(item)).join(' • ') || undefined,
                    href: asString(meeting.route),
                })),
            });
        }
    }
    if (operation === 'markAllNotificationsRead') {
        const marked = asNumber(data.marked);
        if (marked !== null) {
            sections.push({
                type: 'metrics',
                title: 'Notifications',
                items: [{ label: 'Marked Read', value: formatWholeNumber(marked), numericValue: marked, emphasis: 'primary' }],
            });
        }
    }
    if (operation === 'requestAdsSync' ||
        operation === 'requestAnalyticsSync' ||
        operation === 'requestSocialSync') {
        const syncItems = compact<MetricItem>([
            asNumber(data.syncTimeframeDays) !== null
                ? { label: 'Sync Window', value: `Last ${formatWholeNumber(asNumber(data.syncTimeframeDays)!)} days` }
                : null,
            asString(data.surface) ? { label: 'Surface', value: formatLabel(asString(data.surface)!) } : null,
            asString(data.syncHint) ? { label: 'Status', value: asString(data.syncHint)! } : null,
            asString(data.jobId) ? { label: 'Job', value: asString(data.jobId)! } : null,
            asString(data.suggestedActionRoute) ? { label: 'Open', value: asString(data.suggestedActionRoute)! } : null,
        ]);
        if (syncItems.length > 0) {
            sections.push({ type: 'metrics', title: 'Sync', items: syncItems });
        }
    }
    if (operation === 'generatePerformanceReport') {
        const reportText = asString(data.reportText);
        if (reportText) {
            const preview = reportText.length > 480 ? `${reportText.slice(0, 477)}…` : reportText;
            sections.push({
                type: 'metrics',
                title: 'Report',
                items: [{ label: 'Summary', value: preview }],
            });
        }
    }
    if (operation === 'createProject' || operation === 'updateProject') {
        const projectName = asString(data.name);
        const projectId = asString(data.projectId);
        const projectStatus = asString(data.status);
        const projectClientName = asString(data.clientName);
        const startDateValue = formatDateValue(asNumber(data.startDateMs) ?? asString(data.startDate));
        const endDateValue = formatDateValue(asNumber(data.endDateMs) ?? asString(data.endDate));
        const tags = Array.isArray(data.tags)
            ? data.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
            : [];
        const updatedFields = Array.isArray(data.updatedFields)
            ? data.updatedFields.filter((field): field is string => typeof field === 'string' && field.trim().length > 0)
            : [];
        const projectItems = compact<MetricItem>([
            projectName ? { label: 'Project', value: projectName } : null,
            projectId ? { label: 'Project ID', value: projectId } : null,
            projectStatus ? { label: 'Status', value: formatLabel(projectStatus) } : null,
            projectClientName ? { label: 'Client', value: projectClientName } : null,
            startDateValue ? { label: 'Start Date', value: startDateValue } : null,
            endDateValue ? { label: 'End Date', value: endDateValue } : null,
            tags.length > 0 ? { label: 'Tags', value: tags.join(', ') } : null,
        ]);
        if (projectItems.length > 0) {
            sections.push({ type: 'metrics', title: 'Project Details', items: projectItems });
        }
        if (updatedFields.length > 0) {
            sections.push({
                type: 'list',
                title: 'Updated Fields',
                items: updatedFields.map((field) => ({ primary: formatLabel(field) })),
            });
        }
    }
    const needsGenericDetails = sections.length === 0 ||
        operation === 'createTask' ||
        operation === 'sendDirectMessage' ||
        operation === 'createClient' ||
        operation === 'addClientTeamMember' ||
        operation === 'updateTask' ||
        operation === 'createProposalDraft' ||
        operation === 'generateProposalFromDraft' ||
        operation === 'updateProposalDraft' ||
        operation === 'updateAdsCampaignStatus' ||
        operation === 'updateAdsCreativeStatus';
    if (needsGenericDetails) {
        const title = asString(data.title) ?? asString(data.name);
        const taskId = asString(data.taskId);
        const projectId = asString(data.projectId);
        const clientId = asString(data.clientId);
        const proposalId = asString(data.proposalId);
        const campaignId = asString(data.campaignId);
        const creativeId = asString(data.creativeId);
        const providerId = asString(data.providerId);
        const recipientName = asString(data.recipientName);
        const preview = asString(data.preview);
        const status = asString(data.status);
        const action = asString(data.action);
        const role = asString(data.role);
        const route = asString(data.route);
        const stepProgress = asNumber(data.stepProgress);
        const updatedFields = Array.isArray(data.updatedFields)
            ? data.updatedFields.filter((field): field is string => typeof field === 'string' && field.trim().length > 0)
            : [];
        const genericItems = compact<MetricItem>([
            title ? { label: 'Title', value: title } : null,
            taskId ? { label: 'Task ID', value: taskId } : null,
            projectId ? { label: 'Project ID', value: projectId } : null,
            clientId ? { label: 'Client ID', value: clientId } : null,
            proposalId ? { label: 'Proposal ID', value: proposalId } : null,
            campaignId ? { label: 'Campaign ID', value: campaignId } : null,
            creativeId ? { label: 'Creative ID', value: creativeId } : null,
            providerId ? { label: 'Platform', value: formatProviderName(providerId) } : null,
            recipientName ? { label: 'Recipient', value: recipientName } : null,
            preview ? { label: 'Message', value: preview } : null,
            role ? { label: 'Role', value: role } : null,
            status ? { label: 'Status', value: formatLabel(status) } : null,
            action ? { label: 'Action', value: formatLabel(action) } : null,
            stepProgress !== null ? { label: 'Progress', value: `${formatWholeNumber(stepProgress)}%` } : null,
            route ? { label: 'Open', value: route } : null,
        ]);
        if (genericItems.length > 0) {
            const hasExistingDetails = sections.some((section) => section.title === 'Details');
            if (!hasExistingDetails) {
                sections.push({ type: 'metrics', title: 'Details', items: genericItems });
            }
        }
        if (updatedFields.length > 0 && !sections.some((section) => section.title === 'Updated Fields')) {
            sections.push({
                type: 'list',
                title: 'Updated Fields',
                items: updatedFields.map((field) => ({ primary: formatLabel(field) })),
            });
        }
    }
    return sections;
}
