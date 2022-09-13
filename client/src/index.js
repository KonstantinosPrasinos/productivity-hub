import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import { store } from './state/store';
import { Provider } from 'react-redux';
import ThemeContextProvider from './context/ThemeContext';
import ScreenSzieContextProvider from './context/ScreenSizeContext';

ReactDOM.render(
  
    <React.StrictMode>
      <Provider store={store}>
        <ScreenSzieContextProvider>
          <ThemeContextProvider>
            <App />
          </ThemeContextProvider>
        </ScreenSzieContextProvider>
      </Provider>
    </React.StrictMode>,
  document.getElementById('root')
);
