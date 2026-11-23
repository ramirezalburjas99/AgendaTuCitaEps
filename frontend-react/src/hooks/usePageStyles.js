import { useEffect  } from 'react'
// Recibe la lista de CSS de la pantalla, por ejemplo ['style.css']
export default function usePageStyles(archivos){

// Se convierte la lista en un texto para que React detecte si cambió
const clave = archivos.join('|')

useEffect(() => {
   
    // AL ENTRAR: crea un <link rel="stylesheet"> por cada Css y lo agrega al <head>
    
    const links = clave.split('|').map((archivo) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href =`/css/${archivo}`
        document.head.appendChild(link)
        return link
    })
    // Al SALIR de la pantalla: elimina esos <link> para que no afecten a la siguiente
    return () => links.forEach((link) => link.remove())
    }, [clave])
}
