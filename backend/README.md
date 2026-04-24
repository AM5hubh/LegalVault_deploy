
#!/bin/bash

# Script to create MongoDB model files for Secure Blockchain-Based Digital Evidence Management System
# Generates Mongoose schemas for User, EvidenceMetadata, and ChainOfCustody

# Exit on any error
set -e

# Define the models directory
MODELS_DIR="backend/models"

# Function to check if backend directory exists
check_backend_dir() {
    if [ ! -d "backend" ]; then
        echo "Error: 'backend' directory not found. Please run the backend structure script first."
        exit 1
    fi
}

# Function to create directory with error handling
create_dir() {
    local dir="$1"
    if ! mkdir -p "$dir" 2>/dev/null; then
        echo "Error: Failed to create directory $dir"
        exit 1
    fi
    echo "Created/Verified directory: $dir"
}

# Function to create file with error handling
create_file() {
    local file="$1"
    if ! touch "$file" 2>/dev/null; then
        echo "Error: Failed to create file $file"
        exit 1
    fi
    echo "Created file: $file"
}

# Function to write content to file with error handling
write_file() {
    local file="$1"
    local content="$2"
    if ! echo "$content" > "$file" 2>/dev/null; then
        echo "Error: Failed to write to $file"
        exit 1
    fi
    echo "Populated file: $file"
}

# Check if backend directory exists
check_backend_dir

# Create models directory
create_dir "$MODELS_DIR"

# Create model files
create_file "$MODELS_DIR/User.js"
create_file "$MODELS_DIR/EvidenceMetadata.js"
create_file "$MODELS_DIR/ChainOfCustody.js"

# Populate User.js
write_file "$MODELS_DIR/User.js" \
"const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  fullName: {
    type: String,
    required: false, // Populated after KYC verification
  },
  dob: {
    type: Date,
    required: false, // Populated after KYC
  },
  gender: {
    type: String,
    enum: ['M', 'F', 'O'],
    required: false, // Populated after KYC
  },
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pinCode: String,
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
  },
  aadhaarHash: {
    type: String, // Hashed Aadhaar number (SHA-256)
    required: false,
  },
  panNumber: {
    type: String, // Encrypted if stored
    required: false,
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'expired'],
    default: 'pending',
  },
  kycVerifiedAt: {
    type: Date,
  },
  kycExpiry: {
    type: Date,
  },
  resetPasswordToken: {
    type: String, // Hashed token for password reset
  },
  resetPasswordExpires: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['officer', 'forensic', 'legal', 'admin'],
    required: true,
  },
  agency: {
    type: String, // e.g., police department
  },
  profilePhotoPublicId: {
    type: String, // Cloudinary public_id for profile photo
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  this.updatedAt = Date.now();
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
"

# Populate EvidenceMetadata.js
write_file "$MODELS_DIR/EvidenceMetadata.js" \
"const mongoose = require('mongoose');

const evidenceMetadataSchema = new mongoose.Schema({
  evidenceId: {
    type: String, // Blockchain-generated ID
    required: true,
    unique: true,
  },
  hash: {
    type: String, // SHA-256 hash of file
    required: true,
  },
  cloudinaryPublicId: {
    type: String, // Cloudinary public_id
    required: true,
  },
  cloudinaryUrl: {
    type: String, // Cloudinary secure_url
    required: true,
  },
  enhancedPublicId: {
    type: String, // Cloudinary public_id for enhanced version
  },
  enhancedUrl: {
    type: String, // Cloudinary secure_url for enhanced version
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileType: {
    type: String, // e.g., image/jpeg, video/mp4
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  size: {
    type: Number, // File size in bytes
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'archived'],
    default: 'pending',
  },
  caseId: {
    type: String, // Optional case identifier
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Object, // e.g., GPS, EXIF, uploader details
  },
});

evidenceMetadataSchema.index({ evidenceId: 1 });
evidenceMetadataSchema.index({ uploaderId: 1 });
evidenceMetadataSchema.index({ status: 1 });

module.exports = mongoose.model('EvidenceMetadata', evidenceMetadataSchema);
"

# Populate ChainOfCustody.js
write_file "$MODELS_DIR/ChainOfCustody.js" \
"const mongoose = require('mongoose');

const chainOfCustodySchema = new mongoose.Schema({
  evidenceId: {
    type: String, // Blockchain-generated ID
    required: true,
  },
  actionId: {
    type: String, // Blockchain transaction hash
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['upload', 'view', 'enhance', 'kyc_verify', 'password_reset', 'delete'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: Object, // e.g., { kycResponse: 'verified' }
  },
});

chainOfCustodySchema.index({ evidenceId: 1 });
chainOfCustodySchema.index({ userId: 1 });
chainOfCustodySchema.index({ action: 1 });

module.exports = mongoose.model('ChainOfCustody', chainOfCustodySchema);
"

# Set executable permissions for the script
if ! chmod +x "$0" 2>/dev/null; then
    echo "Error: Failed to set executable permissions for $0"
    exit 1
fi

# Verify created files
echo "Verifying model files..."
find "$MODELS_DIR" -type f | sort

echo "MongoDB model files created successfully in $MODELS_DIR"
echo "Next steps:"
echo "1. Ensure MongoDB is running and MONGO_URI is set in .env"
echo "2. Verify Mongoose schemas in $MODELS_DIR"
echo "3. Integrate with controllers and routes"
