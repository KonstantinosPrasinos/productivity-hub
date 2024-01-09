import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from "framer-motion";
import IconButton from "@/components/buttons/IconButton/IconButton.jsx";
import {TbInfoCircle, TbX} from "react-icons/tb";
import styles from "./Tooltip.module.scss";
import {createPortal} from "react-dom";

const variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
}

const Tooltip = ({message}) => {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const tooltipRef = useRef();
    const buttonRef = useRef();

    const closeToolTip = () => {
        setTooltipVisible(false);
        document.removeEventListener("click", handleDocumentClick);
        document.removeEventListener("wheel", closeToolTip);
        document.removeEventListener("resize", closeToolTip);
    }

    const handleDocumentClick = (event) => {
        if (!tooltipRef.current) return;

        if (event.target !== tooltipRef.current && !Array.from(tooltipRef.current.children).includes(event.target)) {
            closeToolTip();
        }
    }

    const handleClick = (event) => {
        setTooltipVisible(current => !current);
        event.stopPropagation();
    }

    useEffect(() => {
        if (tooltipRef.current && tooltipVisible) {
            // This sets the position of the tooltip relative to the button.
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const buttonRect = buttonRef.current.getBoundingClientRect();

            const fontSize = parseFloat(window.getComputedStyle(buttonRef.current).fontSize);

            const windowWidth = window.innerWidth;

            // Tooltip scale is set to 0.8 at the start so compensate for that.
            const tooltipActualWidth = 1.11 * tooltipRect.width;
            const tooltipActualHeight = 1.11 * tooltipRect.height;

            // Account for it going out the left or right.
            if (buttonRect.x + buttonRect.width + tooltipActualWidth / 2 + fontSize > windowWidth) {
                tooltipRef.current.style.right = `${windowWidth - fontSize}px`;
            } else if (buttonRect.x - tooltipActualWidth - fontSize / 2 < 0) {
                tooltipRef.current.style.left = `${fontSize}px`;
            } else {
                tooltipRef.current.style.left = `${buttonRect.x + buttonRect.width / 2 - tooltipActualWidth / 2}px`;
            }

            // Account for it going out the top.
            if (buttonRect.y - tooltipActualHeight - fontSize < 0) {
                tooltipRef.current.style.top = `${buttonRect.y + buttonRect.height + fontSize * 0.5}px`;
            } else {
                tooltipRef.current.style.top = `${buttonRect.y - tooltipActualHeight - 0.5 * fontSize}px`;
            }

            // When the user makes an interaction with anything except the tooltip, hide it.
            document.addEventListener("wheel", closeToolTip);
            document.addEventListener("resize", closeToolTip);
            document.addEventListener("click", handleDocumentClick);
        }

        return () => {
            document.removeEventListener("click", handleDocumentClick);
            document.removeEventListener("wheel", closeToolTip);
            document.addEventListener("resize", closeToolTip);
        }
    }, [tooltipVisible]);

    return (
        <>
            <button
                className={styles.tooltipButton}
                ref={buttonRef}

                onClick={handleClick}
            >
                <TbInfoCircle />
            </button>
            {createPortal(<AnimatePresence>
                {
                    tooltipVisible &&
                    tooltipVisible &&
                    <motion.div
                        className={styles.container}
                        ref={tooltipRef}

                        variants={variants}
                        initial={"hidden"}
                        animate={"visible"}
                        exit={"exit"}
                    >
                        <span>{message}</span>
                        <IconButton onClick={closeToolTip}>
                            <TbX/>
                        </IconButton>
                    </motion.div>
                }
            </AnimatePresence>, document.getElementById("app") ?? document.getElementById("root"))}
        </>
    );
};

export default Tooltip;