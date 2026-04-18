package configuration

import (
	"strings"
	"sync"

	"github.com/alecthomas/kong"
	kongyaml "github.com/alecthomas/kong-yaml"
)

type Env string

const (
	EnvDev  Env = "development"
	EnvProd Env = "production"
)

type Config struct {
	Port         string    `yaml:"port" default:":8080"`
	Endpoints    []QbLogin `yaml:"endpoints"`
	FrontEndPath string    `yaml:"front_end_path" env:"FRONT_END_PATH" default:"./frontend/dist"`
	Env          string    `yaml:"env" default:"development"`
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

		options := []kong.Option{
			kong.DefaultEnvars(""),
		}

		if len(configFile) > 0 {
			options = append(options, kong.Configuration(kongyaml.Loader, configFile[0]))
		}

		parser, err := kong.New(configSingleton, options...)
		if err != nil {
			panic(err)
		}

		if _, err = parser.Parse([]string{}); err != nil {
			panic(err)
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
