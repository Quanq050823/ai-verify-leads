package worker

import (
	"log"
)

type WorkerManager struct {
	workers []*Worker
}

// NewWorkerManager creates a new worker manager
func NewWorkerManager() *WorkerManager {
	return &WorkerManager{
		workers: []*Worker{},
	}
}

// AddWorker adds a worker to the manager
func (wm *WorkerManager) AddWorker(worker *Worker) {
	wm.workers = append(wm.workers, worker)
}

// StartAll starts all managed workers
func (wm *WorkerManager) StartAll(workerPoolSize int) {
	for _, w := range wm.workers {
		go w.Start(workerPoolSize)
	}

	log.Println("All workers started.")
	wm.waitForShutdown()
}

// waitForShutdown blocks until an interrupt signal is received
func (wm *WorkerManager) waitForShutdown() {
	// // Create context with cancel on SIGINT/SIGTERM
	// ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	// defer stop()

	// <-ctx.Done()
	// log.Println("Shutdown signal received. Waiting for workers to finish...")

	// // You could optionally implement graceful shutdown logic here
	// time.Sleep(2 * time.Second)
	// log.Println("Worker manager shutting down.")
}
