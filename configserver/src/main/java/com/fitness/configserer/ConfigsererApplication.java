package com.fitness.configserer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@SpringBootApplication
@EnableConfigServer
public class ConfigsererApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConfigsererApplication.class, args);
	}

}
