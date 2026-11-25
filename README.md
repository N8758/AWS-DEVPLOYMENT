# 🧺 Laundry Management System

A full-stack Laundry Management System designed to simplify laundry business operations, customer management, order processing, billing and service management.

The application uses React.js for the frontend and Node.js with Express.js for the backend, with PostgreSQL as its database.

**Live Project:** https://neocleanhubs.com/

---

## 📌 Project Overview

The Laundry Management System provides a centralized platform for managing day-to-day laundry business operations.

It aims to simplify order management, streamline billing, manage services and offers, and improve operational efficiency through a web-based application.

## ✨ Key Features

- Customer and order management
- Laundry service management
- Billing and payment integration
- Service and offer management
- User authentication and authorization
- Dashboard and operational management
- Real-time communication using Socket.IO
- QR code functionality
- Invoice and PDF generation
- Firebase integration

*Feature availability may vary depending on the configured application modules.*

## 🛠️ Technology Stack

### Frontend
- React.js 19
- JavaScript
- React Router
- Axios
- React Icons
- Recharts
- HTML2Canvas
- jsPDF

### Backend
- Node.js
- Express.js 5
- REST APIs
- JSON Web Token (JWT)
- bcrypt / bcryptjs
- Socket.IO
- Multer
- Node-Cron

### Database and Integrations
- PostgreSQL
- MongoDB integration (Mongoose)
- Firebase Admin SDK
- Razorpay integration

### DevOps and Deployment
- Git and GitHub
- Docker
- Docker Compose
- Nginx
- AWS (planned deployment infrastructure)
- Amazon RDS for PostgreSQL (planned)
- Amazon ECR (planned)

---

## 📁 Project Structure

```text
laundry-management-system/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

*The directory names above illustrate the intended structure; adjust them if your actual project differs.*

## ⚙️ Local Development Setup

### Prerequisites

Install the following:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/N8758/AWS-DEVPOYMENT.git
```

```bash
cd laundry-management-system
```

Replace the repository URL with your actual GitHub repository URL if its name differs.

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4. Configure Environment Variables

Create the required `.env` files in the client and server directories.

Example configuration placeholders:

```env
# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# Application configuration
PORT=5000
JWT_SECRET=your_secret_value

# Add other required integration variables
# according to your backend configuration
```

Do not use these variable names blindly. Match them to the actual environment variable names used by your application.

Never commit real credentials, API keys, Firebase service-account JSON files or production secrets.

### 5. Start the Backend

```bash
cd server
npm start
```

For development:

```bash
npm run dev
```

### 6. Start the Frontend

Open another terminal:

```bash
cd client
npm start
```

The Create React App development server normally runs at:

```text
http://localhost:3000
```

---

## 🐳 Docker Configuration

The project includes separate Dockerfiles for the frontend and backend.

### Frontend Dockerfile

The frontend uses a multi-stage Docker build:

1. Node.js builds the React application.
2. Nginx serves the production build.

### Backend Dockerfile

The backend Dockerfile:

1. Uses a Node.js base image.
2. Installs production dependencies.
3. Copies the backend source code.
4. Starts the Express application.

### Docker Compose

Docker Compose is used to define and manage multiple application services together.

The intended container architecture is:

```text
          Laundry Application
                  |
             Docker Compose
                  |
          -------------------
          |                 |
       Frontend           Backend
       React              Node.js
       Nginx              Express
          |                 |
          -------------------
                  |
              PostgreSQL
```

The PostgreSQL database currently runs separately from the application containers.

*Docker Compose configuration and database connectivity should be verified before running the complete containerized application.*

---

## ☁️ AWS Deployment Roadmap

The planned AWS deployment architecture:

```text
              GitHub Repository
                     |
                     |
                Docker Build
                     |
                     |
              Amazon ECR
              Image Registry
                     |
                     |
             Amazon ECS / Fargate
                     |
             ------------------
             |                |
          Frontend          Backend
          Container         Container
             |                |
             ------------------
                     |
                Amazon RDS
                 PostgreSQL
                     |
               CloudWatch
              Logs & Monitoring
```

### Planned AWS Services

| AWS Service | Purpose |
|---|---|
| Amazon ECR | Docker image storage |
| Amazon ECS | Container orchestration |
| AWS Fargate | Managed container compute |
| Amazon RDS | Managed PostgreSQL database |
| Application Load Balancer | Application traffic routing |
| Amazon CloudWatch | Logs and monitoring |
| AWS IAM | Access and permissions management |

*These services describe the intended deployment architecture, not a claim that all services are already deployed.*

---

## 🔐 Security Practices

- Keep `.env` files out of Git.
- Never upload Firebase service-account credentials.
- Never commit database passwords or JWT secrets.
- Use `.gitignore` to exclude sensitive files from Git.
- Use `.dockerignore` to exclude sensitive files from Docker build contexts.
- Use AWS IAM with least-privilege permissions.
- Store production credentials securely.
- Use HTTPS for production application traffic.
- Rotate credentials if they are exposed.

---

## 🚀 Future Improvements

- Complete AWS cloud deployment.
- Automate Docker image builds.
- Implement GitHub Actions CI/CD.
- Integrate Amazon ECR and ECS.
- Migrate PostgreSQL to Amazon RDS.
- Add automated image vulnerability scanning.
- Improve application monitoring and logging.
- Strengthen infrastructure security.

---

## 👨‍💻 Author

**Nilesh Pulate**

Full Stack Developer | AI/ML Enthusiast | Cloud & DevOps Learner

- Portfolio: https://portfolio-nileshpulate.netlify.app/
- GitHub: https://github.com/N8758
- Live Project: https://neocleanhubs.com/

---

## 📄 License

This project is currently maintained by its author. No open-source license has been specified yet.

---

⭐ If you find this project interesting, feel free to explore the repository and follow its development.