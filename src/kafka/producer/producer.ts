// producer.ts
import { Kafka } from 'kafkajs';


export async function notifyRestaurantCreated(
  kafka: Kafka,
  event: string
) {
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic: 'restaurantCreated',
    messages: [{ value: JSON.stringify(event) }],
  });
  await producer.disconnect();
}

// Example usage
// const kafka = new Kafka({
//   brokers: ['localhost:9092'],
//   clientId: 'rma-producer'
// });


