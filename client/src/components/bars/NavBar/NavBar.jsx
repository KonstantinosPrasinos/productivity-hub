import {useContext, useEffect, useState} from 'react';

import styles from './NavBar.module.scss'
import IconButton from "../../buttons/IconButton/IconButton";
import Button from "../../buttons/Button/Button";
import {TbHome, TbList, TbPlus, TbSettings} from "react-icons/tb";
import {useLocation, useNavigate} from "react-router-dom";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {motion} from "framer-motion";

const NavBar = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const [selected, setSelected] = useState(null);

    const miniPagesContext = useContext(MiniPagesContext);

    useEffect(() => {
        switch (location.pathname) {
            case '/':
            case '/home':
                setSelected('home')
                break;
            case '/list':
                setSelected('list')
                break;
            case '/settings':
                setSelected('settings')
                break;
            default:
                break;
        }
    }, [location]);

    return (
        <div className={styles.container}>
            <div className={`${styles.navBar}`}>
                <div className={styles.item}>
                    <IconButton
                        onClick={() => navigate('/', {replace: true})}
                        selected={selected === 'home'}
                        // setSelected={() => setSelected('home')}
                    >
                        <TbHome />
                    </IconButton>
                    {selected === 'home' &&
                        <motion.div className={styles.selectedBar} layoutId={"underline"} />
                    }
                </div>
                <div className={styles.item}>
                    <IconButton
                        onClick={() => {
                            navigate('/list', {replace: true});
                        }}
                        selected={selected === 'list'}
                    >
                        <TbList />
                    </IconButton>
                    {selected === 'list' &&
                        <motion.div className={styles.selectedBar} layoutId={"underline"} />
                    }
                </div>
                <div className={styles.item}>
                    <IconButton
                        onClick={() => navigate('/settings', {replace: true})}
                        selected={selected === 'settings'}
                    >
                        <TbSettings />
                    </IconButton>
                    {selected === 'settings' &&
                        <motion.div className={styles.selectedBar} layoutId={"underline"} />
                    }
                </div>
                <Button
                    type='square'
                    onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-task'}})}
                >
                    <TbPlus />
                </Button>
            </div>
        </div>

    );
}

export default NavBar;