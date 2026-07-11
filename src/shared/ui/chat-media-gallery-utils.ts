import { isLikelyImageUrl } from '@/features/dashboard/collaboration/utils';
import type { AttachmentKind, ChatMediaAttachment } from './chat-media-gallery-types';

const TEXT_EXTENSION_REGEX = /\.(txt|csv|json|xml|md|markdown|log|yaml|yml|toml|ini|conf|js|jsx|ts|tsx|py|rb|go|rs|java|kt|c|cpp|cs|php|swift|sh|bash|zsh|sql|graphql|gql|html|htm|css|scss|less|vue|svelte|dart|lua|r|scala|clj|ex|exs|erl|elm|haskell|hs|ml|nim|v|zig)(\?.*)?$/i;

const IMAGE_NAME_REGEX = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico|tiff?|heic|heif)$/i;
const VIDEO_NAME_REGEX = /\.(mp4|mov|webm|ogg|avi|mkv|m4v|wmv|flv)(\?.*)?$/i;
const AUDIO_NAME_REGEX = /\.(mp3|wav|m4a|aac|ogg|flac|opus|mka|wma)(\?.*)?$/i;

export function getAttachmentKind(attachment: ChatMediaAttachment): AttachmentKind {
    const type = (attachment.type || '').toLowerCase().trim();
    const url = attachment.url || '';
    const name = (attachment.name || '').toLowerCase().trim();
    if (isLikelyImageUrl(url) || type.startsWith('image/') || IMAGE_NAME_REGEX.test(name))
        return 'image';
    if (type.startsWith('video/') || VIDEO_NAME_REGEX.test(url) || VIDEO_NAME_REGEX.test(name))
        return 'video';
    if (type.startsWith('audio/') || AUDIO_NAME_REGEX.test(url) || AUDIO_NAME_REGEX.test(name))
        return 'audio';
    if (type.includes('pdf') || name.endsWith('.pdf') || url.toLowerCase().includes('.pdf'))
        return 'pdf';
    if (type.includes('spreadsheet') ||
        type.includes('excel') ||
        /\.(xlsx)(\?.*)?$/i.test(name)) {
        return 'spreadsheet';
    }
    if (type.includes('zip') || /\.(zip|rar|7z|tar|gz|bz2)(\?.*)?$/i.test(name))
        return 'archive';
    if (type.startsWith('text/') ||
        type.includes('json') ||
        type.includes('xml') ||
        type.includes('yaml') ||
        type.includes('javascript') ||
        type.includes('typescript') ||
        TEXT_EXTENSION_REGEX.test(name) ||
        TEXT_EXTENSION_REGEX.test(url)) {
        return 'text';
    }
    return 'file';
}

/**
 * Maps a file extension or mime type to a syntax-highlighter language identifier.
 * Used by the text preview dialog to pick the right Prism language.
 */
export function getSyntaxLanguage(attachment: ChatMediaAttachment): string {
    const name = attachment.name.toLowerCase();
    const type = (attachment.type || '').toLowerCase();

    if (name.endsWith('.json') || type.includes('json')) return 'json';
    if (name.endsWith('.xml') || type.includes('xml')) return 'xml';
    if (name.endsWith('.md') || name.endsWith('.markdown')) return 'markdown';
    if (name.endsWith('.yaml') || name.endsWith('.yml') || type.includes('yaml')) return 'yaml';
    if (name.endsWith('.toml')) return 'toml';
    if (name.endsWith('.html') || name.endsWith('.htm')) return 'html';
    if (name.endsWith('.css')) return 'css';
    if (name.endsWith('.scss')) return 'scss';
    if (name.endsWith('.less')) return 'less';
    if (name.endsWith('.js') || name.endsWith('.jsx') || type.includes('javascript')) return 'javascript';
    if (name.endsWith('.ts') || name.endsWith('.tsx') || type.includes('typescript')) return 'typescript';
    if (name.endsWith('.py') || type.includes('python')) return 'python';
    if (name.endsWith('.rb') || type.includes('ruby')) return 'ruby';
    if (name.endsWith('.go') || type.includes('go')) return 'go';
    if (name.endsWith('.rs') || type.includes('rust')) return 'rust';
    if (name.endsWith('.java') || type.includes('java')) return 'java';
    if (name.endsWith('.kt') || type.includes('kotlin')) return 'kotlin';
    if (name.endsWith('.c') || name.endsWith('.h')) return 'c';
    if (name.endsWith('.cpp') || name.endsWith('.hpp') || type.includes('cpp')) return 'cpp';
    if (name.endsWith('.cs') || type.includes('csharp')) return 'csharp';
    if (name.endsWith('.php') || type.includes('php')) return 'php';
    if (name.endsWith('.swift')) return 'swift';
    if (name.endsWith('.sh') || name.endsWith('.bash') || name.endsWith('.zsh')) return 'bash';
    if (name.endsWith('.sql')) return 'sql';
    if (name.endsWith('.graphql') || name.endsWith('.gql')) return 'graphql';
    if (name.endsWith('.csv')) return 'csv';
    if (name.endsWith('.ini') || name.endsWith('.conf')) return 'ini';
    if (name.endsWith('.vue')) return 'vue';
    if (name.endsWith('.svelte')) return 'svelte';
    if (name.endsWith('.dart')) return 'dart';
    if (name.endsWith('.lua')) return 'lua';
    if (name.endsWith('.r')) return 'r';
    if (name.endsWith('.scala')) return 'scala';
    if (name.endsWith('.clj')) return 'clojure';
    if (name.endsWith('.ex') || name.endsWith('.exs')) return 'elixir';
    if (name.endsWith('.erl')) return 'erlang';
    if (name.endsWith('.elm')) return 'elm';
    if (name.endsWith('.hs') || name.endsWith('.haskell')) return 'haskell';
    if (name.endsWith('.ml')) return 'ocaml';
    if (name.endsWith('.nim')) return 'nim';
    if (name.endsWith('.v')) return 'v';
    if (name.endsWith('.zig')) return 'zig';
    return 'text';
}
