# College Alumni Networking Portal

A full-stack web application that connects college alumni with current students and fellow alumni for networking, mentorship, and career opportunities.

## Features

- **User Authentication**: Secure login and registration system
- **Alumni Directory**: Search and connect with alumni by graduation year, branch, company, and skills
- **Connection System**: Send and accept connection requests
- **Messaging**: Real-time messaging between connected users
- **Profile Management**: Complete user profiles with education, career, and contact information
- **Dashboard**: Personalized dashboard for different user roles (alumni, students, admin)
- **Events**: View and manage networking events
- **Job Board**: Post and browse job opportunities

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Joi for input validation

## Project Structure

```
college-alumni-networking-portal/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── lib/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── server.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd college-alumni-networking-portal
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory:
   ```
   PORT=5000
   MONGODB_URI=Your_Mongo_Atla_Connection_String
   JWT_SECRET=your-secret-key-here
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Root Setup** (optional - for monorepo management)
   ```bash
   cd ..
   npm install
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the Backend**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on http://localhost:5000

3. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on http://localhost:5173

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/directory` - Get alumni directory
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/me` - Update current user

### Connections
- `POST /api/connections/:id/request` - Send connection request
- `PATCH /api/connections/:id/accept` - Accept connection request
- `PATCH /api/connections/:id/reject` - Reject connection request
- `GET /api/connections` - Get user's connections

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/with/:userId` - Get messages with specific user
- `POST /api/messages` - Send message

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin only)
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Post job
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

## User Roles

- **Alumni**: Can connect with students, post jobs, view events
- **Student**: Can connect with alumni, apply for jobs, attend events
- **Admin**: Full access to manage users, events, and content

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@alumniportal.com or create an issue in this repository.
