//#region node_modules/.nitro/vite/services/ssr/assets/upload-storage-file-CUAnugSD.js
async function uploadWithProgress(url, file, onProgress) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", url);
		xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
		if (onProgress) xhr.upload.onprogress = (event) => {
			onProgress({
				loaded: event.loaded,
				total: event.total
			});
		};
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) resolve();
			else reject(/* @__PURE__ */ new Error(`Failed to upload file: ${xhr.statusText}`));
		};
		xhr.onerror = () => reject(/* @__PURE__ */ new Error("Failed to upload file"));
		xhr.send(file);
	});
}
/**
* Upload a file to Cloudflare R2 via Convex signed URLs.
* Returns the persisted object reference (`r2:<key>`) stored in existing `storageId` fields.
*/
async function uploadStorageFile({ file, contentType, generateUploadUrl, syncMetadata, onProgress }) {
	const payload = await generateUploadUrl();
	const uploadUrl = payload.url?.trim();
	const key = payload.key?.trim();
	if (!uploadUrl || !key) throw new Error("Unable to create upload URL");
	await uploadWithProgress(uploadUrl, file instanceof File ? file : new File([file], "upload", { type: contentType || "application/octet-stream" }), onProgress);
	const trimmedStorageId = payload.storageId?.trim();
	if (trimmedStorageId) return trimmedStorageId;
	await syncMetadata({ key });
	return `r2:${key}`;
}
/**
* Upload to R2 and resolve a signed download URL for immediate UI use (chat previews, etc.).
*/
async function uploadStorageFileWithPublicUrl({ getPublicUrl, ...uploadOptions }) {
	const storageId = await uploadStorageFile(uploadOptions);
	const publicUrl = await getPublicUrl({ storageId });
	if (!publicUrl?.url) throw new Error("Unable to resolve uploaded file URL");
	return {
		storageId,
		url: publicUrl.url
	};
}
//#endregion
export { uploadStorageFileWithPublicUrl as n, uploadStorageFile as t };
