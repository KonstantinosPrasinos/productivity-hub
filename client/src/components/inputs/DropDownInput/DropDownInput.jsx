import {useMemo, useRef, useState} from "react";

import styles from "./DropDownInput.module.scss";
import {TbChevronDown} from "react-icons/tb";
import {createPortal} from "react-dom";

const DropDownInput = ({placeholder, isDisabled, selected, widthBasedOnChildren = false, children}) => {
    const [extended, setExtended] = useState(false);
    const containerRef = useRef();
    const optionsRef = useRef();
    const arrowRef = useRef();

    const collapseOptions = () => {
        optionsRef.current.classList.add(styles.collapsed);
        arrowRef.current.classList.remove(styles.facingUp);
    }

    const expandOptions = () => {
        if (!isDisabled) {
            setExtended(true);
            arrowRef.current.classList.add(styles.facingUp);

            // Collapse it when the screen resizes
            window.addEventListener("resize", () => {
                // Collapse options instantly
                if (arrowRef.current) {
                    arrowRef.current.classList.remove(styles.facingUp)
                    setExtended(false)
                }
            });
        }
    }

    // Change options container styles whenever it expands
    const optionsContainerStyles = useMemo(() => {
        if (!extended) return {};

        // Set its position
        const styles = {};
        const emSize = parseFloat(window.getComputedStyle(containerRef.current).fontSize);
        const {top, left, right, bottom} = containerRef.current.getBoundingClientRect();

        // Check if it should go above or below the main container
        if (top + 12.5 * emSize > window.innerHeight - emSize) {
            // Would go outside of screen so go above
            styles.bottom = `calc(100% - ${top}px + 0.5em)`;
        } else {
            styles.top = `calc(${bottom}px + 0.25em)`;
            styles.transformOrigin = "top";
        }

        // Check if it should align to the left or the right of the main container
        if (left + 10 * emSize > window.innerWidth - emSize) {
            // Would go outside of screen so align to right
            styles.right = `${right}px`;
        } else {
            styles.left = `${left}px`
        }

        return styles;
    }, [extended]);

    const handleOptionsContainerTransitionEnd = (event) => {
        if (event.target !== optionsRef.current) return;
        setExtended(false);
    }

    const maxChildLength = useMemo(() => {
        let maxLength = 0;

        for (const child of children) {
            if (child.key?.length > maxLength) maxLength = child.key.length;
        }

        return maxLength;
    }, [children]);

    const handleOptionsContainerClick = (event) => {
        // So that it doesn't collapse when an option is clicked
        event.stopPropagation()
    }

    return (<div className={`${isDisabled ? styles.disabled : ''} ${styles.container}`} ref={containerRef}>
            <div
                className={`
        Horizontal-Flex-Container
        Rounded-Container
        ${isDisabled ? styles.disabled : ''}
        ${styles.inputContainer}
        ${widthBasedOnChildren && maxChildLength ? styles.widthBasedOnChildren : ""}
        `}
                onClick={expandOptions}
            >
                <div className={styles.selected}
                     style={{width: widthBasedOnChildren ? `${maxChildLength}ch` : "auto"}}>{selected ? selected : placeholder}</div>
                <div
                    className={styles.arrowIcon}
                    ref={arrowRef}
                >
                    <TbChevronDown/>
                </div>
            </div>
            {createPortal(extended && !isDisabled && (<div
                className={styles.optionsOverlay}
                onClick={collapseOptions}
            >
                <div
                    className={`${styles.optionsContainer} Stack-Container Rounded-Container`}
                    style={optionsContainerStyles}
                    ref={optionsRef}
                    onClick={handleOptionsContainerClick}
                    onTransitionEnd={handleOptionsContainerTransitionEnd}
                >
                    {children.map((option, index) => {
                        // Each options key should be its "value", in order to render as a selected
                        return (<div
                            className={`${styles.option} ${option.key === selected ? styles.optionSelected : ""} `}
                            key={index}
                            onClick={collapseOptions}
                        >
                            {option}
                        </div>);
                    })}
                </div>
            </div>), document.getElementById("app") ?? document.getElementById("root"))}
        </div>);
};

export default DropDownInput;
