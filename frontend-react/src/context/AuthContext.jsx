import { createContext, useContext, useState } from "react";

// Se crea el "contenedor" compartido de la sesión.
const AuthContext = createContext(null);

//Nombre bajo el que se guarda el usuario en el navegador (localStorage)
const CLAVE = "usuarioLogueado";

//AuthProvider envuelve toda la app (se usa en main.jsx) y reparte la sesión.
export function AuthProvider({ children }) {
  //useState guarda el paciente. La función inicial intenta recuperarlo de localStorage,
  // para que al recargar la página (F5) la sesión NO se pierda.
  const [paciente, setPaciente] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CLAVE));
    } catch {
      return null;
    }
  });

  // Se llama después de un login exitoso.
  const guardarSesion = (datos) => {
    localStorage.setItem(CLAVE, JSON.stringify(datos)); // persiste en el navegador
    setPaciente(datos); //actualiza lo que se ve en pantalla
  };

  //Se llama al presionar "Cerrar sesión".
  const cerrarSesion = () => {
    localStorage.removeItem(CLAVE);
    setPaciente(null);
  };

  // Todo lo que esté dentro de <AuthProvider> puede usar estos 3 valores.
  return (
    <AuthContext.Provider value={{ paciente, guardarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}
//Esto le dice a ESLint "ignora la regla en la línea siguiente". No cambia nada
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
