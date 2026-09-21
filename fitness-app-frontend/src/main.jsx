import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";

import { Provider } from "react-redux";
import { AuthProvider } from "react-oauth2-code-pkce";

import App from "./App";
import { authConfig } from "./authConfig";
import "./index.css";
import { store } from "./store/store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider authConfig={authConfig} loadingComponent={<div>Loading...</div>}>
      <Provider store={store}>
        <App />
      </Provider>
    </AuthProvider>
  </BrowserRouter>,
);