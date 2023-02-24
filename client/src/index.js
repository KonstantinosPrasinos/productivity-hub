import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {store} from './state/store';
import {Provider} from 'react-redux';
import AlertsContextProvider from './context/AlertsContext';
import MiniPagesContextProvider from "./context/MiniPagesContext";
import UserContextProvider from "./context/UserContext";
import {BrowserRouter} from "react-router-dom";
import {QueryClientProvider, QueryClient} from "react-query";

const queryClient = new QueryClient();

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <AlertsContextProvider>
                <MiniPagesContextProvider>
                    <UserContextProvider>
                        <BrowserRouter>
                            <QueryClientProvider client={queryClient}>
                                <App/>
                            </QueryClientProvider>
                        </BrowserRouter>
                    </UserContextProvider>
                </MiniPagesContextProvider>
            </AlertsContextProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
