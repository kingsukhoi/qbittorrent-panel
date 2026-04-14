package database

import (
	"database/sql"
	_ "embed"
	"sync"

	qbittorrent_panel "github.com/kingsukhoi/qbitorrent-panel"
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

		_, err = instance.Exec(qbittorrent_panel.SQL_SCHEMA)
		if err != nil {
			panic(err)
		}

	})
	return instance
}
