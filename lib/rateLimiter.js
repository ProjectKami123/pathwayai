import { adminDb } from './firebaseAdmin';

/**
 * Rate limiting and membership management utilities
 */

// Membership limits
export const MEMBERSHIP_LIMITS = {
  MAX_FOUNDING_MEMBERS: 100,
  DAILY_ATS_OPTIMIZATIONS: 3,
};

/**
 * Check if user can perform ATS optimization (rate limiting)
 */
export async function checkATSOptimizationLimit(uid) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usageDoc = await adminDb.collection('userUsage').doc(uid).get();
    
    if (!usageDoc.exists) {
      // First time user - create document
      await adminDb.collection('userUsage').doc(uid).set({
        atsOptimizations: {
          count: 0,
          lastReset: today,
          attempts: []
        }
      });
      return { allowed: true, remaining: MEMBERSHIP_LIMITS.DAILY_ATS_OPTIMIZATIONS };
    }
    
    const data = usageDoc.data();
    const lastReset = data.atsOptimizations?.lastReset?.toDate() || new Date(0);
    
    // Reset counter if it's a new day
    if (lastReset.getTime() < today.getTime()) {
      await adminDb.collection('userUsage').doc(uid).update({
        'atsOptimizations.count': 0,
        'atsOptimizations.lastReset': today,
        'atsOptimizations.attempts': []
      });
      return { allowed: true, remaining: MEMBERSHIP_LIMITS.DAILY_ATS_OPTIMIZATIONS };
    }
    
    const currentCount = data.atsOptimizations?.count || 0;
    const remaining = Math.max(0, MEMBERSHIP_LIMITS.DAILY_ATS_OPTIMIZATIONS - currentCount);
    
    return {
      allowed: currentCount < MEMBERSHIP_LIMITS.DAILY_ATS_OPTIMIZATIONS,
      remaining,
      resetsAt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    };
    
  } catch (error) {
    console.error('Error checking ATS optimization limit:', error);
    throw new Error('Failed to check usage limits');
  }
}

/**
 * Record ATS optimization attempt
 */
export async function recordATSOptimization(uid, success = true) {
  try {
    const timestamp = new Date();
    
    await adminDb.collection('userUsage').doc(uid).update({
      'atsOptimizations.count': adminDb.FieldValue.increment(1),
      'atsOptimizations.attempts': adminDb.FieldValue.arrayUnion({
        timestamp,
        success
      })
    });
    
  } catch (error) {
    console.error('Error recording ATS optimization:', error);
    throw new Error('Failed to record usage');
  }
}

/**
 * Check current membership count and availability
 */
export async function checkMembershipAvailability() {
  try {
    const statsDoc = await adminDb.collection('systemStats').doc('membershipCount').get();
    
    if (!statsDoc.exists) {
      // Initialize stats document
      await adminDb.collection('systemStats').doc('membershipCount').set({
        totalUsers: 0,
        maxUsers: MEMBERSHIP_LIMITS.MAX_FOUNDING_MEMBERS,
        lastUpdated: new Date(),
        waitlistCount: 0
      });
      return {
        available: true,
        totalUsers: 0,
        maxUsers: MEMBERSHIP_LIMITS.MAX_FOUNDING_MEMBERS,
        remaining: MEMBERSHIP_LIMITS.MAX_FOUNDING_MEMBERS
      };
    }
    
    const data = statsDoc.data();
    const totalUsers = data.totalUsers || 0;
    const maxUsers = data.maxUsers || MEMBERSHIP_LIMITS.MAX_FOUNDING_MEMBERS;
    const remaining = Math.max(0, maxUsers - totalUsers);
    
    return {
      available: totalUsers < maxUsers,
      totalUsers,
      maxUsers,
      remaining,
      waitlistCount: data.waitlistCount || 0
    };
    
  } catch (error) {
    console.error('Error checking membership availability:', error);
    return {
      available: false,
      totalUsers: MEMBERSHIP_LIMITS.MAX_FOUNDING_MEMBERS,
      maxUsers: MEMBERSHIP_LIMITS.MAX_FOUNDING_MEMBERS,
      remaining: 0,
      error: true
    };
  }
}

/**
 * Increment membership count (called when user successfully signs up)
 */
export async function incrementMembershipCount() {
  try {
    await adminDb.collection('systemStats').doc('membershipCount').update({
      totalUsers: adminDb.FieldValue.increment(1),
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error incrementing membership count:', error);
    throw new Error('Failed to update membership count');
  }
}

/**
 * Add user to waitlist
 */
export async function addToWaitlist(email, name = '') {
  try {
    await adminDb.collection('waitlist').add({
      email,
      name,
      addedAt: new Date(),
      notified: false
    });
    
    // Increment waitlist counter
    await adminDb.collection('systemStats').doc('membershipCount').update({
      waitlistCount: adminDb.FieldValue.increment(1),
      lastUpdated: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw new Error('Failed to add to waitlist');
  }
}

/**
 * Validate and sanitize job description input
 */
export function validateJobDescription(description) {
  if (!description || typeof description !== 'string') {
    throw new Error('Job description is required and must be text');
  }
  
  // Remove potential HTML/script tags
  const sanitized = description
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
  if (sanitized.length < 50) {
    throw new Error('Job description must be at least 50 characters long');
  }
  
  if (sanitized.length > 10000) {
    throw new Error('Job description cannot exceed 10,000 characters');
  }
  
  return sanitized;
}