@echo off
REM Digital Psychological Intervention System - Setup Script for Windows
REM This script helps you set up the database seeding and Cloudinary integration

echo 🚀 Setting up Digital Psychological Intervention System...

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ Please run this script from the backend directory
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
npm install

echo 🔧 Setting up environment variables...

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    (
        echo # Database
        echo MONGODB_URI=mongodb://localhost:27017/mental-health-app
        echo.
        echo # JWT
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        echo.
        echo # Server
        echo PORT=5000
        echo.
        echo # Cloudinary ^(Get these from https://cloudinary.com^)
        echo CLOUDINARY_CLOUD_NAME=your_cloud_name
        echo CLOUDINARY_API_KEY=your_api_key
        echo CLOUDINARY_API_SECRET=your_api_secret
    ) > .env
    echo ✅ Created .env file
    echo ⚠️  Please update the Cloudinary credentials in .env file
) else (
    echo ✅ .env file already exists
)

echo 🌱 Running database seeding...
npm run seed

echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Update Cloudinary credentials in .env file
echo 2. Start MongoDB if not running
echo 3. Start backend server: npm run dev
echo 4. Start frontend server: cd ../frontend ^&^& npm run dev
echo.
echo 🔑 Test credentials:
echo Student: john.student@university.edu / student123
echo Counsellor: sarah.wilson@university.edu / counsellor123
echo Admin: admin@university.edu / admin123
echo.
echo 📚 Check SEEDING_AND_CLOUDINARY_GUIDE.md for detailed instructions
pause

