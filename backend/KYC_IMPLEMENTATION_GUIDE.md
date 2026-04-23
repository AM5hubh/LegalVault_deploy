# KYC (Know Your Customer) System - Complete Implementation Guide

## Overview

This document covers the complete KYC verification flow using Sandbox.co.in Aadhaar OTP API, including the technical implementation, debugging, and known issues.

## Architecture

### Services & Components

```
Frontend (React)
    ↓
KYC Routes (Express)
    ↓
KYC Controller
    ↓
KYC Service (Sandbox API)
    ↓
User Model (MongoDB)
```

### Data Flow

1. **Generate OTP**: User provides Aadhaar number → Sandbox API generates OTP
2. **Verify OTP**: User enters OTP → Sandbox API validates and returns KYC data
3. **Save to MongoDB**: Controller saves all KYC data to user document
4. **Activity Logging**: Entry added to user's activity log
5. **Email Notification**: User receives verification confirmation

## Configuration

### Environment Variables

```bash
# .env (backend)
SANDBOX_API_KEY=key_live_551b5a379850404f925980feaac92ef7
SANDBOX_API_SECRET=secret_live_9a325475511041af8e0784f791fcc86e
SANDBOX_ACCESS_TOKEN=<JWT_TOKEN>
SANDBOX_BASE_URL=https://prod1-api.sandbox.co.in

# Database
MONGO_URI=mongodb+srv://legalvaultadmin:need25researchpaper@legalvault.pe4rrvq.mongodb.net/
```

### Sandbox API Details

**Endpoints:**
- Generate OTP: `POST /kyc/aadhaar/okyc/otp`
- Verify OTP: `POST /kyc/aadhaar/okyc/otp/verify`

**Authentication Headers:**
```json
{
  "api-key": "${SANDBOX_API_KEY}",
  "Authorization": "Bearer ${SANDBOX_ACCESS_TOKEN}"
}
```

## Database Schema

### User.kycData Object

```javascript
{
  careOf: String,           // Father/Guardian name
  emailHash: String,        // Hashed email from Aadhaar
  mobileHash: String,       // Hashed mobile from Aadhaar
  photo: String,            // Base64 encoded photo
  shareCode: String,        // Aadhaar share code
  yearOfBirth: Number,      // Year of birth
  status: String,           // KYC status (e.g., "VALID")
  message: String           // Response message
}
```

### User.address Object

```javascript
{
  line1: String,                    // House/Building number
  line2: String,                    // Street/Road name
  city: String,                     // District
  state: String,                    // State
  pinCode: String,                  // Postal code
  country: String,                  // Country (default: "India")
  fullAddress: String               // Complete address string
}
```

### KYC Status Fields

- `kycStatus`: enum ["verified", "pending", "rejected", "expired"]
- `kycVerifiedAt`: Date when KYC was verified
- `kycExpiry`: Date when KYC expires (default: 1 year)
- `aadhaarHash`: SHA-256 hash of Aadhaar number (never store plain Aadhaar)

## Known Issues & Solutions

### Issue 1: KYC Data Not Persisting to MongoDB

**Symptoms:**
```json
{
  "email": "user@example.com",
  "kycStatus": "verified",  ✓ Saves
  "address": {"country": "India"},  ⚠️ Only default country
  // ❌ Missing: kycData, aadhaarHash, kycVerifiedAt, address (full)
}
```

**Root Causes:**
1. Mongoose nested object change detection issue
2. Field validation errors (silent failures)
3. Transaction/session not properly committed

**Solutions:**

#### Solution A: Use `markModified()` (Current Implementation)

```javascript
// In kycController.js
user.address = { line1, city, state, pinCode, country, fullAddress };
user.markModified('address');

user.kycData = { careOf, emailHash, mobileHash, photo, shareCode, yearOfBirth, status, message };
user.markModified('kycData');

user.aadhaarHash = aadhaarHash;
user.kycVerifiedAt = new Date();
user.kycExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

await user.save();
```

#### Solution B: Use MongoDB `$set` Operator (Alternative)

See: `backend/utils/kycAlternativeUpdate.js`

```javascript
const { updateUserKycDataViaMongoDB } = require('./kycAlternativeUpdate');

await updateUserKycDataViaMongoDB(userId, {
  kycStatus: 'verified',
  address: { line1, city, state, pinCode, country, fullAddress },
  kycData: { careOf, emailHash, mobileHash, photo, shareCode, yearOfBirth, status, message },
  aadhaarHash,
  fullName,
  dob,
  gender
});
```

This approach uses dot notation and guarantees MongoDB-level persistence.

### Issue 2: OTP Verification "Invalid Request Body"

**Solution:** Convert referenceId to string before sending

```javascript
// In kycService.js
const payload = {
  otp: String(otp),  // Ensure string
  transaction_id: String(transactionId)  // Ensure string
};
```

### Issue 3: React "Objects are not valid as React child"

**Solution:** Format address before rendering

```javascript
// In Profile.jsx
function formatAddress(address) {
  if (!address) return 'Not provided';
  if (typeof address === 'string') return address;
  
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pinCode,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ') || 'Not provided';
}

// Usage
<p>{formatAddress(user.address)}</p>
```

## Debugging & Testing

### Test Scripts

Run the following test suites:

#### 1. Schema Validation Test
```bash
node backend/utils/kycTestFlows.js
```

Tests:
- Can all KYC fields be saved?
- Do nested objects persist?
- Can we retrieve saved data?

#### 2. Verification & Repair
```bash
node -e "
  const { verifyAndRepairKycData } = require('./backend/utils/kycAlternativeUpdate');
  const userId = 'YOUR_USER_ID';
  verifyAndRepairKycData(userId).then(console.log);
"
```

#### 3. MongoDB Diagnostic Queries

See: `backend/utils/kycQueryUtils.js`

Key queries:
```javascript
// Check for missing KYC fields
db.users.find({
  kycStatus: 'verified',
  $or: [
    { 'kycData.careOf': { $exists: false } },
    { aadhaarHash: { $exists: false } }
  ]
})

// Count verified users
db.users.countDocuments({ kycStatus: 'verified' })

// Find complete KYC data
db.users.find({
  kycStatus: 'verified',
  'kycData.careOf': { $exists: true },
  aadhaarHash: { $exists: true }
})
```

### Step-by-Step Testing

1. **Verify API Credentials**
   ```bash
   curl -X POST https://prod1-api.sandbox.co.in/kyc/aadhaar/okyc/otp \
     -H "api-key: YOUR_API_KEY" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"aadhaar_number": "123456789012"}'
   ```

2. **Test Backend OTP Generation**
   ```bash
   curl -X POST http://localhost:5000/api/kyc/generate-otp \
     -H "Content-Type: application/json" \
     -d '{"aadhaarNumber": "123456789012"}'
   ```

3. **Test OTP Verification**
   ```bash
   curl -X POST http://localhost:5000/api/kyc/verify-otp \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"referenceId": "123456", "otp": "421337"}'
   ```

4. **Verify MongoDB Data**
   ```javascript
   // In MongoDB Compass or mongosh
   db.users.findOne({ email: "user@example.com" })
   ```

## Logging & Debugging

### Enable Verbose Logging

In `kycController.js`, look for these log statements:

```javascript
logger.info('KYC OTP verification request received', { body: req.body });
logger.info('Received KYC data', { status: kyc.status, name: kyc.name });
logger.info('Saving KYC data to user', { userId, kycStatus, hasKycData });
logger.error('KYC OTP verification failed', { error, stack: error.stack });
```

### Monitor Logs

```bash
# Real-time logs
tail -f backend/logs/combined.log | grep "kyc\|KYC"

# Find errors
grep -i "kyc.*error\|verification.*fail" backend/logs/combined.log
```

## Common Debugging Scenarios

### Scenario 1: "OTP sent successfully" but data not saving

**Check:**
1. Verify `markModified()` calls are present in controller
2. Check MongoDB connection string in `.env`
3. Verify user document exists before update
4. Check if validation errors are silently failing

**Fix:**
```bash
# Run schema validation test
node backend/utils/kycTestFlows.js

# Try alternative update method
node -e "
  const { updateUserKycDataViaMongoDB } = require('./backend/utils/kycAlternativeUpdate');
  // Use this instead of user.save()
"
```

### Scenario 2: Only partial data saved

**Example:** `address` has only `{country: "India"}`

**Cause:** Mongoose not detecting nested object changes

**Fix:** Already added `user.markModified('address')` in controller

### Scenario 3: Database shows empty kycData object

**Example:** `"kycData": {}` instead of full object

**Cause:** Empty object initialization without data assignment

**Check:**
```javascript
// Ensure kycData has all 8 fields
console.log(user.kycData);
// Should have: careOf, emailHash, mobileHash, photo, shareCode, yearOfBirth, status, message

// Use bulk repair
const { bulkRepairKycData } = require('./backend/utils/kycAlternativeUpdate');
await bulkRepairKycData();
```

## API Endpoints

### POST /api/kyc/generate-otp

**Request:**
```json
{
  "aadhaarNumber": "123456789012",
  "consent": "Y",
  "reason": "kyc_verification"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "transactionId": "abc123",
  "referenceId": 123456,
  "expiresIn": 600
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid Aadhaar format"
}
```

### POST /api/kyc/verify-otp

**Request:**
```json
{
  "referenceId": "123456",
  "otp": "421337"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "KYC verified successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "kycStatus": "verified",
    "kycVerifiedAt": "2024-01-15T10:30:00Z",
    "address": { /* full address */ },
    "kycData": { /* all KYC fields */ }
  }
}
```

## Performance Considerations

### Rate Limiting
- OTP generation: 3 attempts per hour per Aadhaar
- OTP verification: 3 attempts per OTP (10 minute expiry)
- KYC re-verification: Once per user (unless forceRenew)

### Database Optimization
- Index `kycStatus` and `kycVerifiedAt` for faster queries
- Archive old activity logs (retention: 90 days)
- Store photo as reference link, not Base64 (size limits)

## Security Best Practices

1. **Never Log Sensitive Data**
   - ✓ Log: `aadhaarLastFour: "1234"`
   - ✗ Log: `aadhaarNumber: "123456789012"`

2. **Hash Aadhaar Numbers**
   ```javascript
   const aadhaarHash = crypto.createHash('sha256')
     .update(aadhaarNumber)
     .digest('hex');
   user.aadhaarHash = aadhaarHash;
   ```

3. **Encrypt Sensitive Fields**
   - Consider encrypting `photo`, `emailHash`, `mobileHash` at rest

4. **Access Control**
   - Only verified admins can view KYC data
   - Users can only see their own KYC data

5. **Audit Trail**
   - All KYC updates logged to `activityLog`
   - Track who accessed KYC data and when

## Troubleshooting Checklist

- [ ] Backend `.env` has all Sandbox credentials
- [ ] Frontend `.env` has correct API URL (`VITE_API_URL=http://localhost:5000/api`)
- [ ] MongoDB connection verified
- [ ] Service Worker `/public/sw.js` exists
- [ ] Schema validation test passes (`kycTestFlows.js`)
- [ ] Can generate OTP (check Sandbox API response)
- [ ] Can verify OTP (check response includes all KYC fields)
- [ ] User document shows all KYC data (check MongoDB)
- [ ] Frontend displays KYC data correctly (check `formatAddress()`)
- [ ] Activity log includes KYC updates

## File Reference

| File | Purpose |
|------|---------|
| `backend/controllers/kycController.js` | Main KYC endpoints |
| `backend/services/kycService.js` | Sandbox API integration |
| `backend/models/User.js` | User schema with KYC fields |
| `backend/utils/kycQueryUtils.js` | MongoDB diagnostic queries |
| `backend/utils/kycVerificationScript.js` | Verification & repair utilities |
| `backend/utils/kycTestFlows.js` | Automated test suite |
| `backend/utils/kycAlternativeUpdate.js` | Alternative update methods |
| `frontend/src/pages/Profile.jsx` | KYC display component |
| `frontend/public/sw.js` | Service Worker |

## Support & Escalation

For persistent issues:

1. Run all diagnostic tests: `node backend/utils/kycTestFlows.js`
2. Check logs: `tail -f backend/logs/combined.log | grep KYC`
3. Export user data: See `kycVerificationScript.js`
4. Try alternative update: Use `updateUserKycDataViaMongoDB()` from `kycAlternativeUpdate.js`
5. Contact Sandbox support with API logs if OAuth fails
