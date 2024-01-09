import React, {useEffect, useState} from 'react';
import {TbPlugConnectedX} from "react-icons/tb";
import styles from "./OfflineBadge.module.scss";

const OfflineBadge = () => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        window.addEventListener("offline", () => {
            setIsOffline(true);

            // When back online
            window.addEventListener("online", () => {
                setIsOffline(false);
            }, {once: true});
        });
    }, []);

    if (!isOffline) return;

    return (
        <div className={styles.container}>
            <TbPlugConnectedX />
        </div>
    );
};

export default OfflineBadge;