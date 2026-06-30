'use client';
import { Plus } from 'lucide-react';
import { pressableScaleClass } from '@/lib/motion';
import { FadeInStagger } from '@/shared/ui/animate-in';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogTrigger, } from '@/shared/ui/dialog';
import { CreateCreativeDialogForm, CreateCreativeDialogHeader, } from './create-creative-dialog-sections';
import type { CreateCreativeDialogProps } from './create-creative-dialog-types';
import { useCreateCreativeDialog } from './use-create-creative-dialog';
export function CreateCreativeDialog(props: CreateCreativeDialogProps) {
    const { open, loading, uploadingImage, uploadingVideo, videoPreviewSrc, imagePreviewSrc, loadingPageActors, metaPageActors, selectedAdSetId, name, objectType, title, body, description, callToActionType, linkUrl, imageUrl, imageHash, videoId, pageId, instagramActorId, status, isMeta, selectedPage, instagramActorOptions, handleOpenChange, setBody, setCallToActionType, setDescription, setImageUrl, setInstagramActorId, setLinkUrl, setName, setObjectType, setSelectedAdSetId, setStatus, setTitle, setVideoId, handleSelectPage, handleClearImage, handleClearVideo, handleImageUpload, handleVideoUpload, handleSubmit, handleClose, leadFormId, campaignObjective, setLeadFormId, } = useCreateCreativeDialog(props);
    const { providerId, availableAdSets, workspaceId, clientId } = props;
    return (<Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className={cn(pressableScaleClass)} disabled={!isMeta || !selectedAdSetId}>
          <Plus className="mr-2 size-4"/>
          Create Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <CreateCreativeDialogHeader providerId={providerId}/>
        <FadeInStagger className="space-y-4" stagger={0.05}>
        <CreateCreativeDialogForm availableAdSets={availableAdSets} body={body} callToActionType={callToActionType} description={description} imageHash={imageHash} imagePreviewSrc={imagePreviewSrc} imageUrl={imageUrl} onClearImage={handleClearImage} instagramActorId={instagramActorId} instagramActorOptions={instagramActorOptions} isMeta={isMeta} linkUrl={linkUrl} loading={loading} loadingPageActors={loadingPageActors} metaPageActors={metaPageActors} name={name} objectType={objectType} onBodyChange={setBody} onCallToActionTypeChange={setCallToActionType} onClose={handleClose} onDescriptionChange={setDescription} onImageUpload={handleImageUpload} onVideoUpload={handleVideoUpload} onImageUrlChange={setImageUrl} onClearVideo={handleClearVideo} videoPreviewSrc={videoPreviewSrc} videoId={videoId} uploadingVideo={uploadingVideo} onInstagramActorIdChange={setInstagramActorId} onLinkUrlChange={setLinkUrl} onNameChange={setName} onObjectTypeChange={setObjectType} onPageIdChange={handleSelectPage} onSelectedAdSetIdChange={setSelectedAdSetId} onStatusChange={setStatus} onSubmit={handleSubmit} onTitleChange={setTitle} onVideoIdChange={setVideoId} pageId={pageId} selectedAdSetId={selectedAdSetId} selectedPage={selectedPage} status={status} title={title} uploadingImage={uploadingImage} workspaceId={workspaceId} clientId={clientId} campaignObjective={campaignObjective} leadFormId={leadFormId} onLeadFormIdChange={setLeadFormId}/>
        </FadeInStagger>
      </DialogContent>
    </Dialog>);
}
