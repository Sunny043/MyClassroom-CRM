# MyClassroom CRM - Deployment Guide

## 🚀 Deploying to Render

### Prerequisites
1. GitHub repository with your code
2. MongoDB Atlas database (already configured)
3. Render account (free tier available)

### Step-by-Step Deployment

#### 1. Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### 2. Deploy on Render

**Option A: Using render.yaml (Recommended)**
1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Set the following environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (Render can auto-generate this)
   - `NODE_ENV`: `production`

**Option B: Manual Setup**
1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `my-classroom-crm`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

#### 3. Environment Variables
Set these in Render Dashboard → Service → Environment:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://bojjasunny21:joker2005@reactdb.q1f7tls.mongodb.net/myClassroomCRM?retryWrites=true&w=majority&appName=reactdb
JWT_SECRET=your-super-secure-secret-key
PORT=10000
```

#### 4. Domain Configuration
- Render will provide a free domain: `https://your-app-name.onrender.com`
- You can also configure a custom domain in the Render dashboard

### 🔧 Local Development
```bash
# Install dependencies
npm install

# Run in development mode (client + server)
npm run dev

# Run client only
npm run client

# Run server only
npm run server

# Build for production
npm run build

# Start production server
npm start
```

### 📋 Environment Variables Needed

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |

### 🔐 Default Login Credentials

**Administrator:**
- Username: `admin`
- Password: `admin123`

**Coordinators:**
- Username: `csc_coord`, Password: `csc123456`
- Username: `ds_coord`, Password: `ds123456`
- Username: `ai_coord`, Password: `ai123456`
- And more...

### 📁 Project Structure
```
MyClassroom-CRM/
├── backend/                 # Backend API files
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── database/           # DB connection
│   └── scripts/            # Utility scripts
├── src/                    # React frontend
│   ├── components/         # React components
│   └── config/             # Configuration files
├── public/                 # Static assets
├── server.js               # Main server file (production)
├── package.json            # Dependencies and scripts
├── render.yaml             # Render deployment config
└── Procfile               # Heroku deployment config
```

### 🌐 Features
- Student Management (CRUD operations)
- Branch Management
- Role-based Authentication (Admin/Coordinator)
- Export to Excel/PDF
- Modern React UI with Bootstrap
- MongoDB Atlas database
- JWT authentication

### 🔧 Troubleshooting

**Build Fails:**
- Check that all dependencies are in `package.json`
- Ensure MongoDB connection string is correct
- Verify environment variables are set

**App Doesn't Load:**
- Check Render logs for errors
- Verify `NODE_ENV=production` is set
- Ensure port configuration is correct

**Database Connection Issues:**
- Verify MongoDB Atlas allows connections from 0.0.0.0/0
- Check connection string format
- Ensure database user has proper permissions

### 📞 Support
For deployment issues, check:
1. Render service logs
2. MongoDB Atlas connection
3. Environment variables configuration
4. GitHub repository sync status
