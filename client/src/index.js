import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {store} from './state/store';
import {Provider} from 'react-redux';
import ScreenSizeContextProvider from './context/ScreenSizeContext';
import AlertsContextProvider from './context/AlertsContext';
import MiniPagesContextProvider from "./context/MiniPagesContext";
import ModalContextProvider from "./context/ModalContext";

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <AlertsContextProvider>
                <ScreenSizeContextProvider>
                    <MiniPagesContextProvider>
                        <ModalContextProvider>
                            <App/>
                        </ModalContextProvider>
                    </MiniPagesContextProvider>
                </ScreenSizeContextProvider>
            </AlertsContextProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
