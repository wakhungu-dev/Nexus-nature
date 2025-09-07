# Nexus Nature 🌿

A web application designed to help developers and digital professionals reconnect with nature, track their outdoor time, and improve their wellbeing through data-driven insights and community challenges.

### Project structure
<img src='public/deepseek_mermaid_20250907_7a4020.png' >

### Database Connection Collection
```typescript
{
    email: string,
    name: string,
    stravaId: string,
    preferences: {
        weeklyGoal: number,
        notifications: boolean
    }
}
```

### GreenSession Collection
```typescript
{
    userId: ObjectId,
    startTime: Date,
    endTime: Date,
    duration: number,
    location: GeoJSON,
    source: string,
    activityId: string
}
```

### Challenge Collection
```typescript
{
    title: string,
    description: string,
    difficulty: string,
    category: string,
    locationBased: boolean,
    coordinates: number[]
}
```
## 🌟 Features

- **Green Time Tracker**: Automatically log time spent in nature using Strava integration or manual entries
- **Wellness Analytics**: Receive weekly reports with personalized insights and trends
- **Gamified Challenges**: Complete nature-based challenges to build healthy habits
- **Social Connection**: Wave to nearby users and share experiences
- **Interactive Map**: Discover parks and natural spaces using Google Maps integration
- **Mobile-First Design**: Responsive web experience that works seamlessly on all devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Next-Auth.js
- **Maps**: Google Maps Platform APIs
- **Health Data**: Strava API integration
- **Deployment**: Vercel (Frontend), MongoDB Atlas (Database)

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB instance
- Google Cloud Platform account with Maps JavaScript API enabled
- Strava Developer account with an registered application

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nexus-nature.git
cd nexus-nature
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Strava Integration
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback
```

### 4. Database Setup

The application will automatically create collections and indexes when you run it for the first time.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
nexus-nature/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── map/               # Interactive map
│   └── challenges/        # Challenges interface
├── components/            # Reusable React components
├── lib/                   # Utility libraries
│   ├── mongodb.js         # Database connection
│   └── auth.js            # Authentication helpers
├── models/                # MongoDB Mongoose models
├── public/                # Static assets
└── styles/                # Global styles
```

## 🗄 Database Schema

### User Collection
```javascript
{
  email: String,
  name: String,
  stravaId: String,
  preferences: {
    weeklyGoal: Number,
    notifications: Boolean
  }
}
```

### GreenSession Collection
```javascript
{
  userId: ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number,
  location: GeoJSON,
  source: String,
  activityId: String
}
```

### Challenge Collection
```javascript
{
  title: String,
  description: String,
  difficulty: String,
  category: String,
  locationBased: Boolean,
  coordinates: [Number]
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/strava` - Connect Strava account
- `GET /api/auth/session` - Get current session

### Sessions
- `GET /api/sessions` - Get user's Green Time sessions
- `POST /api/sessions` - Create a manual session
- `DELETE /api/sessions/:id` - Delete a session

### Challenges
- `GET /api/challenges` - Get available challenges
- `POST /api/challenges/:id/complete` - Mark challenge as complete
- `GET /api/challenges/completed` - Get user's completed challenges

### Reports
- `GET /api/reports/weekly` - Generate weekly wellness report
- `GET /api/reports/:week` - Get report for specific week

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 🚢 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Manual Deployment

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 👥 Team Roles

- **Frontend Lead**: UI/UX development, component library, responsive design
- **Backend Lead**: Database design, API development, authentication
- **Full-Stack Developer**: Feature integration, testing, deployment

## 📈 Future Roadmap

- [ ] Progressive Web App (PWA) capabilities
- [ ] Native mobile app using React Native
- [ ] Advanced health data integration (Apple Health/Google Fit direct access)
- [ ] Community features and group challenges
- [ ] AI-powered personalized challenge recommendations
- [ ] Integration with more fitness platforms (Garmin, Fitbit)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 Support

If you have any questions or issues, please create an issue in the GitHub repository or contact our team at support@nexusnature.app.

## 🙏 Acknowledgments

- Strava for their comprehensive API
- Google Maps for geolocation services
- The open-source community for various libraries and tools

---

