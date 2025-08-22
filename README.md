# CS Event Manager

A comprehensive event management system designed for the Computer Science department at Gettysburg College. This full-stack web application allows students and faculty to create, manage, and register for academic events with advanced features like location management, resume uploads, and automated email notifications.

**🌐 Live Demo:** [https://acm.gettysburg.edu/eventHub](https://acm.gettysburg.edu/eventHub)  
**📂 GitHub Repository:** [https://github.com/minhvdq/csEventManager](https://github.com/minhvdq/csEventManager)

---

## Key Features

This platform provides a robust set of features for event organizers, administrators, and student attendees.

### Event & Location Management
* **Dynamic Event Creation**: Authorized users can create, modify, and delete events, providing details like name, description, date, time, and capacity.
* **Integrated Location Selection**: Utilizes the Google Maps API to allow for easy searching and selection of both on-campus and off-campus event locations.
* **Event Poster Uploads**: Support for uploading and displaying event posters.
* **Advanced Filtering**: Users can easily find events by filtering based on academic term, year, event type, or through a search bar.

### Student Registration & Profiles
* **Secure Registration**: New students must have their accounts approved by an admin. The system verifies users against the school database.
* **Smart Profile Management**: For existing students, registration forms are pre-filled. Students can update their resume and their CS216 status (taken/taking), with updates limited to once per semester to maintain data integrity.
* **Custom Event Requirements**: Events can be configured to require a resume submission or to be restricted to students who have completed CS216.

### Attendance & Administration
* **Barcode Check-in**: A streamlined attendance system allows students to check in by scanning their school ID barcode. The system instantly verifies the student, creates a profile if one doesn't exist, and records their attendance.
* **Role-Based Access Control**: Three distinct user levels (Student, User, Admin) ensure that users only have access to appropriate functionalities. Admins have full system oversight, including user account management.
* **Attendee Management**: Event organizers can view and export a CSV file of all registered attendees, including their contact information and resumes.
* **Automated Email Notifications**: The system automatically sends email confirmations to students upon successful event registration using Nodemailer and Handlebars for templating.

---

## Technical Architecture

The application's backend is built on a three-layer architecture to ensure a clear separation of concerns, making the system scalable and easy to maintain.

* **Controller Layer**: This layer handles all incoming HTTP requests from the frontend. It validates incoming data and calls the appropriate service layer functions to handle the business logic. It is the entry point for all API interactions.
* **Service Layer**: This is the core of the backend, containing all the business logic. It processes data, interacts with external APIs, and coordinates with the data access layer to perform operations. It ensures that data is in the correct format before being sent to the database or back to the client.
* **Data Access Layer (DAL)**: This layer is solely responsible for all database interactions. It contains the raw SQL queries and logic needed to create, read, update, and delete records from the MySQL database, abstracting database operations from the rest of the application.

---

## Technology Stack

### Frontend
* **React `18.3.1`**: A modern JavaScript library for building dynamic user interfaces.
* **Ant Design `5.26.2`**: An enterprise-level UI library for creating a polished and responsive user experience.
* **React Router DOM `7.6.2`**: For declarative, client-side routing.
* **Axios `1.10.0`**: A promise-based HTTP client for making API requests to the backend.
* **@react-google-maps/api `2.20.7`**: For Google Maps integration.
* **Vite `7.0.0`**: A next-generation frontend tooling system for fast development and optimized builds.

### Backend
* **Node.js & Express.js `5.1.0`**: A JavaScript runtime and web framework for building the robust RESTful API.
* **MySQL2 `3.14.1`**: A high-performance MySQL client for Node.js.
* **JSON Web Token (JWT) `9.0.2`**: For implementing secure, stateless user authentication.
* **Bcrypt `6.0.0`**: For securely hashing user passwords.
* **Multer `2.0.1`**: A middleware for handling `multipart/form-data`, primarily used for file uploads (resumes and posters).
* **Nodemailer `7.0.3`**: A module for sending automated emails.

---

## API Endpoints

* **Authentication**:
    * `POST /eventHub/api/login`
    * `POST /eventHub/api/auth/register`
    * `POST /eventHub/api/auth/request-reset`
    * `POST /eventHub/api/auth/reset-password`
* **Events**:
    * `GET /eventHub/api/events`
    * `POST /eventHub/api/events`
    * `PUT /eventHub/api/events/:id`
    * `DELETE /eventHub/api/events/:id`
* **Event Registration**:
    * `POST /eventHub/api/eventRegister`
    * `GET /eventHub/api/eventRegister/attendees/:eventId`
* **Users & Students**:
    * `GET /eventHub/api/users`
    * `POST /eventHub/api/students`
* **Locations**:
    * `GET /eventHub/api/locations`
    * `POST /eventHub/api/locations`

---

## Project Status & Next Steps

### Completed
* Core functionality for event creation, student registration, and user authentication.
* Attendance tracking and CSV data export.
* Admin portal for managing user accounts.
* Database tables for event photos and resource links.

### To Be Implemented
* **Event Media Management**: A feature allowing users to upload event photos and share resource links.
* **Colloquium Attendance Finalization**: Fully integrate the barcode scanning system for all colloquium events to automate attendance tracking.

---

## Authors & Acknowledgments

* **Damian Vu** - *Initial Work* - [GitHub Profile](https://github.com/minhvdq)
* **Acknowledgments**:
    * Gettysburg College Computer Science Department
    * ACM Student Chapter
    * Google Maps API & Ant Design