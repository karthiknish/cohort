'use client';

import * as React from 'react';

/**
 * Slot — a replacement for @radix-ui/react-slot that does NOT use composeRefs.
 *
 * Instead of creating a new ref callback on every render (which causes
 * "Maximum update depth exceeded" when a useState setter is used as a ref),
 * this implementation uses a stable useCallback ref that merges refs safely.
 *
 * Usage:
 *   <Slot {...props}><MyComponent /></Slot>
 *
 * This clones the single child element and merges props (className, event handlers, etc.)
 * plus forwards the ref.
 */

function setRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          const result = (childPropValue as (...a: unknown[]) => unknown)(...args);
          (slotPropValue as (...a: unknown[]) => unknown)(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === 'style') {
      overrideProps[propName] = { ...(slotPropValue as object), ...(childPropValue as object) };
    } else if (propName === 'className') {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(' ');
    }
  }
  return { ...slotProps, ...overrideProps };
}

function getElementRef(element: React.ReactElement): React.Ref<unknown> | undefined {
  const props = element.props as Record<string, unknown>;
  const getter = Object.getOwnPropertyDescriptor(props, 'ref')?.get;
  const mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
  const elementRef = (element as React.ReactElement & { ref?: React.Ref<unknown> }).ref;
  if (mayWarn) return elementRef;
  return (props.ref as React.Ref<unknown> | undefined) ?? elementRef;
}

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const child = React.Children.toArray(children).find(
    (c): c is React.ReactElement => React.isValidElement(c),
  );
  if (!child) return null;
  const childRef = getElementRef(child);
  const mergedRef = mergeRefs(forwardedRef, childRef);
  const mergedProps = mergeProps(slotProps, child.props as Record<string, unknown>);
  mergedProps.ref = mergedRef;
  return React.cloneElement(child, mergedProps);
});
Slot.displayName = 'Slot';

export { Slottable } from './slottable';
