'use client';
import { useMemo } from 'react';
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import type { TrustedHtml } from '@/shared/ui/trusted-html-types';
import DOMPurify from 'dompurify';
type TrustedHtmlProps<T extends ElementType> = {
    as?: T;
    html: TrustedHtml;
} & Omit<ComponentPropsWithoutRef<T>, 'children' | 'dangerouslySetInnerHTML'>;
export function TrustedHtml<T extends ElementType = 'div'>({ as, html, ...props }: TrustedHtmlProps<T>) {
    const Component = (as ?? 'div') as ElementType;
    const sanitized = useMemo(() => ({ __html: DOMPurify.sanitize(html.__html) }), [html.__html]);
    return (<Component {...props} dangerouslySetInnerHTML={sanitized} data-html-source={process.env.NODE_ENV !== 'production' ? html.source : undefined}/>);
}
