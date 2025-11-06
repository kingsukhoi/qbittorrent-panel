package configuration

import (
	"sync"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	Port      string    `yaml:"port" env-default:":8080"`
	Endpoints []QbLogin `json:"endpoints" yaml:"endpoints"`
}
type QbLogin struct {
	BasePath string `yaml:"path"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}

var once sync.Once
var configSingleton *Config

func MustGetConfig(configFile ...string) Config {
	once.Do(func() {
		configSingleton = &Config{}

		err := cleanenv.ReadEnv(configSingleton)
		if err != nil {
			panic(err)
		}

		if len(configFile) > 0 {
			errI := cleanenv.ReadConfig(configFile[0], configSingleton)
			if errI != nil {
				panic(errI)
			}
		}
	})
	return *configSingleton
}
