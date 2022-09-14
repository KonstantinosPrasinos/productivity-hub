import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import { store } from './state/store';
import { Provider } from 'react-redux';
import ThemeContextProvider from './context/ThemeContext';
import ScreenSizeContextProvider from './context/ScreenSizeContext';
import AlertsContextProvider from './context/AlertsContext';

ReactDOM.render(
  
    <React.StrictMode>
      <Provider store={store}>
        <AlertsContextProvider>
          <ScreenSizeContextProvider>
            <ThemeContextProvider>
              <App />
            </ThemeContextProvider>
          </ScreenSizeContextProvider>
        </AlertsContextProvider>
      </Provider>
    </React.StrictMode>,
  document.getElementById('root')
);
