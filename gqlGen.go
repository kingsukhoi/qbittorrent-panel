//go:build tools

package tools

//go:generate go run github.com/99designs/gqlgen generate

import (
	_ "github.com/99designs/gqlgen"
	_ "github.com/99designs/gqlgen/graphql/introspection"
)
