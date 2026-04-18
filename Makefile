.PHONY: server frontend dev

server:
	go run cmd/graphqlServer/main.go

frontend:
	cd frontend && pnpm run dev

dev:
	$(MAKE) -j 2 server frontend

gqlGen:
	go generate ./gqlGen.go

sqlGenerate:
	sqlc generate
	trash dev.db && sqlite3 dev.db < schema.sql