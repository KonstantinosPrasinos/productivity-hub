import React, { useEffect, useRef, useState } from "react";
import { TbPlugConnectedX, TbRefresh } from "react-icons/tb";
import styles from "./ConnectionBadges.module.scss";
import { AnimatePresence, motion } from "framer-motion";

const ConnectionBadges = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [changesSyncing, setChangesSyncing] = useState(false);
  const [categoriesSyncing, setCategoriesSyncing] = useState(true);
  const [tasksSyncing, setTasksSyncing] = useState(true);
  const [groupsSyncing, setGroupsSyncing] = useState(true);

  const serviceWorkerListenerExists = useRef(false);

  const serviceWorkerListener = (event) => {
    const { type } = event.data;

    switch (type) {
      case "SYNCING_STARTED":
        setChangesSyncing(true);
        break;
      case "SYNC_COMPLETED":
        setChangesSyncing(false);
        break;
      case "UPDATE_TASKS":
        setTasksSyncing(false);
        break;
      case "UPDATE_CATEGORIES":
        setCategoriesSyncing(false);
        break;
      case "UPDATE_GROUPS":
        setGroupsSyncing(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!serviceWorkerListenerExists.current) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(() => {
          navigator.serviceWorker.addEventListener(
            "message",
            serviceWorkerListener,
          );
        });
      }

      serviceWorkerListenerExists.current = false;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("offline", () => {
      setIsOffline(true);

      // When back online
      window.addEventListener(
        "online",
        () => {
          setIsOffline(false);
        },
        { once: true },
      );
    });
  }, []);

  useEffect(() => {
    function checkDatabaseExists(dbName) {
      return new Promise((resolve) => {
        const request = indexedDB.open(dbName);

        request.onsuccess = (event) => {
          const db = event.target.result;
          db.close();
          resolve(true);
        };

        request.onerror = () => {
          resolve(false);
        };

        request.onupgradeneeded = (event) => {
          event.target.transaction.abort();
          resolve(false);
        };
      });
    }

    const temp = async () => {
      const databaseExists = await checkDatabaseExists("productivity-hub-db");

      if (!databaseExists) {
        navigator.serviceWorker.removeEventListener(
          "message",
          serviceWorkerListener,
        );

        setTasksSyncing(false);
        setCategoriesSyncing(false);
        setGroupsSyncing(false);
      }
    };
    temp();
  }, []);

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {(tasksSyncing ||
          categoriesSyncing ||
          groupsSyncing ||
          changesSyncing) && (
          <motion.div
            className={styles.syncingBadge}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <TbRefresh />
          </motion.div>
        )}
        {isOffline && (
          <motion.div
            className={styles.offlineBadge}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <TbPlugConnectedX />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectionBadges;
