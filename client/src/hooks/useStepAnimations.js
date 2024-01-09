import {useRef} from "react";
import {useAnimate} from "framer-motion";

export function useStepAnimations(
    yDifference, // 24px difference
    value,
    setValue,
    topElementClass,
    topEdgeElementClass,
    bottomElementClass,
    bottomEdgeElementClass,
    childrenElementsClass,
    minValue,
    maxValue
) {
    const valueUpdates = useRef(0);
    const theoreticalValue = useRef(value); // useState set state was too slow for animation orchestrations. It made it possible to go to addValue 0. Added this for state value checks
    const shouldUpdate = useRef(false);

    const [scope, animate] = useAnimate();

    const doOverlayAnimations = () => { // direction is -1 for down and 1 for up
        let direction = valueUpdates.current > 0 ? -1 : 1;
        const handleTransitionEnd = () => {
            if (shouldUpdate.current) {
                shouldUpdate.current = false;
                setValue(current => current - direction);
                animate(`.${childrenElementsClass}`, {y: `0em`}, {duration: 0});
                theoreticalValue.current -= direction
                valueUpdates.current += direction;

                if (direction < 0) {
                    animate(`.${bottomEdgeElementClass}`, {opacity: 0, scale: 0}, {duration: 0.01});
                    animate(`.${topElementClass}`, {opacity: 1, scale: 1}, {duration: 0.01});
                } else {
                    animate(`.${topEdgeElementClass}`, {opacity: 0, scale: 0}, {duration: 0.01});
                    animate(`.${bottomElementClass}`, {opacity: 1, scale: 1}, {duration: 0.01});
                }

                if (valueUpdates.current !== 0) {
                    if (theoreticalValue.current + valueUpdates.current > minValue - 1 && theoreticalValue.current + valueUpdates.current < maxValue + 1) {
                        doOverlayAnimations(direction);
                    } else {
                        valueUpdates.current = 0;
                    }
                }
            }
        }

        if (theoreticalValue.current + valueUpdates.current > minValue - 1 && theoreticalValue.current + valueUpdates.current < maxValue + 1) {
            if (direction < 0) {
                animate(`.${bottomEdgeElementClass}`, {opacity: 1, scale: 1}, {duration: 0.1});
                animate(`.${topElementClass}`, {opacity: 0, scale: 0}, {duration: 0.1});
            } else {
                animate(`.${topEdgeElementClass}`, {opacity: 1, scale: 1}, {duration: 0.1});
                animate(`.${bottomElementClass}`, {opacity: 0, scale: 0}, {duration: 0.1});
            }
            shouldUpdate.current = true;
            animate(`.${childrenElementsClass}`, {y: `${direction * yDifference}px`}, {
                duration: 0.1,
                onComplete: handleTransitionEnd,
                from: 0,
                type: "tween"
            });
        } else {
            valueUpdates.current = 0;
        }
    }

    const addUpdate = () => {
        if (theoreticalValue.current + valueUpdates.current < maxValue) {
            if (valueUpdates.current >= 0) {
                valueUpdates.current += 1;

                if (valueUpdates.current <= 1) {
                    doOverlayAnimations(-1);
                }
            }
            // else {
            //     valueUpdates.current = 1;
            //     doOverlayAnimations(-1);
            // }
        }
    }

    const subtractUpdate = () => {
        if (theoreticalValue.current + valueUpdates.current > minValue) {
            if (valueUpdates.current <= 0) {
                valueUpdates.current -= 1;

                if (valueUpdates.current >= -1) {
                    doOverlayAnimations(1);
                }
            }
            // else {
            //     valueUpdates.current = -1;
            //     doOverlayAnimations(1);
            // }
        }
    }

    return {scope, addUpdate, subtractUpdate};
}