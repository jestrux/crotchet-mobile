import {
    useCallback,
    useState,
    useLayoutEffect,
    useEffect,
    useRef,
} from "react";

function useEventListener(eventName, handler, element, options) {
    // Create a ref that stores handler
    const savedHandler = useRef(handler);

    useLayoutEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const targetElement = element?.current ?? window;

        if (!(targetElement && targetElement.addEventListener)) return;

        const listener = (event) => savedHandler.current(event);

        targetElement.addEventListener(eventName, listener, options);

        // Remove event listener on cleanup
        return () => {
            targetElement.removeEventListener(eventName, listener, options);
        };
    }, [eventName, element, options]);
}

function useElementSize() {
    // Mutable values like 'ref.current' aren't valid dependencies
    // because mutating them doesn't re-render the component.
    // Instead, we use a state as a ref to be reactive.
    const [ref, setRef] = useState(null);
    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });

    // Prevent too many rendering using useCallback
    const handleSize = useCallback(() => {
        setSize({
            width: ref?.offsetWidth || 0,
            height: ref?.offsetHeight || 0,
        });
    }, [ref?.offsetHeight, ref?.offsetWidth]);

    useEventListener("resize", handleSize);

    useLayoutEffect(() => {
        handleSize();
    }, [ref?.offsetHeight, ref?.offsetWidth]);

    return [setRef, size];
}

export default useElementSize;
