import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { store } from './state/store';
import { Provider } from 'react-redux';
import ThemeContextProvider from './context/ThemeContext';
import ScreenSizeContextProvider from './context/ScreenSizeContext';
import AlertsContextProvider from './context/AlertsContext';
import MiniPagesContextProvider from "./context/MiniPagesContext";

ReactDOM.render(
  
    <React.StrictMode>
      <Provider store={store}>
        <AlertsContextProvider>
          <ScreenSizeContextProvider>
            <ThemeContextProvider>
              <MiniPagesContextProvider>
                  <App />
              </MiniPagesContextProvider>
            </ThemeContextProvider>
          </ScreenSizeContextProvider>
        </AlertsContextProvider>
      </Provider>
    </React.StrictMode>,
  document.getElementById('root')
);
