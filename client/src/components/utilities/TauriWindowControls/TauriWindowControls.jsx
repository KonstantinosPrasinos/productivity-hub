import React, {useEffect, useMemo, useRef, useState} from 'react';
import {WindowTitlebar} from "tauri-controls";
import styles from './TauriWindowControls.module.scss';
import {listen} from "@tauri-apps/api/event";
import {platform} from "@tauri-apps/plugin-os";

const TauriWindowControls = () => {
  const tauriListenerRef = useRef(null);
  const [showTitleBar, setShowTitleBar] = useState(true);
  const os = useMemo(() => {
    if (!window.isTauri) return null;
    return platform();
  }, [])

  useEffect(() => {
    const assignListener = async () => {

      // If the app is running in tauri then return
      tauriListenerRef.current = await listen('app-window-state', (event) => {
        if (event.payload === 'tray') {
          setShowTitleBar(false);
        } else {
          setShowTitleBar(true)
        }
      });
    }
    if (window.isTauri && ['windows', 'macos', 'linux'].includes(os)) {
      assignListener();
    }
    return () => {
      if (tauriListenerRef.current) {
        tauriListenerRef.current.then(unlisten => unlisten());
      }
    };
  }, []);

  if (!window.isTauri || !showTitleBar || !['windows', 'macos', 'linux'].includes(os))
    return <></>;

  return (
      <div className={styles.container} data-tauri-drag-region>
        <WindowTitlebar data-tauri-drag-region></WindowTitlebar>
      </div>
  );
};

export default TauriWindowControls;