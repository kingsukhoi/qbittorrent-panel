package configuration

import (
	"strings"
	"sync"

	"github.com/ilyakaznacheev/cleanenv"
)

type Env string

const (
	EnvDev  Env = "development"
	EnvProd Env = "production"
)

type Config struct {
	Port         string    `yaml:"port" env-default:":8080"`
	Endpoints    []QbLogin `json:"endpoints" yaml:"endpoints"`
	FrontEndPath string    `yaml:"front_end_path" env:"FRONT_END_PATH" env-default:"./frontend/dist"`
	Env          string    `yaml:"env" env-default:"development"`
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

func (config *Config) GetEnv() Env {
	currEnv := strings.ToLower(config.Env)
	switch currEnv {
	case "dev":
		return EnvDev
	case "development":
		return EnvDev
	case "prod":
		return EnvProd
	case "production":
		return EnvProd
	default:
		return EnvDev
	}
}
