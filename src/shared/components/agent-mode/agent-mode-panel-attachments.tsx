'use client';
import { useCallback } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { agentAttachmentsToChatMedia, type AgentAttachmentContext, } from '@/lib/agent-attachments';
import { Button } from '@/shared/ui/button';
import { AttachmentKindIcon, ChatMediaGallery } from '@/shared/ui/chat-media-gallery';
import { getAttachmentKind } from '@/shared/ui/chat-media-gallery-utils';
function AttachmentStatusBadge({ attachment }: {
    attachment: AgentAttachmentContext;
}) {
    if (attachment.extractionStatus === 'extracting') {
        return (<span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Loader2 className="size-3 animate-spin" aria-hidden/>
        Reading
      </span>);
    }
    if (attachment.extractionStatus === 'ready') {
        return <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">Ready</span>;
    }
    if (attachment.extractionStatus === 'limited') {
        return <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">Limited</span>;
    }
    return <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">Needs Review</span>;
}
function AttachmentItem({ attachment, onRemoveAttachment, }: {
    attachment: AgentAttachmentContext;
    onRemoveAttachment: (attachmentId: string) => void;
}) {
    const handleRemove = () => {
        onRemoveAttachment(attachment.id);
    };
    const media = agentAttachmentsToChatMedia([attachment]);
    const kind = getAttachmentKind({
        name: attachment.name,
        url: attachment.url ?? '#',
        type: attachment.mimeType,
    });
    return (<div key={attachment.id} className="rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary ring-1 ring-primary/10">
              <AttachmentKindIcon kind={kind} className="size-4"/>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium">{attachment.name}</p>
                <AttachmentStatusBadge attachment={attachment}/>
                <span className="text-xs text-muted-foreground">{attachment.sizeLabel}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{attachment.excerpt}</p>
              {attachment.errorMessage ? (<div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-warning">
                  <AlertCircle className="size-3.5"/>
                  <span>{attachment.errorMessage}</span>
                </div>) : null}
            </div>
          </div>
          {media.length > 0 ? <ChatMediaGallery attachments={media} compact/> : null}
        </div>
        <Button type="button" variant="ghost" size="icon" className="size-8 rounded-full" onClick={handleRemove} aria-label={`Remove ${attachment.name}`}>
          <X className="size-4"/>
        </Button>
      </div>
    </div>);
}
function AttachmentList({ attachments, onRemoveAttachment, }: {
    attachments: AgentAttachmentContext[];
    onRemoveAttachment: (attachmentId: string) => void;
}) {
    if (attachments.length === 0)
        return null;
    return (<div className="mb-3 space-y-2">
      {attachments.map((attachment) => (<AttachmentItem key={attachment.id} attachment={attachment} onRemoveAttachment={onRemoveAttachment}/>))}
    </div>);
}
export { AttachmentList, AttachmentStatusBadge };
export function AgentMessageAttachmentChips({ attachments, }: {
    attachments: AgentAttachmentContext[];
}) {
    if (attachments.length === 0)
        return null;
    const media = agentAttachmentsToChatMedia(attachments);
    const metadataOnly = attachments.filter((attachment) => !attachment.url?.trim() || attachment.url === 'about:blank');
    return (<div className="mt-2.5 space-y-2" aria-label="Attached files">
      {media.length > 0 ? (<ChatMediaGallery attachments={media} compact className="[&_img]:ring-primary-foreground/20"/>) : null}
      {metadataOnly.length > 0 ? (<ul className="space-y-2">
          {metadataOnly.map((attachment) => {
                const kind = getAttachmentKind({
                    name: attachment.name,
                    url: '#',
                    type: attachment.mimeType,
                });
                return (<li key={attachment.id} className="flex items-start gap-2.5 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-2 text-left text-xs">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
                  <AttachmentKindIcon kind={kind} className="size-4 opacity-90"/>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate font-semibold">{attachment.name}</span>
                    <AttachmentStatusBadge attachment={attachment}/>
                    <span className="text-[10px] opacity-75">{attachment.sizeLabel}</span>
                  </span>
                  {attachment.excerpt ? (<span className="mt-1 line-clamp-3 text-[11px] leading-relaxed opacity-85">
                      {attachment.excerpt}
                    </span>) : null}
                </span>
              </li>);
            })}
        </ul>) : null}
    </div>);
}
