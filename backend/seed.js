/**
 * Database Seeding Script
 * Populates the database with initial data for development and testing
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';
import Resource from './models/Resource.js';
import ForumPost from './models/ForumPost.js';
import Booking from './models/Booking.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-health-app';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('Make sure MongoDB is running on your system');
    process.exit(1);
  }
};

// Sample users data
const users = [
  {
    name: 'John Student',
    email: 'john.student@university.edu',
    password: 'student123',
    role: 'student',
    phoneNumber: '+1234567890',
    studentId: 'STU001',
    department: 'Computer Science'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@university.edu',
    password: 'counsellor123',
    role: 'counsellor',
    phoneNumber: '+1234567891',
    specialization: 'Anxiety & Depression',
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '17:00' }
    ]
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@university.edu',
    password: 'counsellor123',
    role: 'counsellor',
    phoneNumber: '+1234567892',
    specialization: 'Academic Stress & Performance',
    availability: [
      { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '18:00' }
    ]
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@university.edu',
    password: 'counsellor123',
    role: 'counsellor',
    phoneNumber: '+1234567893',
    specialization: 'Relationship & Social Issues',
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '16:00' },
      { day: 'Wednesday', startTime: '08:00', endTime: '16:00' },
      { day: 'Friday', startTime: '08:00', endTime: '16:00' }
    ]
  },
  {
    name: 'Admin User',
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin',
    phoneNumber: '+1234567894'
  },
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@university.edu',
    password: 'student123',
    role: 'student',
    phoneNumber: '+1234567895',
    studentId: 'STU002',
    department: 'Psychology'
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@university.edu',
    password: 'student123',
    role: 'student',
    phoneNumber: '+1234567896',
    studentId: 'STU003',
    department: 'Engineering'
  }
];

// Sample resources data
const resources = [
  {
    title: 'Understanding Anxiety: A Comprehensive Guide',
    description: 'Learn about the different types of anxiety disorders, their symptoms, and effective coping strategies. This guide provides practical tools for managing anxiety in daily life.',
    category: 'article',
    tags: ['anxiety', 'coping', 'mental health', 'guide'],
    url: 'https://example.com/anxiety-guide',
    content: 'Anxiety is a normal and often healthy emotion. However, when a person regularly feels disproportionate levels of anxiety, it might become a medical disorder...',
    isPublished: true
  },
  {
    title: 'Mindfulness Meditation for Beginners',
    description: 'A step-by-step video guide to mindfulness meditation. Perfect for students looking to reduce stress and improve focus through meditation practices.',
    category: 'video',
    tags: ['mindfulness', 'meditation', 'stress relief', 'beginner'],
    url: 'https://example.com/mindfulness-video',
    content: 'Mindfulness meditation is a mental training practice that teaches you to slow down racing thoughts, let go of negativity, and calm both your mind and body...',
    isPublished: true
  },
  {
    title: 'Building Healthy Relationships in College',
    description: 'Navigate the complexities of relationships during your college years. Learn about communication, boundaries, and maintaining healthy connections.',
    category: 'guide',
    tags: ['relationships', 'communication', 'college life', 'social skills'],
    url: 'https://example.com/relationships-guide',
    content: 'College is a time of significant personal growth and change. Building healthy relationships during this period is crucial for your emotional well-being...',
    isPublished: true
  },
  {
    title: 'Overcoming Academic Pressure',
    description: 'Strategies for managing academic stress, dealing with perfectionism, and maintaining a healthy work-life balance during your studies.',
    category: 'article',
    tags: ['academic stress', 'perfectionism', 'balance', 'study skills'],
    url: 'https://example.com/academic-pressure',
    content: 'Academic pressure is a common experience among students. It can come from various sources including coursework, exams, and future career concerns...',
    isPublished: true
  },
  {
    title: 'Sleep Hygiene for Better Mental Health',
    description: 'Discover the connection between sleep and mental health. Learn practical tips for improving sleep quality and establishing healthy sleep routines.',
    category: 'guide',
    tags: ['sleep', 'wellness', 'mental health', 'habits'],
    url: 'https://example.com/sleep-hygiene',
    content: 'Sleep hygiene refers to healthy sleep habits. Good sleep hygiene is important for both physical and mental health, improving productivity and overall quality of life...',
    isPublished: true
  },
  {
    title: 'Coping with Depression: A Student\'s Guide',
    description: 'Understanding depression symptoms, seeking help, and developing coping strategies specifically tailored for college students.',
    category: 'article',
    tags: ['depression', 'coping', 'student life', 'mental health'],
    url: 'https://example.com/depression-guide',
    content: 'Depression is more than just feeling sad or going through a rough patch. It\'s a serious mental health condition that requires understanding and medical care...',
    isPublished: true
  },
  {
    title: 'Stress Management Techniques',
    description: 'Learn effective stress management techniques including breathing exercises, time management, and relaxation methods.',
    category: 'exercise',
    tags: ['stress management', 'breathing', 'relaxation', 'techniques'],
    url: 'https://example.com/stress-management',
    content: 'Stress is a natural response to challenges and demands. While some stress can be beneficial, chronic stress can have negative effects on your health...',
    isPublished: true
  },
  {
    title: 'Mental Health Podcast Series',
    description: 'A series of podcasts covering various mental health topics, featuring expert interviews and real student experiences.',
    category: 'podcast',
    tags: ['podcast', 'mental health', 'interviews', 'stories'],
    url: 'https://example.com/mental-health-podcast',
    content: 'This podcast series explores mental health topics through conversations with mental health professionals, students, and experts in the field...',
    isPublished: true
  }
];

// Sample forum posts data
const forumPosts = [
  {
    title: 'Dealing with exam anxiety - need advice',
    content: 'Hi everyone, I\'ve been struggling with severe anxiety during exams. My heart races, I can\'t focus, and sometimes I even feel like I might pass out. Has anyone else experienced this? What strategies have worked for you?',
    category: 'anxiety',
    tags: ['exam-stress', 'anxiety', 'coping-strategies'],
    isAnonymous: false,
    isApproved: true,
    isPinned: false
  },
  {
    title: 'Feeling overwhelmed with course load',
    content: 'This semester has been incredibly challenging. I\'m taking 18 credits and working part-time. I feel like I\'m drowning and don\'t know how to manage everything. Any tips for time management and staying sane?',
    category: 'academic',
    tags: ['time-management', 'stress', 'work-life-balance'],
    isAnonymous: false,
    isApproved: true,
    isPinned: false
  },
  {
    title: 'Success story: Overcoming social anxiety',
    content: 'I wanted to share my journey with social anxiety. A year ago, I could barely speak in class or make friends. Through therapy, gradual exposure, and joining clubs, I\'ve made incredible progress. If you\'re struggling, please know it gets better!',
    category: 'general',
    tags: ['success-story', 'social-anxiety', 'therapy', 'progress'],
    isAnonymous: false,
    isApproved: true,
    isPinned: true
  },
  {
    title: 'Relationship troubles affecting my mental health',
    content: 'My long-distance relationship is causing me a lot of stress and affecting my studies. I love my partner but the constant worry and communication issues are taking a toll. How do you balance relationships and mental health?',
    category: 'relationships',
    tags: ['relationships', 'long-distance', 'communication', 'stress'],
    isAnonymous: false,
    isApproved: true,
    isPinned: false
  },
  {
    title: 'Coping with seasonal depression',
    content: 'Winter always hits me hard. The lack of sunlight and cold weather make me feel so low. I\'ve heard about light therapy and vitamin D supplements. What has worked for others dealing with seasonal affective disorder?',
    category: 'depression',
    tags: ['seasonal-depression', 'winter', 'light-therapy', 'SAD'],
    isAnonymous: false,
    isApproved: true,
    isPinned: false
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Resource.deleteMany({});
    await ForumPost.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.name} (${user.role})`);
    }

    // Get counsellors and students for resource and post creation
    const counsellors = createdUsers.filter(user => user.role === 'counsellor');
    const students = createdUsers.filter(user => user.role === 'student');

    // Create resources (uploaded by counsellors)
    for (let i = 0; i < resources.length; i++) {
      const resourceData = resources[i];
      const counsellor = counsellors[i % counsellors.length];
      
      const resource = new Resource({
        ...resourceData,
        uploadedBy: counsellor._id
      });
      
      await resource.save();
      console.log(`📚 Created resource: ${resource.title}`);
    }

    // Create forum posts (created by students)
    for (let i = 0; i < forumPosts.length; i++) {
      const postData = forumPosts[i];
      const student = students[i % students.length];
      
      const post = new ForumPost({
        ...postData,
        author: student._id
      });
      
      await post.save();
      console.log(`💬 Created forum post: ${post.title}`);
    }

    // Create some sample bookings
    const sampleBookings = [
      {
        student: students[0]._id,
        counsellor: counsellors[0]._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        timeSlot: { startTime: '14:00', endTime: '15:00' },
        concern: 'Feeling anxious about upcoming exams',
        sessionType: 'individual',
        status: 'confirmed'
      },
      {
        student: students[1]._id,
        counsellor: counsellors[1]._id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        timeSlot: { startTime: '10:00', endTime: '11:00' },
        concern: 'Academic stress and time management',
        sessionType: 'individual',
        status: 'pending'
      },
      {
        student: students[2]._id,
        counsellor: counsellors[2]._id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        timeSlot: { startTime: '15:00', endTime: '16:00' },
        concern: 'Relationship issues',
        sessionType: 'individual',
        status: 'completed'
      }
    ];

    for (const bookingData of sampleBookings) {
      const booking = new Booking(bookingData);
      await booking.save();
      console.log(`📅 Created booking: ${booking.sessionType} session`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📚 Resources: ${resources.length}`);
    console.log(`💬 Forum Posts: ${forumPosts.length}`);
    console.log(`📅 Bookings: ${sampleBookings.length}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('Student: john.student@university.edu / student123');
    console.log('Counsellor: sarah.wilson@university.edu / counsellor123');
    console.log('Admin: admin@university.edu / admin123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding
const runSeed = async () => {
  console.log('🌱 Starting database seeding...');
  await connectDB();
  await seedDatabase();
};

// Check if this script is run directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed();
}

export default runSeed;
