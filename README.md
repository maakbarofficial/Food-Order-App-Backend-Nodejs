# Food Delivery App Backend

Welcome to the Online Food Delivery App Backend! This repository contains the backend codebase for an online food delivery application. The backend is designed to handle authentication and authorization for Admins, Vendors, Customers, and Delivery Users. Additionally, it includes modules for payment processing, transactions, and managing deliveries.

## Features

- **Authentication and Authorization:**

  - Admins, Vendors, Customers, and Delivery Users can securely log in and access their respective functionalities.
  - Role-based access control ensures that each user can only perform authorized actions.

- **Admin Module:**

  - Admins can manage various aspects of the platform such as adding/removing vendors, viewing transaction details, and monitoring deliveries.

- **Vendor Module:**

  - Vendors can add/update their menu, manage orders, and and update their service.

- **Customer Module:**

  - Customers can browse restaurants, place orders, make payments, and track the status of their deliveries.

- **Delivery User Module:**

  - Delivery Users can view assigned orders, update delivery statuses, to communicate with customers.

- **Payment Module:**

  - Integration with payment gateways to facilitate secure online transactions.
  - Support for various payment methods such as credit/debit cards, digital wallets, etc.

- **Transaction Module:**

  - Recording and management of all financial transactions including orders, payments, refunds, etc.

- **Delivery Module:**

  - Handling the delivery process from order assignment to completion, including real-time tracking and updates for customers.

- **Additional Features:**

  - OTP verification using Twilio for enhanced security during authentication.
  - File upload functionality using multer for handling various types of file uploads.

## Technologies Used

- **Backend Framework:** Nodejs & Expressjs
- **Database:** MongoDB
- **Authentication:** Bearer Type
- **Payment Gateway:** Stripe (Example)

## Setup Instructions

1. Clone the repository to your local machine.
2. Install dependencies using `npm install`.
3. Set up the database and configure the database connection in the application.
4. Integrate with a payment gateway provider and configure payment options.
5. Run the application using `npm runs dev`.
6. Access the API endpoints based on the provided documentation.

## API Collection

Detailed API collection can be found [here](https://github.com/maakbarofficial/Food-Order-App-Backend-Nodejs/tree/main/API%20Collection).

## Developed By

- [Muhammad Ali Akbar](https://aliakbar.vercel.app/) - (Software Engineer)

## License

This project is licensed under the MIT License.

## Support

For any questions or issues, please contact [aliakbar.mql@gmail.com].
