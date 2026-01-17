package routers

import (
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/gqlGenerated"
	"github.com/kingsukhoi/qbitorrent-panel/pkg/gqlResolvers"
)

func NewGraphqlHandler() *handler.Server {
	// Create resolver
	resolver := &gqlResolvers.Resolver{}

	// Create GraphQL server
	h := handler.New(gqlGenerated.NewExecutableSchema(gqlGenerated.Config{
		Resolvers: resolver,
	}))

	h.AddTransport(transport.Options{})
	h.AddTransport(transport.GET{})
	h.AddTransport(transport.POST{})

	h.Use(extension.Introspection{})

	return h
}
