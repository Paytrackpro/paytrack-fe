package storage

import "fmt"

type Storage interface {
	UserStorage
}

type psql struct {
}

type Config struct {
	Type string
}

func NewStorage(c Config) (Storage, error) {
	return &psql{}, fmt.Errorf("not implemeted yet")
}
