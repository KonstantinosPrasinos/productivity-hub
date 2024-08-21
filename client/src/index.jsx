import React from "react";
import App from "./App";
import AlertsContextProvider from "./context/AlertsContext";
import MiniPagesContextProvider from "./context/MiniPagesContext";
import UserContextProvider from "./context/UserContext";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "react-query";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  // <React.StrictMode>
  <GoogleOAuthProvider
    clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    onScriptLoadError={() => console.log("failed to load script")}
  >
    <AlertsContextProvider>
      <MiniPagesContextProvider>
        <UserContextProvider>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </BrowserRouter>
        </UserContextProvider>
      </MiniPagesContextProvider>
    </AlertsContextProvider>
  </GoogleOAuthProvider>,
  // </React.StrictMode>
);
