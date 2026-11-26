import { useEffect, useState } from "react";

/**
 * Carga los archivos CSS de una pantalla y avisa cuándo YA están aplicados.
 *
 * Por qué devuelve un booleano:
 *   Antes el CSS se agregaba dentro de un useEffect, que corre DESPUÉS del primer
 *   pintado. Por eso la pantalla se veía 1 instante "sin estilos" (logo gigante,
 *   todo desordenado) y luego se acomodaba. Ahora cada pantalla espera a que
 *   este hook devuelva true antes de dibujarse.
 *
 * Uso:
 *   const estilosListos = usePageStyles(["layout.css"]);
 *   ...(los demás hooks de la pantalla)...
 *   if (!estilosListos) return null;   // no dibuja nada hasta tener estilos
 *
 * @param {string[]} archivos - nombres de los CSS dentro de /public/css
 * @returns {boolean} true cuando todos los CSS terminaron de cargar
 */
export default function usePageStyles(archivos) {
  // Se convierte la lista en texto para que React detecte si realmente cambió.
  const clave = archivos.join("|");

  // Guarda la "clave" de los estilos que ya terminaron de cargar.
  // Comparar contra la clave actual evita tener que "reiniciar" el estado a mano.
  const [claveCargada, setClaveCargada] = useState(null);

  useEffect(() => {
    // Bandera para ignorar la respuesta si la pantalla se cerró antes de terminar.
    let activo = true;

    // AL ENTRAR: se crea un <link rel="stylesheet"> por cada CSS y se agrega al <head>.
    // Cada uno genera una promesa que se cumple cuando el archivo termina de cargar
    // (o falla: igual se resuelve para que la pantalla nunca quede en blanco).
    const cargas = clave.split("|").map((archivo) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `/css/${archivo}`;
      const termino = new Promise((resolver) => {
        link.onload = resolver;
        link.onerror = resolver;
      });
      document.head.appendChild(link);
      return { link, termino };
    });

    // Cuando TODOS terminan, marcamos esta clave como lista.
    Promise.all(cargas.map((c) => c.termino)).then(() => {
      if (activo) setClaveCargada(clave);
    });

    // AL SALIR de la pantalla: se quitan esos <link> para que no afecten a la siguiente.
    return () => {
      activo = false;
      cargas.forEach((c) => c.link.remove());
    };
  }, [clave]);

  return claveCargada === clave;
}
