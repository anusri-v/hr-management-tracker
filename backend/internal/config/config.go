package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port              string
	Env               string
	DatabaseURL       string
	DBMaxConns        int32
	DBMinConns        int32
	DBConnMaxLifetime time.Duration
}

func Load() (Config, error) {
	dbURL := getEnv("DATABASE_URL", "")
	if dbURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}
	return Config{
		Port:              getEnv("PORT", "8080"),
		Env:               getEnv("APP_ENV", "development"),
		DatabaseURL:       dbURL,
		DBMaxConns:        int32(getEnvInt("DB_MAX_CONNS", 10)),
		DBMinConns:        int32(getEnvInt("DB_MIN_CONNS", 2)),
		DBConnMaxLifetime: getEnvDuration("DB_CONN_MAX_LIFETIME", time.Hour),
	}, nil
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return fallback
}
