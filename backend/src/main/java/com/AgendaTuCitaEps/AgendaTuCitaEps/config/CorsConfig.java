package com.AgendaTuCitaEps.AgendaTuCitaEps.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings (CorsRegistry registry) {
        // Permite peticiones REST desde (React)
        registry.addMapping("/api/**")

                .allowedOrigins("http://localhost:5173") //RECUERDA AGREGAR LOCALHOST: EL PUERTO DEL FRONT

                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE","OPTIONS")

                .allowedHeaders("*")

                .allowCredentials(true);
    }

}

