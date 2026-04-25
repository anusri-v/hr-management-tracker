.PHONY: run build test tidy migrate-up migrate-down migrate-create

MIGRATE = migrate -path migrations -database "$$DATABASE_URL"

run:
	go run ./cmd/server

build:
	go build -o bin/server ./cmd/server

test:
	go test ./...

tidy:
	go mod tidy

migrate-up:
	$(MIGRATE) up

migrate-down:
	$(MIGRATE) down 1

migrate-create:
	@read -p "name: " name; migrate create -ext sql -dir migrations -seq $$name
