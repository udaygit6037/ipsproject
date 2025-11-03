#!/bin/bash

# Digital Psychological Intervention System - Setup Script
# This script helps you set up the database seeding and Cloudinary integration

echo "🚀 Setting up Digital Psychological Intervention System..."

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment variables..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
MONGODB_URI=mongodb://localhost:27017/mental-health-app

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=5000

# Cloudinary (Get these from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOF
    echo "✅ Created .env file"
    echo "⚠️  Please update the Cloudinary credentials in .env file"
else
    echo "✅ .env file already exists"
fi

echo "🌱 Running database seeding..."
npm run seed

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update Cloudinary credentials in .env file"
echo "2. Start MongoDB if not running: mongod"
echo "3. Start backend server: npm run dev"
echo "4. Start frontend server: cd ../frontend && npm run dev"
echo ""
echo "🔑 Test credentials:"
echo "Student: john.student@university.edu / student123"
echo "Counsellor: sarah.wilson@university.edu / counsellor123"
echo "Admin: admin@university.edu / admin123"
echo ""
echo "📚 Check SEEDING_AND_CLOUDINARY_GUIDE.md for detailed instructions"

