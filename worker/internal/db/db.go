package db

import (
	"context"
	"log"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	client      *mongo.Client
	connectOnce sync.Once
)

func GetMongoClient(uri string) *mongo.Client {
	connectOnce.Do(func() {
		if uri == "" {
			log.Fatal("MONGODB_URI not set")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var err error
		client, err = mongo.Connect(ctx, options.Client().ApplyURI(uri))
		if err != nil {
			log.Fatalf("MongoDB connection error: %v", err)
		}

		if err := client.Ping(ctx, nil); err != nil {
			log.Fatalf("MongoDB ping failed: %v", err)
		}

		log.Println("MongoDB connected successfully")
	})

	return client
}
