package models

import (
	"time"

	"github.com/google/uuid"
)

type AccessStatus string

const (
	AccessStatusPending  AccessStatus = "pending"
	AccessStatusApproved AccessStatus = "approved"
	AccessStatusRevoked  AccessStatus = "revoked"
)

type User struct {
	ID           uuid.UUID
	GoogleSub    string
	Email        string
	Name         string
	PictureURL   *string
	AccessStatus AccessStatus
	ApprovedBy   *uuid.UUID
	ApprovedAt   *time.Time
	RevokedBy    *uuid.UUID
	RevokedAt    *time.Time
	LastLoginAt  *time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
