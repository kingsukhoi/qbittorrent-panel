package config

import (
	"gopkg.in/yaml.v3"
	"os"
	"sync"
)

type Config struct {
	Endpoints []QbLogin `json:"endpoints" yaml:"endpoints"`
}
type QbLogin struct {
	BasePath string `yaml:"path"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}

var singleton sync.Once
var config *Config

func MustGetConfig(path ...string) *Config {

	singleton.Do(func() {
		_, err := os.Stat(path[0])
		if err != nil {
			panic(err)
		}

		// Read the YAML file
		yamlFile, err := os.ReadFile(path[0])
		if err != nil {
			panic(err)
		}

		// Create a Config struct to hold the parsed data
		config = &Config{}

		// Parse the YAML into the struct
		err = yaml.Unmarshal(yamlFile, &config)
		if err != nil {
			panic(err)
		}
	})
	return config
}
