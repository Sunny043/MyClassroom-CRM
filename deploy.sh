#!/bin/bash

echo "🚀 MyClassroom CRM Deployment Script"
echo "======================================"

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📁 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Deploy to production"
fi
git commit -m "$commit_msg"

# Check if remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository URL:"
    read -p "GitHub Repository URL: " repo_url
    git remote add origin "$repo_url"
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "🌐 Next Steps for Render Deployment:"
echo "1. Go to https://render.com and sign in"
echo "2. Click 'New' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Render will detect render.yaml and auto-configure"
echo "5. Set environment variables:"
echo "   - MONGODB_URI: Your MongoDB connection string"
echo "   - JWT_SECRET: A secure random string"
echo "   - NODE_ENV: production"
echo ""
echo "📋 Your MongoDB URI is:"
echo "mongodb+srv://bojjasunny21:joker2005@reactdb.q1f7tls.mongodb.net/myClassroomCRM?retryWrites=true&w=majority&appName=reactdb"
echo ""
echo "🔐 Default Admin Login:"
echo "Username: admin"
echo "Password: admin123"
