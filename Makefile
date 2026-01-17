.PHONY: server frontend dev

server:
	go run cmd/graphqlServer/main.go

frontend:
	cd frontend && pnpm run dev

dev:
	$(MAKE) -j 2 server frontend

gqlGen:
	go generate ./gqlGen.go