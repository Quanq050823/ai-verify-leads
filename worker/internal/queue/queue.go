package queue

import (
	"fmt"
	"log"

	"github.com/streadway/amqp"
)

// RabbitMQ represents a connection to a RabbitMQ server
type RabbitMQ struct {
	Connection *amqp.Connection
	Channel    *amqp.Channel
}

// Connect to rabbitmq server
func ConnectRabbitMQ(RabbitMQ_URL string) (*RabbitMQ, error) {
	// Connect to RabbitMQ using configuration
	conn, err := amqp.Dial(RabbitMQ_URL)
	if err != nil {
		log.Println("Failed to connect to RabbitMQ:", err)
		return nil, err
	}

	// Open a channel
	ch, err := conn.Channel()
	if err != nil {
		fmt.Println("Failed to open a channel:", err)
		return nil, err
	}
	log.Println("Successfully connected to RabbitMQ")

	return &RabbitMQ{
		Connection: conn,
		Channel:    ch,
	}, nil
}

// CreateChannel creates a new channel from an existing connection
func (r *RabbitMQ) CreateChannel() (*amqp.Channel, error) {
	if r.Connection == nil {
		return nil, fmt.Errorf("connection is not established")
	}

	channel, err := r.Connection.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to create channel: %w", err)
	}

	return channel, nil

}

// PublishMessage publishes a message to the specified exchange and routing key
func (r *RabbitMQ) PublishMessage(exchange, routingKey string, mandatory, immediate bool, msg amqp.Publishing) error {
	if r.Channel == nil {
		return fmt.Errorf("channel is not established")
	}

	return r.Channel.Publish(
		exchange,   // exchange
		routingKey, // routing key
		mandatory,  // mandatory
		immediate,  // immediate
		msg,        // message
	)
}

// ConsumeMessages starts consuming messages from the specified queue
func (r *RabbitMQ) ConsumeMessages(queueName string, autoAck bool) (<-chan amqp.Delivery, error) {
	if r.Channel == nil {
		return nil, fmt.Errorf("channel is not established")
	}

	return r.Channel.Consume(
		queueName, // queue
		"",        // consumer
		autoAck,   // auto-ack
		false,     // exclusive
		false,     // no-local
		false,     // no-wait
		nil,       // args
	)
}

// Close closes both the channel and connection
func (r *RabbitMQ) Close() error {
	var err error

	if r.Channel != nil {
		if err = r.Channel.Close(); err != nil {
			return fmt.Errorf("failed to close channel: %w", err)
		}
	}

	if r.Connection != nil {
		if err = r.Connection.Close(); err != nil {
			return fmt.Errorf("failed to close connection: %w", err)
		}
	}

	return nil
}
