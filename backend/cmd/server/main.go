package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/shopup/hr-management-tracker/internal/config"
	"github.com/shopup/hr-management-tracker/internal/database"
	"github.com/shopup/hr-management-tracker/internal/handlers"
	"github.com/shopup/hr-management-tracker/internal/routes"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	ctx := context.Background()
	pool, err := database.New(ctx, cfg)
	if err != nil {
		log.Fatalf("db init: %v", err)
	}

	h := handlers.New(pool)

	mux := http.NewServeMux()
	routes.Register(mux, h)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           mux,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("server listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("shutdown error: %v", err)
	}
	pool.Close()
	log.Println("server stopped")
}
