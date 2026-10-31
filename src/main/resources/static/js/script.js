function confirmarEliminacion(entidad) {
    return confirm(`¿Está seguro de que desea eliminar este ${entidad}? Esta acción no se puede deshacer.`);
}

function alternarContrasena() {

    const campoContrasena = document.getElementById("contrasena");

    if (campoContrasena.type === "password") {

        campoContrasena.type = "text";

    } else {

        campoContrasena.type = "password";

    }

}