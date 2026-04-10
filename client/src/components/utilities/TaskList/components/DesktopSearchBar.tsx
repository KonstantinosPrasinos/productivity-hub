import { TbEraser, TbPlus, TbSearch } from "react-icons/tb";
import styles from "./DesktopSearchBar.module.scss";
import IconButton from "@/components/buttons/IconButton/IconButton";
import { useCallback, useContext, useEffect, useRef } from "react";
import { MiniPagesContext } from "@/context/MiniPagesContext";
import { motion } from "framer-motion"

const DesktopSearchBar = ({ searchFilter, setSearchFilter }: { searchFilter: string, setSearchFilter: (searchFilter: string) => void }) => {
    const miniPagesContext = useContext(MiniPagesContext);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleChange = (event: { target: { value: any; }; }) => {
        setSearchFilter(event.target.value);
    };

    const handleCreateClick = useCallback(() => {
        miniPagesContext.dispatch({
            type: "ADD_PAGE",
            payload: { type: "new-task" },
        })
    }, [miniPagesContext]);

    return (
        <div
            className={styles.container}
        >
            <div className={styles.searchContainer}>
                <TbSearch />
                <input
                    className={styles.searchTextInput}
                    placeholder="Search"
                    ref={inputRef}
                    value={searchFilter}
                    onChange={handleChange}
                ></input>
            </div>
            <motion.button
                onClick={handleCreateClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 1.0 }}
                className={styles.createButton}
            ><TbPlus /></motion.button>
        </div>
    );
}

export default DesktopSearchBar;