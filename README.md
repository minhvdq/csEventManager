# CS Event Manager

A comprehensive event management system designed for the Computer Science department at Gettysburg College. This full-stack web application allows students and faculty to create, manage, and register for academic events with advanced features like location management, resume uploads, and automated email notifications.

## 🌐 Live Demo

**Live Demo:** [http://acm.gettysburg.edu/eventHub](http://acm.gettysburg.edu/eventHub)

**GitHub Repository:** [https://github.com/minhvdq/csEventManager](https://github.com/minhvdq/csEventManager)

## ✨ Features

### 🎯 Core Functionality
- **Event Creation & Management**: Create and manage academic events with detailed information
- **User Authentication**: Secure login system with role-based access (Admin/User)
- **Event Registration**: Students can register for events with custom requirements
- **Location Management**: Integrated Google Maps API for location selection and management
- **File Upload**: Support for event posters and resume uploads
- **Email Notifications**: Automated email confirmations for event registrations

### 🎨 User Interface
- **Responsive Design**: Modern, mobile-friendly interface built with React and Ant Design
- **Interactive Maps**: Google Maps integration for location selection and display
- **Advanced Filtering**: Filter events by term, year, type, and search functionality
- **Real-time Updates**: Dynamic content updates without page refresh

### 🔧 Administrative Features
- **Event Management**: Admins can edit, delete, and manage event deadlines
- **Attendee Management**: View and export attendee lists with detailed information
- **Resume Management**: Download and manage student resumes for events requiring them
- **Deadline Control**: Set and modify registration deadlines for events

### 📊 Event Features
- **Colloquium Support**: Special handling for colloquium events
- **Capacity Management**: Set event capacity limits
- **Major Requirements**: Track CS216 completion for specific events
- **Resume Requirements**: Optional resume upload for professional events
- **On/Off Campus Events**: Different handling for campus vs external events

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern JavaScript library for building user interfaces
- **Ant Design 5.26.2** - Enterprise-level UI design language and React UI library
- **React Router DOM 7.6.2** - Declarative routing for React
- **Axios 1.10.0** - Promise-based HTTP client
- **React DatePicker 8.4.0** - Date and time picker component
- **@react-google-maps/api 2.20.7** - Google Maps integration
- **Vite 7.0.0** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **MySQL2 3.14.1** - MySQL client for Node.js
- **JWT 9.0.2** - JSON Web Token authentication
- **Multer 2.0.1** - File upload middleware
- **Nodemailer 7.0.3** - Email sending functionality
- **Handlebars 4.7.8** - Email template engine
- **Bcrypt 6.0.0** - Password hashing
- **CORS 2.8.5** - Cross-origin resource sharing

### Development Tools
- **ESLint 9.29.0** - Code linting and formatting
- **Nodemon 3.1.10** - Development server with auto-restart
- **Cross-env 7.0.3** - Cross-platform environment variable setting

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- Google Maps API key (for location features)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/minhvdq/csEventManager.git
   cd csEventManager
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3000
   NODE_ENV=development
   SECRET=your_jwt_secret_key
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_database_name
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Set up the database**
   - Create a MySQL database
   - Import the database schema (contact the development team for schema details)

5. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Configure API endpoints**
   Update the base URL in `src/utils/homeUrl.js` to match your backend server

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
csProject/
├── backend/
│   ├── controller/          # API route handlers
│   ├── dataaccess/         # Database access layer
│   ├── service/            # Business logic layer
│   ├── utils/              # Utilities and middleware
│   ├── ui_assets/          # Static HTML pages
│   └── app.js              # Express app configuration
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /eventHub/api/login` - User login
- `POST /eventHub/api/auth/register` - User registration
- `POST /eventHub/api/auth/request-reset` - Password reset request
- `POST /eventHub/api/auth/reset-password` - Password reset

### Events
- `GET /eventHub/api/events` - Get all events
- `POST /eventHub/api/events` - Create new event
- `PUT /eventHub/api/events/:id` - Update event
- `DELETE /eventHub/api/events/:id` - Delete event

### Event Registration
- `POST /eventHub/api/eventRegister` - Register for event
- `GET /eventHub/api/eventRegister/attendees/:eventId` - Get event attendees

### Users & Students
- `GET /eventHub/api/users` - Get users
- `GET /eventHub/api/students` - Get students
- `POST /eventHub/api/students` - Create student

### Locations
- `GET /eventHub/api/locations` - Get locations
- `POST /eventHub/api/locations` - Create location

## 👥 User Roles

### Admin
- Create and manage events
- View and export attendee lists
- Manage event deadlines
- Delete events
- Access administrative dashboard

### User
- View events
- Register for events
- Upload resumes (when required)
- Receive email confirmations

## 🎯 Key Features in Detail

### Event Management
- **Rich Event Details**: Name, description, location, timing, capacity
- **Flexible Requirements**: Optional resume upload, major requirements
- **Deadline Management**: Set registration deadlines with admin override
- **Poster Support**: Upload event posters with image preview

### Registration System
- **Student Information**: Collect school email, ID, name, class year
- **Major Tracking**: Track CS216 completion for specific events
- **Resume Upload**: PDF resume upload with download functionality
- **Email Confirmation**: Automated email notifications upon registration

### Location Management
- **Google Maps Integration**: Search and select locations
- **On/Off Campus**: Different handling for campus vs external events
- **Room Information**: Additional room details for campus events

## 🔧 Development

### Running in Development Mode
```bash
# Backend
cd backend
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend start
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Authors

- **Damian Vu** - *Initial work* - [GitHub Profile]

## 🙏 Acknowledgments

- Gettysburg College Computer Science Department
- ACM Student Chapter
- Google Maps API for location services
- Ant Design for the beautiful UI components

---

**Note**: This project is actively maintained and deployed at Gettysburg College. For questions or support, please contact the development team or visit the live demo at [http://acm.gettysburg.edu/eventHub](http://acm.gettysburg.edu/eventHub). 