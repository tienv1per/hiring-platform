package kafka

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"github.com/job-portal/utility-service/email"
	"github.com/segmentio/kafka-go"
)

// StartEmailConsumer starts the Kafka consumer for email events
func StartEmailConsumer() {
	broker := os.Getenv("KAFKA_BROKER")
	if broker == "" {
		broker = "localhost:9092"
	}

	topic := os.Getenv("KAFKA_EMAIL_TOPIC")
	if topic == "" {
		topic = "email-notifications"
	}

	groupID := os.Getenv("KAFKA_GROUP_ID")
	if groupID == "" {
		groupID = "email-consumer-group"
	}

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{broker},
		GroupID:  groupID,
		Topic:    topic,
		MinBytes: 10e3, // 10KB
		MaxBytes: 10e6, // 10MB
	})
	defer reader.Close()

	log.Printf("✅ Kafka consumer started (group: %s, topic: %s)", groupID, topic)

	for {
		msg, err := reader.ReadMessage(context.Background())
		if err != nil {
			log.Printf("Error reading message: %v", err)
			continue
		}

		// Parse email event
		var event EmailEvent
		if err := json.Unmarshal(msg.Value, &event); err != nil {
			log.Printf("Error unmarshaling event: %v", err)
			continue
		}

		log.Printf("📬 Processing email event: %s to %s", event.Type, event.To)

		// Send email via SMTP
		if err := email.SendEmail(event.To, event.Subject, event.Body); err != nil {
			log.Printf("Failed to send email: %v", err)
			// In production, implement retry logic or dead letter queue
		} else {
			log.Printf("✅ Email sent successfully to %s", event.To)
		}
	}
}
