import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
vi.mock('convex/react', () => ({
    useAction: () => vi.fn(async () => []),
}));
vi.mock('@/shared/ui/dialog', () => ({
    DialogDescription: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    DialogFooter: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    DialogHeader: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    DialogTitle: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
}));
import { CreateCreativeDialogForm, CreateCreativeDialogHeader } from './create-creative-dialog-sections';
const selectedPage = { id: 'page-1', name: 'Brand Page', tasks: [], instagramBusinessAccountId: 'ig-1', instagramBusinessAccountName: 'Brand IG', instagramUsername: 'brand' };
describe('create creative dialog sections', () => {
    it('renders the dialog header copy', () => {
        const markup = renderToStaticMarkup(<CreateCreativeDialogHeader providerId="facebook"/>);
        expect(markup).toContain('Create New Ad Creative');
        expect(markup).toContain('Meta');
    });
    it('renders the form body and conditional branches', () => {
        const imageMarkup = renderToStaticMarkup(<CreateCreativeDialogForm body="Primary copy" callToActionType="LEARN_MORE" description="Limited time" imageHash="hash-1" imagePreviewSrc="https://example.com/image.jpg" imageUrl="https://example.com/image.jpg" onClearImage={vi.fn()} instagramActorId="ig-1" instagramActorOptions={[{ id: 'ig-1', label: 'Brand IG' }]} isMeta={true} linkUrl="https://example.com" loading={false} loadingPageActors={false} metaPageActors={[{ id: 'page-1', name: 'Brand Page', tasks: [], instagramBusinessAccountId: 'ig-1', instagramBusinessAccountName: 'Brand IG', instagramUsername: 'brand' }]} name="Creative A" objectType="IMAGE" onBodyChange={vi.fn()} onCallToActionTypeChange={vi.fn()} onClose={vi.fn()} onDescriptionChange={vi.fn()} onImageUpload={vi.fn()} onVideoUpload={vi.fn()} onClearVideo={vi.fn()} videoPreviewSrc={null} uploadingVideo={false} onImageUrlChange={vi.fn()} onInstagramActorIdChange={vi.fn()} onLinkUrlChange={vi.fn()} onNameChange={vi.fn()} onObjectTypeChange={vi.fn()} onPageIdChange={vi.fn()} onSelectedAdSetIdChange={vi.fn()} onStatusChange={vi.fn()} onSubmit={vi.fn()} onTitleChange={vi.fn()} onVideoIdChange={vi.fn()} pageId="page-1" selectedAdSetId="adset-1" selectedPage={selectedPage} status="PAUSED" title="Headline" uploadingImage={false} videoId=""/>);
        const videoMarkup = renderToStaticMarkup(<CreateCreativeDialogForm body="Primary copy" callToActionType="" description="" imageHash="" imageUrl="" onClearImage={vi.fn()} instagramActorId="" instagramActorOptions={[]} isMeta={true} linkUrl="" loading={false} loadingPageActors={false} metaPageActors={[]} name="Creative B" objectType="VIDEO" onBodyChange={vi.fn()} onCallToActionTypeChange={vi.fn()} onClose={vi.fn()} onDescriptionChange={vi.fn()} onImageUpload={vi.fn()} onVideoUpload={vi.fn()} onClearVideo={vi.fn()} videoPreviewSrc={null} uploadingVideo={false} onImageUrlChange={vi.fn()} onInstagramActorIdChange={vi.fn()} onLinkUrlChange={vi.fn()} onNameChange={vi.fn()} onObjectTypeChange={vi.fn()} onPageIdChange={vi.fn()} onSelectedAdSetIdChange={vi.fn()} onStatusChange={vi.fn()} onSubmit={vi.fn()} onTitleChange={vi.fn()} onVideoIdChange={vi.fn()} pageId="" selectedPage={null} status="ACTIVE" title="" uploadingImage={false} videoId="video-1"/>);
        expect(imageMarkup).toContain('Creative Image');
        expect(imageMarkup).toContain('Ready for ad creation');
        expect(imageMarkup).toContain('Replace');
        expect(imageMarkup).toContain('Facebook Page *');
        expect(imageMarkup).toContain('Linked Instagram account for selected page is preselected.');
        expect(imageMarkup).toContain('Create Ad');
        expect(videoMarkup).toContain('No Ad Set Available');
        expect(videoMarkup).toContain('Creative Video');
        expect(videoMarkup).toContain('Meta video ID');
    });
});
