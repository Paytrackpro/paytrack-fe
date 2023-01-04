package main

import (
	"code.cryptopower.dev/private/mgmt-ng/storage"
	"code.cryptopower.dev/private/mgmt-ng/webserver"
)

type Config struct {
}

func loadConfig() (*Config, error) {
	return &Config{}, nil
}

func (c *Config) dbConfig() storage.Config {
	return storage.Config{}
}

func (c *Config) webConfig() webserver.Config {
	return webserver.Config{
		Port: 6789,
	}
}
