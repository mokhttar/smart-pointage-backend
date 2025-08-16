# Smart Pointage Backend

A modern attendance tracking system backend built with Node.js, Express, TypeScript, and Prisma.

## Features

- **User Authentication**: JWT-based authentication for users and admins
- **Attendance Management**: Check-in/check-out functionality with automatic time tracking
- **Break Time Tracking**: Start and end breaks with optional reasons
- **Admin Dashboard**: Comprehensive statistics and user management
- **Database**: SQLite with Prisma ORM for easy database management
- **File Uploads**: Support for profile pictures and documents

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens
- **File Upload**: Multer middleware
- **Validation**: Custom middleware for request validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-pointage-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret-key"
PORT=3001
UPLOAD_DIR="uploads"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/login` - User/Admin login
- `POST /auth/register` - User registration

### User Routes
- `GET /user/stats` - Get user statistics
- `POST /user/checkin` - Check in to work
- `POST /user/checkout` - Check out from work
- `POST /user/sick` - Report sick day
- `POST /user/break/start` - Start break
- `POST /user/break/end` - End break

### Admin Routes
- `GET /admin/stats` - Get admin dashboard statistics
- `GET /admin/users` - Get all users
- `POST /admin/users` - Create new user
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

## Database Schema

The application uses the following main models:

- **Admin**: Admin user accounts
- **User**: Regular user accounts  
- **Attendance**: Daily attendance records
- **Break**: Break time tracking within attendance
- **MonthlyReport**: Monthly attendance summaries

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database

### Project Structure

```
src/
├── controller/          # Request controllers
├── lib/                # Utility libraries
│   ├── auth.ts         # Authentication utilities
│   ├── prisma.ts       # Database client
│   └── utils.ts        # General utilities
├── routes/             # API route definitions
│   ├── admin.ts        # Admin routes
│   ├── auth.ts         # Authentication routes
│   └── user.ts         # User routes
├── services/           # Business logic services
│   ├── adminService.ts # Admin operations
│   ├── authService.ts  # Authentication logic
│   └── userService.ts  # User operations
└── index.ts           # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
