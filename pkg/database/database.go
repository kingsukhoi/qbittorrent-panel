package database

import (
	"database/sql"
	"sync"

	_ "modernc.org/sqlite"
)

var (
	instance *sql.DB
	once     sync.Once
)

// MustGet returns the singleton in-memory SQLite database instance, panics on error.
func MustGet() *sql.DB {
	once.Do(func() {
		db, err := sql.Open("sqlite", "file::memory:?cache=shared&mode=memory")
		if err != nil {
			panic(err)
		}
		db.SetMaxOpenConns(1)
		instance = db
	})
	return instance
}
