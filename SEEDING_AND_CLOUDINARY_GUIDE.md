# Database Seeding & Cloudinary Setup Guide

## Overview
This guide covers setting up database seeding with initial data and integrating Cloudinary for file uploads in your Digital Psychological Intervention System.

## 1. Database Seeding

### What is Database Seeding?
Database seeding is the process of populating your database with initial data for development, testing, or production purposes.

### Files Created:
- `backend/seed.js` - Main seeding script
- Updated `backend/package.json` - Added seed script

### How to Run Seeding:

1. **Install dependencies** (if not already done):
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables** in `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mental-health-app
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

3. **Run the seeding script**:
   ```bash
   npm run seed
   ```

### What Gets Seeded:

#### Users (7 total):
- **3 Students**: John Student, Alice Johnson, Bob Smith
- **3 Counsellors**: Sarah Wilson, Michael Chen, Emily Rodriguez
- **1 Admin**: Admin User

#### Resources (8 total):
- Understanding Anxiety Guide
- Mindfulness Meditation Video
- Building Healthy Relationships Guide
- Overcoming Academic Pressure Article
- Sleep Hygiene Guide
- Coping with Depression Article
- Stress Management Techniques
- Mental Health Podcast Series

#### Forum Posts (5 total):
- Dealing with exam anxiety
- Feeling overwhelmed with course load
- Success story: Overcoming social anxiety (pinned)
- Relationship troubles affecting mental health
- Coping with seasonal depression

#### Sample Bookings (3 total):
- Confirmed session (2 days from now)
- Pending session (3 days from now)
- Completed session (1 day ago)

### Test Credentials:
- **Student**: `john.student@university.edu` / `student123`
- **Counsellor**: `sarah.wilson@university.edu` / `counsellor123`
- **Admin**: `admin@university.edu` / `admin123`

## 2. Cloudinary Integration

### What is Cloudinary?
Cloudinary is a cloud-based image and video management service that provides APIs for uploading, storing, transforming, and delivering media files.

### Files Created/Updated:
- `backend/config/cloudinary.js` - Cloudinary configuration
- `backend/models/Resource.js` - Updated with file upload fields
- `backend/controllers/resourceController.js` - Updated to handle file uploads
- `backend/routes/resources.js` - Updated with file upload middleware
- `backend/package.json` - Added Cloudinary dependencies

### Setup Steps:

#### 1. Create Cloudinary Account:
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

#### 2. Get Your Cloudinary Credentials:
1. Log into your Cloudinary dashboard
2. Go to the "Dashboard" section
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

#### 3. Add Environment Variables:
Add these to your `backend/.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 4. Install Dependencies:
```bash
cd backend
npm install cloudinary multer multer-storage-cloudinary
```

### File Upload Features:

#### Supported File Types:
- **Images**: JPG, JPEG, PNG, GIF
- **Videos**: MP4, AVI, MOV
- **Audio**: MP3, WAV
- **Documents**: PDF, DOC, DOCX

#### File Size Limit:
- Maximum file size: 50MB

#### Automatic Optimizations:
- Images are automatically resized to max 1000x1000 pixels
- Quality is automatically optimized
- Files are stored in the `mental-health-resources` folder

### API Usage:

#### Upload a Resource with File:
```javascript
// Frontend example
const formData = new FormData();
formData.append('title', 'My Resource');
formData.append('description', 'Resource description');
formData.append('category', 'article');
formData.append('tags', 'tag1,tag2,tag3');
formData.append('file', fileInput.files[0]); // File from input

const response = await fetch('/api/resources', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

#### Upload a Resource without File:
```javascript
// Frontend example
const resourceData = {
  title: 'My Resource',
  description: 'Resource description',
  category: 'article',
  tags: 'tag1,tag2,tag3',
  url: 'https://example.com/resource',
  content: 'Resource content...'
};

const response = await fetch('/api/resources', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(resourceData)
});
```

### Resource Model Fields:

#### New File Upload Fields:
- `fileUrl`: Cloudinary URL of the uploaded file
- `fileType`: Type of file (image, video, audio, document, pdf)
- `fileSize`: Size of file in bytes
- `fileName`: Original filename
- `cloudinaryId`: Cloudinary public ID for file management

#### Existing Fields:
- `title`: Resource title
- `description`: Resource description
- `category`: Resource category (article, video, podcast, exercise, guide, other)
- `tags`: Array of tags
- `url`: External URL (if no file uploaded)
- `content`: Text content
- `uploadedBy`: User who uploaded the resource
- `isPublished`: Whether resource is published
- `views`: Number of views
- `likes`: Array of user IDs who liked the resource

## 3. Frontend Integration

### File Upload Component Example:
```jsx
import React, { useState } from 'react';

const ResourceUpload = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'article',
    tags: ''
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('category', formData.category);
    uploadData.append('tags', formData.tags);
    
    if (file) {
      uploadData.append('file', file);
    }

    try {
      const response = await api.post('/resources', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Resource uploaded:', response.data);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        required
      />
      
      <select
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      >
        <option value="article">Article</option>
        <option value="video">Video</option>
        <option value="podcast">Podcast</option>
        <option value="exercise">Exercise</option>
        <option value="guide">Guide</option>
        <option value="other">Other</option>
      </select>
      
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={formData.tags}
        onChange={(e) => setFormData({...formData, tags: e.target.value})}
      />
      
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
      />
      
      <button type="submit">Upload Resource</button>
    </form>
  );
};
```

## 4. Testing

### Test File Upload:
1. Start your backend server: `npm run dev`
2. Use the test credentials to login as a counsellor
3. Try uploading different file types
4. Check Cloudinary dashboard to see uploaded files
5. Verify files are accessible via the returned URLs

### Test Seeding:
1. Clear your database: `mongo mental-health-app --eval "db.dropDatabase()"`
2. Run seeding: `npm run seed`
3. Check your database for populated data
4. Test login with seeded credentials

## 5. Troubleshooting

### Common Issues:

#### Seeding Issues:
- **MongoDB Connection Error**: Check your MONGODB_URI in .env
- **Permission Denied**: Ensure MongoDB is running
- **Duplicate Key Error**: Clear database before seeding

#### Cloudinary Issues:
- **Invalid Credentials**: Verify your Cloudinary credentials
- **File Upload Fails**: Check file size and type restrictions
- **CORS Errors**: Ensure proper CORS configuration

#### File Upload Issues:
- **Multer Errors**: Check file size limits and file types
- **Cloudinary Errors**: Verify API credentials and folder permissions

### Debug Tips:
1. Check backend console for error messages
2. Verify environment variables are loaded
3. Test API endpoints with Postman
4. Check Cloudinary dashboard for uploaded files
5. Verify database collections are populated

## 6. Production Considerations

### Security:
- Use environment variables for all credentials
- Implement proper file type validation
- Set appropriate file size limits
- Use HTTPS for file uploads

### Performance:
- Implement image optimization
- Use CDN for file delivery
- Consider file compression
- Implement caching strategies

### Monitoring:
- Monitor Cloudinary usage and costs
- Track file upload success rates
- Monitor database performance
- Set up error logging

## Conclusion

You now have:
- ✅ Database seeding with comprehensive initial data
- ✅ Cloudinary integration for file uploads
- ✅ Support for multiple file types
- ✅ Automatic file optimization
- ✅ Proper error handling and cleanup

Your application is ready for development and testing with real data and file upload capabilities!

