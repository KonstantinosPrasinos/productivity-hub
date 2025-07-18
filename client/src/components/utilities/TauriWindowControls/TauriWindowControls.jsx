import React from 'react';
import {WindowTitlebar} from "tauri-controls";
import styles from './TauriWindowControls.module.scss';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

export const TauriWindowControls = () => {
  console.log(getCurrentWebviewWindow());

  if (getCurrentWebviewWindow().label !== 'main') return <></>;

  return (
      <div className={styles.container} data-tauri-drag-region>
        <WindowTitlebar data-tauri-drag-region></WindowTitlebar>
      </div>
  );
};