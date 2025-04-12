package main

import (
	"log"

	"lead-worker-management/config"

	"lead-worker-management/internal/db"
	"lead-worker-management/internal/queue"
	"lead-worker-management/internal/worker"
)

func main() {

	cfg := config.LoadConfig()

	//Connect to RabbitMQ
	conn, err := queue.ConnectRabbitMQ(cfg.RabbitMQ_URL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	//Connect to MongoDB
	db.GetMongoClient(cfg.MongoDB_URI)

	manager := worker.NewWorkerManager()

	// Create and register workers
	manager.AddWorker(worker.NewWorker("aiCall.consumer", "sheet", conn))
	// manager.AddWorker(worker.NewWorker("callLead.queue", "call", conn))
	// manager.AddWorker(worker.NewWorker("webhook.queue", "webhook", conn))

	manager.StartAll(5) // Start with 5 goroutines per worker
	select {}
}
