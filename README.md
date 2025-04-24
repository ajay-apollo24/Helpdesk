# Helpdesk Platform

A modern web-based helpdesk platform with AI-powered features for efficient ticket management and customer support.

## Features

- **Ticket Management**
  - Ticket submission with attachments
  - Ticket list and detail views
  - Ticket status tracking
  - Comment system
  - File attachments support

- **AI-Powered Features**
  - Automatic ticket categorization
  - Priority level suggestions
  - Smart ticket routing

- **Agent Management**
  - Agent shift management
  - Department-based assignment
  - Performance tracking

- **Security**
  - JWT-based authentication
  - Role-based access control
  - Secure file uploads

## Tech Stack

- **Backend**
  - Node.js
  - Express.js
  - MongoDB
  - OpenAI API
  - JWT Authentication

- **Frontend** (Coming Soon)
  - React
  - Material-UI
  - Redux

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/helpdesk-platform.git
   cd helpdesk-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/helpdesk
   JWT_SECRET=your_jwt_secret_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Tickets
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get a single ticket
- `PATCH /api/tickets/:id/status` - Update ticket status
- `POST /api/tickets/:id/comments` - Add comment to ticket
- `PATCH /api/tickets/:id/assign` - Assign ticket to agent

### Users
- `GET /api/users/agents` - Get all agents
- `PATCH /api/users/:id/shift` - Update agent shift

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 