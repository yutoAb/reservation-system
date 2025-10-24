# Reservation System

A full-stack reservation management system built with React, TypeScript, FastAPI, and PostgreSQL, all containerized with Docker for easy deployment.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Reservation Management**: Create, view, and cancel reservations
- **Time Slot Management**: Admin can create and manage available time slots
- **Admin Dashboard**: Comprehensive admin interface for managing all reservations and time slots
- **Responsive UI**: Modern, clean interface built with React and Tailwind CSS
- **Docker Deployment**: Fully containerized application for easy deployment

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- shadcn/ui for UI components
- Axios for API calls
- date-fns for date formatting

### Backend
- FastAPI (Python 3.12)
- SQLAlchemy for ORM
- PostgreSQL database
- JWT authentication
- Pydantic for data validation
- Poetry for dependency management

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 16
- Nginx (for frontend in production)

## Project Structure

```
reservation-system/
├── backend/
│   ├── app/
│   │   ├── core/           # Core configuration and utilities
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── routers/        # API endpoints
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your system
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd reservation-system
```

2. Create environment files (optional, defaults are provided):
```bash
cp .env.example .env
```

3. Build and start the containers:
```bash
docker compose up -d
```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### First Time Setup

1. Register a new user account through the frontend
2. To create an admin user, you'll need to manually update the database:
```bash
docker compose exec db psql -U postgres -d reservations
UPDATE users SET is_admin = true WHERE username = 'your_username';
\q
```

3. As an admin, you can create time slots through the Admin Dashboard

## Development

### Running Locally Without Docker

#### Backend

```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/reservations
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Time Slots
- `GET /time-slots/` - Get all available time slots
- `POST /time-slots/` - Create a new time slot (Admin only)
- `DELETE /time-slots/{id}` - Delete a time slot (Admin only)

### Reservations
- `GET /reservations/` - Get current user's reservations
- `GET /reservations/all` - Get all reservations (Admin only)
- `POST /reservations/` - Create a new reservation
- `PATCH /reservations/{id}` - Update a reservation
- `DELETE /reservations/{id}` - Cancel a reservation

## Deployment to AWS

This application is designed to be easily deployed to AWS. Here are recommended approaches:

### Option 1: AWS ECS with Fargate
1. Push Docker images to Amazon ECR
2. Create ECS task definitions for each service
3. Set up an Application Load Balancer
4. Use RDS for PostgreSQL database
5. Configure environment variables in ECS

### Option 2: AWS EC2
1. Launch an EC2 instance
2. Install Docker and Docker Compose
3. Clone the repository
4. Run `docker compose up -d`
5. Configure security groups for ports 80, 443, 8000

### Option 3: AWS Elastic Beanstalk
1. Use Docker Compose configuration
2. Deploy using EB CLI
3. Configure RDS for database
4. Set environment variables in EB console

## Database Schema

### Users Table
- id (Primary Key)
- email (Unique)
- username (Unique)
- hashed_password
- is_active
- is_admin

### Time Slots Table
- id (Primary Key)
- start_time
- end_time
- is_available
- capacity

### Reservations Table
- id (Primary Key)
- user_id (Foreign Key)
- time_slot_id (Foreign Key)
- status (pending/confirmed/cancelled)
- notes
- created_at

## Security Considerations

- JWT tokens for authentication
- Password hashing with bcrypt
- CORS configured for development (should be restricted in production)
- Environment variables for sensitive data
- SQL injection protection through SQLAlchemy ORM

## Production Recommendations

1. **Change the SECRET_KEY**: Generate a secure random key
2. **Use HTTPS**: Set up SSL/TLS certificates
3. **Configure CORS**: Restrict allowed origins
4. **Database Backups**: Set up automated backups for PostgreSQL
5. **Monitoring**: Add logging and monitoring (e.g., CloudWatch, Datadog)
6. **Scaling**: Use load balancers and auto-scaling groups
7. **Environment Variables**: Use AWS Secrets Manager or Parameter Store

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `docker compose ps`
- View backend logs: `docker compose logs backend`
- Ensure DATABASE_URL is correct

### Frontend can't connect to backend
- Verify VITE_API_URL is set correctly
- Check if backend is running on port 8000
- Look for CORS errors in browser console

### Database connection issues
- Wait for PostgreSQL to be fully ready (healthcheck)
- Verify database credentials
- Check network connectivity between containers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.

### 管理者アカウント作成

```
yuto2@yutoabe:~/2025/app/reservation-system$ docker compose exec backend python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    username='admin',
    email='admin@example.com',
    hashed_password=get_password_hash('admin123'),
    is_admin=True
)
db.add(admin)
db.commit()
print('Admin user created: username=admin, password=admin123')
"
WARN[0000] /home/yuto2/2025/app/reservation-system/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion 
Admin user created: username=admin, password=admin123
```
