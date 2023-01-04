package webserver

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

func (w *WebServer) Route() {
	w.mux.Route("/api", func(r chi.Router) {
		r.Get("/user", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Hello"))
		})
	})
}
