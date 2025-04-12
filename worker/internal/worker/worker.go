package worker

import (
	"lead-worker-management/internal/queue"
	"log"
)

// Worker represents a worker instance
type Worker struct {
	queueName  string
	workerType string
	conn       *queue.RabbitMQ
}

// NewWorker initializes a new worker
func NewWorker(queueName, workerType string, conn *queue.RabbitMQ) *Worker {
	return &Worker{
		queueName:  queueName,
		workerType: workerType,
		conn:       conn,
	}
}

// Start launches this worker with its own channel
func (w *Worker) Start(workerCount int) {
	for i := 0; i < workerCount; i++ {
		go func(workerID int) {
			channel, err := w.conn.CreateChannel()
			if err != nil {
				log.Fatalf("[Worker-%d] Failed to create channel: %v", workerID, err)
			}
			defer channel.Close()

			channel.Qos(1, 0, false)
			msgs, err := channel.Consume(
				w.queueName,
				"",    // consumer tag
				false, // autoAck
				false, // exclusive
				false, // noLocal
				false, // noWait
				nil,   // args
			)
			if err != nil {
				log.Fatalf("[Worker-%d] Failed to consume messages: %v", workerID, err)
			}

			log.Printf("[Worker-%d] Listening on queue: %s", workerID, w.queueName)

			for msg := range msgs {
				err := ProcessMessage(msg.Body, w.workerType)
				if err != nil {
					log.Printf("[Worker-%d] Error processing message: %v", workerID, err)
					msg.Nack(false, true)
				} else {
					msg.Ack(false)
				}
				log.Printf("[Worker-%d] Message processed successfully", workerID)
			}
		}(i)
	}
}
