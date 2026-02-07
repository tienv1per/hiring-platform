package kafka

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/segmentio/kafka-go"
)

var producer *kafka.Writer

// EmailEvent represents an email notification event
type EmailEvent struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
	Type    string `json:"type"` // password-reset, application-submitted, status-changed
}

// InitProducer initializes the Kafka producer
func InitProducer() {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "localhost:9092"
	}

	topic := os.Getenv("KAFKA_EMAIL_TOPIC")
	if topic == "" {
		topic = "email-notifications"
	}

	producer = &kafka.Writer{
		Addr:         kafka.TCP(broker),
		Topic:        topic,
		Balancer:     &kafka.LeastBytes{},
		WriteTimeout: 10 * time.Second,
		ReadTimeout:  10 * time.Second,
	}

	log.Printf("✅ Kafka producer initialized (broker: %s, topic: %s)", broker, topic)
}

// CloseProducer closes the Kafka producer
func CloseProducer() {
	if producer != nil {
		producer.Close()
		log.Println("Kafka producer closed")
	}
}

// ProduceEmailEvent sends an email event to Kafka
func ProduceEmailEvent(event EmailEvent) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	message := kafka.Message{
		Key:   []byte(event.To),
		Value: data,
		Time:  time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = producer.WriteMessages(ctx, message)
	if err != nil {
		log.Printf("Failed to produce email event: %v", err)
		return err
	}

	log.Printf("📧 Email event produced: %s to %s", event.Type, event.To)
	return nil
}
