import { buildCollaborationExportCharts } from '@/lib/export/cohorts-spreadsheet-charts';
import { exportCohortsSpreadsheetRows } from '@/lib/export/cohorts-spreadsheet';
import type { CollaborationMessage } from '@/types/collaboration';
type ExportChannelMessagesOptions = {
    channelName: string;
    messages: CollaborationMessage[];
};
export function exportChannelMessages({ channelName, messages }: ExportChannelMessagesOptions) {
    if (messages.length === 0) {
        return;
    }
    const headers = ['Date', 'Sender', 'Role', 'Content', 'Attachments', 'Reactions', 'Thread Replies'];
    const rows = messages.map((msg) => {
        const date = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '';
        const attachments = (msg.attachments || []).map((attachment) => attachment.url).join('; ');
        const reactions = (msg.reactions || []).map((reaction) => `${reaction.emoji}(${reaction.count})`).join(' ');
        return [
            date,
            msg.senderName,
            msg.senderRole || '',
            msg.content || '',
            attachments,
            reactions,
            msg.threadReplyCount || 0,
        ];
    });
    const chartRows = messages.map((msg) => ({
        date: msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '',
        sender: msg.senderName,
    }));
    void exportCohortsSpreadsheetRows({
        filename: `${channelName.replace(/[^a-z0-9]/gi, '_')}_export.xlsx`,
        title: `${channelName} messages`,
        subtitle: `${rows.length} message${rows.length === 1 ? '' : 's'}`,
        sheetName: 'Messages',
        headers,
        rows,
        charts: buildCollaborationExportCharts(chartRows),
    });
}
