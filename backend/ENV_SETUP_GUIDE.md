# Environment Configuration Guide

## Backend .env File Setup

Create a file named `.env` in the `backend` directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mental-health-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000

# Cloudinary Configuration
# Get these credentials from https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## How to Get Cloudinary Credentials:

1. **Sign up for Cloudinary**:
   - Go to [https://cloudinary.com](https://cloudinary.com)
   - Click "Sign Up For Free"
   - Create your account

2. **Get Your Credentials**:
   - After signing up, you'll be redirected to your dashboard
   - Look for the "Dashboard" section
   - You'll see your credentials:
     - **Cloud Name**: Usually something like `dxxxxxxx`
     - **API Key**: A number like `123456789012345`
     - **API Secret**: A long string like `abcdefghijklmnopqrstuvwxyz123456789`

3. **Update Your .env File**:
   - Replace `your_cloud_name_here` with your actual Cloud Name
   - Replace `your_api_key_here` with your actual API Key
   - Replace `your_api_secret_here` with your actual API Secret

## Example of Completed .env File:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mental-health-app

# JWT Configuration
JWT_SECRET=my-super-secret-jwt-key-for-development-only

# Server Configuration
PORT=5000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dmycloudname
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456789
```

## Important Notes:

- **Never commit .env files to version control**
- **Keep your API Secret secure**
- **Use different credentials for production**
- **The .env file should be in the backend directory**

## Steps to Create the File:

1. Navigate to the `backend` directory
2. Create a new file named `.env` (with the dot at the beginning)
3. Copy the template content above
4. Replace the placeholder values with your actual Cloudinary credentials
5. Save the file

## Testing Your Configuration:

After setting up your .env file, you can test it by:

1. Installing dependencies: `npm install`
2. Running the seeding script: `npm run seed`
3. Starting the server: `npm run dev`

If everything is configured correctly, you should see no Cloudinary-related errors in the console.

