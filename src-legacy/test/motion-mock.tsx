import type { ReactNode } from 'react';
function motionStub({ children }: {
    children?: ReactNode;
}) {
    return <div>{children}</div>;
}
const motionElements = new Proxy({}, {
    get: () => motionStub,
}) as Record<string, typeof motionStub>;
/** Minimal framer-motion stub for renderToStaticMarkup component tests. */
export const motionTestMock = {
    domAnimation: {},
    AnimatePresence: ({ children }: {
        children: ReactNode;
    }) => children,
    LazyMotion: ({ children }: {
        children: ReactNode;
    }) => <div data-lazy-motion="">{children}</div>,
    useReducedMotion: () => true,
    m: motionElements,
};
