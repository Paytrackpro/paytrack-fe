package webserver

import (
	"code.cryptopower.dev/private/mgmt-ng/storage"
	"fmt"
	"github.com/go-chi/chi/v5"
	"log"
	"net/http"
)

type Config struct {
	Port int
}

type WebServer struct {
	mux  *chi.Mux
	conf *Config
	db   storage.Storage
}

func NewWebServer(c Config, db storage.Storage) (*WebServer, error) {
	return &WebServer{
		mux:  chi.NewRouter(),
		conf: &c,
		db:   db,
	}, nil
}

func (w *WebServer) Run() error {
	w.Route()
	log.Printf("mgmtngd is running on :%d", w.conf.Port)
	var server = http.Server{
		Addr:              fmt.Sprintf(":%d", w.conf.Port),
		Handler:           w.mux,
		TLSConfig:         nil,
		ReadTimeout:       0,
		ReadHeaderTimeout: 0,
		WriteTimeout:      0,
		IdleTimeout:       0,
		MaxHeaderBytes:    0,
		TLSNextProto:      nil,
		ConnState:         nil,
		ErrorLog:          nil,
		BaseContext:       nil,
		ConnContext:       nil,
	}
	return server.ListenAndServe()
}
