package worker

import (
	"encoding/json"
	"fmt"

	"lead-worker-management/internal/handlers"
)

// LeadMessage represents the lead data format
type LeadMessage struct {
	RoutingKey string          `json:"routingKey"` // Routing key for the message
	Data       json.RawMessage `json:"data"`       // Additional payload
	DateTime   string          `json:"dateTime"`   // Timestamp of the message
}

// ProcessMessage processes incoming lead messages
func ProcessMessage(body []byte, workerType string) error {
	var lead LeadMessage
	if err := json.Unmarshal(body, &lead); err != nil {
		return fmt.Errorf("failed to parse message: %w", err)
	}

	// log.Printf("Processing lead: %s", lead.Data)

	// Route processing based on node type
	switch workerType {
	case "aiCall.consumer":
		return handlers.HandleCall(&lead.Data)
	case "webhook":
		return handlers.HandleCall(&lead.Data)
	case "sheet":
		return handlers.HandleCall(&lead.Data)
	default:
		return fmt.Errorf("unknown lead type: %s", workerType)
	}
}
