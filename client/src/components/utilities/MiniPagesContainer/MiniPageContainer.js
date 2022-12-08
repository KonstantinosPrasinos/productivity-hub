import styles from './MiniPageContainer.module.scss';
import {useContext, useEffect, useRef} from "react";
import {motion, useAnimation} from 'framer-motion';
import Button from "../../buttons/Button/Button";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "../../buttons/IconButton/IconButton";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {useScreenSize} from "../../../hooks/useScreenSize";

const MiniPageContainer = ({children, onClickSave, length, index}) => {
    const containerRef = useRef();
    const animation = useAnimation();

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
        animation.set({height: containerRef.current.offsetHeight});
        animation.start({height: `calc(100% - 4em - 32px)`});
    }

    const makeHalfHeight = () => {
        animation.set({height: containerRef.current.offsetHeight});
        animation.start({height: `calc(50% - 4em - 32px)`});
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
        animation.start({
            y: 0
        });
    }, [])

    useEffect(() => {
        if (index !== length - 1) {
            animation.start({y: "100%"});
        } else {
            animation.start({y: 0});
        }
    }, [length, index])

    return (
        <motion.div
            className={`${styles.container} Stack-Container Symmetrical Big-Padding`}
            ref={containerRef}
            initial={{y: '100%'}}
            animate={animation}
            transition={{type: "tween"}}
            exit={{y: "100%"}}
        >
            <div className={styles.staticElements} onTouchMove={handleMove} onTouchEnd={handleEnd}>
                {screenSize === 'small' &&
                    <div className={styles.topLineContainer}>
                        <div className={styles.topLine}></div>
                    </div>
                }

                <div className={styles.actionButtonsContainer}>
                    <IconButton onClick={() => {miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''})}}><CloseIcon /></IconButton>
                    <Button onClick={onClickSave}>Save</Button>
                </div>
            </div>
            <motion.div className={`Stack-Container ${styles.childrenContainer}`} layout>
                {children}
            </motion.div>
        </motion.div>
    );
};

export default MiniPageContainer;
