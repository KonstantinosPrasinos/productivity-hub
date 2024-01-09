import styles from './MiniPageContainer.module.scss';
import {useContext, useEffect, useRef} from "react";
import {motion, useAnimation} from 'framer-motion';
import Button from "../../buttons/Button/Button";
import IconButton from "../../buttons/IconButton/IconButton";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {useScreenSize} from "../../../hooks/useScreenSize";
import {TbX} from "react-icons/tb";

const MiniPageContainer = ({children, onClickSave, length, index, showSaveButton = true}) => {
    const containerRef = useRef();
    const animationControls = useAnimation();

    const {screenSize} = useScreenSize();
    const miniPagesContext = useContext(MiniPagesContext);

    let startY;

    const handleMove = (e) => {
        if (e.target.nodeName === 'DIV'){
            if (!startY) {
                startY = window.innerHeight - containerRef.current.getBoundingClientRect().top
            }

            containerRef.current.style.height = `calc(${window.innerHeight - e.touches[0].clientY}px - 3.7em + 4px )`;
        } else {
            e.stopPropagation();
        }
    }

    const makeFullHeight = () => {
        animationControls.set({height: containerRef.current.offsetHeight});
        animationControls.start({height: `calc(100% - 4em - 12px)`});
    }

    const makeHalfHeight = () => {
        animationControls.set({height: containerRef.current.offsetHeight});
        animationControls.start({height: `calc(50% - 4em - 12px)`});
    }

    const handleEnd = (e) => {
        if (e.target.nodeName === 'DIV'){
            if (startY) {
                if (containerRef.current.offsetHeight < startY) {
                    makeHalfHeight();
                } else {
                    makeFullHeight();
                }
                startY = null;
            } else {
                containerRef.current.offsetHeight <= 0.9 * window.innerHeight ? makeFullHeight() : makeHalfHeight()
            }
        } else {
            e.stopPropagation();
        }
    }

    useEffect(() => {
        if (index !== length - 1) {
            animationControls.start(screenSize === "small" ? "mobileCollapsed" : "desktopCollapsed");
        } else {
            animationControls.start(screenSize === "small" ? "mobileExtended" : "desktopExtended");
        }
    }, [length, index])

    const animationVariants = {
        mobileExtended: {y: 0},
        mobileCollapsed: {y: '100%'},
        desktopCollapsed: {x: '100%'},
        desktopExtended: {x: 0}
    }

    useEffect(() => {
        animationControls.start(screenSize === "small" ? "mobileExtended" : "desktopExtended")
    }, [])

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
            }
        }

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        }
    }, []);

    return (
        <motion.div
            className={`${styles.container} Stack-Container Symmetrical Big-Padding`}
            ref={containerRef}

            initial={screenSize === "small" ? "mobileCollapsed" : "desktopCollapsed"}
            animate={animationControls}
            exit={screenSize === "small" ? "mobileCollapsed" : "desktopCollapsed"}

            variants={animationVariants}
            transition={{type: "tween"}}
        >
            <div className={styles.staticElements} onTouchMove={handleMove} onTouchEnd={handleEnd}>
                {screenSize === 'small' &&
                    <div className={styles.topLineContainer}>
                        <div className={styles.topLine}></div>
                    </div>
                }

                <div className={styles.actionButtonsContainer}>
                    <IconButton onClick={() => {miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''})}}><TbX /></IconButton>
                    {showSaveButton && <Button onClick={onClickSave}>Save</Button>}
                </div>
            </div>
            <motion.div className={`Stack-Container ${styles.childrenContainer}`} layout>
                {children}
            </motion.div>
        </motion.div>
    );
};

export default MiniPageContainer;
