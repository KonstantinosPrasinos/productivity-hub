import styles from './MiniPageContainer.module.scss';
import {useContext, useEffect, useRef} from "react";
import {motion, useAnimation} from 'framer-motion';
import FilledButton from "../../buttons/FilledButton/FilledButton";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "../../buttons/IconButton/IconButton";
import {ScreenSizeContext} from "../../../context/ScreenSizeContext";
import {MiniPagesContext} from "../../../context/MiniPagesContext";

const MiniPageContainer = ({children, onClickSave}) => {
    const containerRef = useRef();
    const animation = useAnimation();

    const screenSizeContext = useContext(ScreenSizeContext);
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
        if (screenSizeContext.state === 'big') {
            containerRef.current.style.height = '100%'
        } else {
            containerRef.current.style.height = 'calc(100% - 4em - 32px)'
        }
    }, [screenSizeContext])

    useEffect(() => {
        animation.start({
            y: 0
        });
    }, [])

    return (
        <motion.div
            className={`${styles.container} Stack-Container Symmetrical`}
            ref={containerRef} initial={{y: '100%'}}
            animate={animation}
            transition={{type: "tween"}}
            exit={{y: "100%"}}
        >
            <div className={styles.staticElements} onTouchMove={handleMove} onTouchEnd={handleEnd}>
                {screenSizeContext.state === 'small' &&
                    <div className={styles.topLineContainer}>
                        <div className={styles.topLine}></div>
                    </div>
                }

                <div className={styles.actionButtonsContainer}>
                    <IconButton onClick={() => {miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''})}}><CloseIcon /></IconButton>
                    <FilledButton onClick={onClickSave}>Save</FilledButton>
                </div>
            </div>
            <div className={`Stack-Container ${styles.childrenContainer}`}>
                {children}
            </div>
        </motion.div>
    );
};

export default MiniPageContainer;
