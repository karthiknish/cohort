'use client';
import { useCreativeDetailPageClient, type CreativeDetailPageClientProps, } from './creative-detail-page-client-controller';
export type { CreativeDetailPageClientProps };
export default function CreativeDetailPageClient(props: CreativeDetailPageClientProps) {
    return useCreativeDetailPageClient(props);
}
