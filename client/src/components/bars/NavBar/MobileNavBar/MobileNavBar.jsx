import { TbMenu, TbPlus, TbSearch, TbSettings, TbX } from "react-icons/tb";
import styles from "./MobileNavBar.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import { useMobileNavBar } from "./useMobileNavBar";

const MobileNavBar = () => {
    const {
        searchQuery,
        setSearchFilter,
        navBarVisible,
        navBarExpanded,
        handleCreateClick,
        handleMenuClick,
        settingsClicked
    } = useMobileNavBar();

    return <AnimatePresence>
        {navBarVisible && (
            <motion.div
                initial={{ y: 100, scale: 0.5 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 100, scale: 0.5 }}
                className={styles.container}
            >
                <motion.div layout className={styles.navBar}>
                    <AnimatePresence mode="popLayout">
                        {navBarExpanded && (
                            <>
                                <motion.div
                                    key="mobile-nav-search"
                                    className={styles.searchContainer}
                                    initial={{ width: 0, padding: 0, opacity: 0, margin: 0 }}
                                    animate={{ width: "auto", padding: 6, opacity: 1, margin: 5 }}
                                    exit={{ width: 0, padding: 0, opacity: 0, margin: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ overflow: "hidden" }}
                                >
                                    <TbSearch />
                                    <input
                                        className={styles.searchTextInput}
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                    ></input>
                                </motion.div>
                                <motion.button
                                    onClick={settingsClicked}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.0 }}
                                    initial={{ scale: 0, margin: 0 }}
                                    animate={{ scale: 1, margin: 5 }}
                                    exit={{ scale: 0, margin: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ overflow: "hidden" }}
                                    className={styles.menuButton}
                                ><TbSettings /></motion.button>
                            </>
                        )}
                    </AnimatePresence>
                    <motion.button layout className={styles.menuButton} onClick={handleMenuClick}>
                        <AnimatePresence mode="popLayout">
                            {navBarExpanded ?
                                <motion.div
                                    key="close"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.0 }}
                                >
                                    <TbX />
                                </motion.div> :
                                <motion.div
                                    key="open"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 1.0 }}
                                >
                                    <TbMenu />
                                </motion.div>
                            }
                        </AnimatePresence>
                    </motion.button>
                    <motion.button
                        layout
                        className={styles.addButton}
                        onClick={handleCreateClick}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 1.0 }}
                    >
                        <TbPlus />
                    </motion.button>
                </motion.div>

            </motion.div>
        )}
    </AnimatePresence>
}

export default MobileNavBar;