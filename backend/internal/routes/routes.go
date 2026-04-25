package routes

import (
	"net/http"

	"github.com/shopup/hr-management-tracker/internal/handlers"
	"github.com/shopup/hr-management-tracker/internal/middleware"
)

func Register(mux *http.ServeMux, h *handlers.Handlers) {
	mux.Handle("GET /api/health", middleware.Chain(
		http.HandlerFunc(h.Health),
		middleware.Logger,
		middleware.CORS,
	))
	mux.Handle("GET /api/ready", middleware.Chain(
		http.HandlerFunc(h.Ready),
		middleware.Logger,
		middleware.CORS,
	))
}
