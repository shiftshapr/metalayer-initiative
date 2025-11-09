const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Use Prisma client from app.js if available, otherwise create new instance
let prisma;
try {
  // Try to use the shared Prisma instance from the main server
  if (global.prismaClient) {
    prisma = global.prismaClient;
  } else {
    const { PrismaClient } = require('../generated/prisma');
    prisma = new PrismaClient();
  }
} catch (error) {
  console.error('Error initializing Prisma client:', error);
  throw error;
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/meta-community-logos/',
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

// Ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = path.join(__dirname, '../uploads/meta-community-logos');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

ensureUploadDir();

/**
 * POST /v1/meta-communities/waitlist
 * Create a meta-community waitlist submission
 */
router.post('/waitlist', upload.single('logo'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      purpose,
      codeOfConduct,
      communityLink,
      onboardingInstructions
    } = req.body;

    // Validate required fields
    if (!name || !email || !purpose || !codeOfConduct || !onboardingInstructions) {
      return res.status(400).json({
        error: 'Missing required fields. Name, email, purpose, code of conduct, and onboarding instructions are required.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email address format'
      });
    }

    // Handle logo file upload
    let logoUrl = null;
    if (req.file) {
      // In production, you'd upload this to S3, Cloudinary, or similar
      // For now, we'll store the path and you can handle the actual upload separately
      logoUrl = `/uploads/meta-community-logos/${req.file.filename}`;
      
      // TODO: Upload to cloud storage and update logoUrl with the CDN URL
      console.log('Logo uploaded:', req.file);
    }

    // ROOT CAUSE FIX: Save to database using Prisma
    const waitlistEntry = await prisma.metaCommunityWaitlist.create({
      data: {
        name,
        email,
        phone: phone || null,
        purpose,
        codeOfConduct,
        logoUrl,
        communityLink: communityLink || null,
        onboardingInstructions,
        status: 'pending'
      }
    });

    console.log('✅ Meta-community waitlist submission saved to database:', waitlistEntry.id);

    res.json({
      success: true,
      message: 'Meta-community application submitted successfully',
      submissionId: waitlistEntry.id
    });

  } catch (error) {
    console.error('Error processing meta-community submission:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({
      error: error.message || 'An error occurred processing your submission'
    });
  }
});

/**
 * GET /v1/meta-communities/waitlist
 * Get waitlist submissions (admin only - add authentication in production)
 */
router.get('/waitlist', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    
    // ROOT CAUSE FIX: Fetch from database using Prisma
    const submissions = await prisma.metaCommunityWaitlist.findMany({
      orderBy: {
        submittedAt: 'desc'
      }
    });
    
    res.json({
      submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error('Error fetching waitlist submissions:', error);
    res.status(500).json({
      error: 'An error occurred fetching submissions'
    });
  }
});

module.exports = router;

