import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Se dibuja la app dentro del <div id= "root"> de index.html
// las capas de afuera hacia adentro: rutas (BrowserRouter) > sesión (AuthProvider) > app.
// todo lo que esté dentro puede usar rutas y sesión.

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
