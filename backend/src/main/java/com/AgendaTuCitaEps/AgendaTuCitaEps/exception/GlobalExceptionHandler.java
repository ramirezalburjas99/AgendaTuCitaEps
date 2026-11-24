package com.AgendaTuCitaEps.AgendaTuCitaEps.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
 // Intercepta excepciones en todos los @ResstController y devuelve JSON uniforme:
// {"Mensaje": "Descripción clara del error"}

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ApiException.class)
        public ResponseEntity<Map<String, String>> manejarApiException (ApiException ex) {
            return ResponseEntity
                    .status(ex.getStatus())
                    .body(Map.of("mensaje", ex.getMessage()));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, String>> manejarValidacion (MethodArgumentNotValidException ex) {
            String detalle = ex.getBindingResult().getFieldErrors().stream()
                    .findFirst()
                    .map(err -> err.getDefaultMessage())
                    .orElse("Datos de solicitud inválidos");
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("mensaje", detalle));

        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, String>> manejarErorrGeneral (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error interno del servidor: " + ex.getMessage()));
        }
}
