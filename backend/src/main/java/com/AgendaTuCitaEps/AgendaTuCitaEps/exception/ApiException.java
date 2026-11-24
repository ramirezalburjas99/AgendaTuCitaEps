package com.AgendaTuCitaEps.AgendaTuCitaEps.exception;
import lombok.Getter;
import org.springframework.http.HttpStatus;


//Excepción personalizada de negocio que transporta el codigo HTTP exacto
//por ejemplo 400 Bad request, 404 Not found o 409 conflict
@Getter
public class ApiException extends RuntimeException{
    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
