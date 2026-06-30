'use client';
import { WidgetSizeButton } from './widget-size-button';
/**
 * Widget size selector
 */
export function WidgetSizeSelector({ currentSize, onSizeChange, disabled, }: {
    currentSize: 'small' | 'medium' | 'large';
    onSizeChange: (size: 'small' | 'medium' | 'large') => void;
    disabled?: boolean;
}) {
    const sizes: Array<{
        value: 'small' | 'medium' | 'large';
        label: string;
        width: string;
    }> = [
        { value: 'small', label: 'S', width: 'col-span-1' },
        { value: 'medium', label: 'M', width: 'col-span-2' },
        { value: 'large', label: 'L', width: 'lg:col-span-2' },
    ];
    return (<div className="flex items-center gap-1">
      {sizes.map((size) => (<WidgetSizeButton key={size.value} size={size} currentSize={currentSize} disabled={disabled} onSizeChange={onSizeChange}/>))}
    </div>);
}
