// // consumer.ts
// import { Kafka } from 'kafkajs';
// import * as nodemailer from 'nodemailer';
// import { RestaurantCreatedEvent } from '../producer/producer';
// import { getAllUsers } from '../../db/common';

// interface User {
//   email: string;
//   name: string;
// }

// async function sendNotificationEmail(users: string[], restaurantName: string) {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.example.com',
//     port: 587,
//     secure: false,
//     auth: {
//       user: 'admin@rma.com',
//       pass: 'your-email-password'
//     }
//   });

//   for (const user of users) {
//     await transporter.sendMail({
//       from: 'admin@rma.com',
//       to: user.email,
//       subject: 'New Restaurant Created',
//       text: `A new restaurant, ${restaurantName}, was just created by the admin.`
//     });
//   }
// }

// async function runConsumer(kafka: Kafka) {
//   const consumer = kafka.consumer({ groupId: 'notification-service' });
//   await consumer.connect();
//   await consumer.subscribe({ topic: 'restaurant.created', fromBeginning: true });
//   await consumer.run({
//     eachMessage: async ({ message }) => {
//       if (message.value) {
//         const event = JSON.parse(message.value.toString()) as RestaurantCreatedEvent;
//         const users: string[] = await getAllUsers(); // Fetch users from your DB

//         await sendNotificationEmail(users, event.name);
//       }
//     },
//   });
// }

// // // Example usage
// // const kafka = new Kafka({
// //   brokers: ['localhost:9092'],
// //   clientId: 'rma-consumer'
// // });

// // runConsumer(kafka).catch(console.error);