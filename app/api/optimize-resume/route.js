import { NextResponse } from 'next/server';
import { verifyToken, adminDb } from '@/lib/firebaseAdmin';
import { checkATSOptimizationLimit, recordATSOptimization, validateJobDescription } from '@/lib/rateLimiter';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  let uid = null;
  
  try {
    // Authentication
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    const decodedToken = await verifyToken(token);
    uid = decodedToken.uid;

    // Rate limiting check
    const rateLimitCheck = await checkATSOptimizationLimit(uid);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({
        error: 'Daily limit reached',
        message: `You've used all ${3} optimizations today. Resets at midnight.`,
        remaining: 0,
        resetsAt: rateLimitCheck.resetsAt
      }, { status: 429 });
    }

    // Input validation
    const { jobDescription } = await request.json();
    const sanitizedJobDescription = validateJobDescription(jobDescription);

    // Get user profile
    const profileDoc = await adminDb.collection('userProfiles').doc(uid).get();
    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Profile not found. Please create your profile first.' }, { status: 404 });
    }

    const userProfile = profileDoc.data();
    
    // Validate user has sufficient profile data
    if (!userProfile.workExperience || userProfile.workExperience.length === 0) {
      return NextResponse.json({ 
        error: 'Insufficient profile data', 
        message: 'Please add work experience to your profile before optimizing your resume.' 
      }, { status: 400 });
    }

    // Create intelligent optimization prompt
    const optimizationPrompt = `
You are an expert ATS (Applicant Tracking System) optimization specialist and resume writer. Your task is to intelligently optimize a user's resume content to better match a job description while maintaining authenticity and readability.

CRITICAL REQUIREMENTS:
1. MAINTAIN ORIGINAL CONTENT LENGTH: Do not make the resume significantly longer
2. PRESERVE AUTHENTICITY: Don't fabricate experiences or skills
3. SMART KEYWORD INTEGRATION: Naturally incorporate relevant keywords from the job description
4. ATS OPTIMIZATION: Use simple formatting, clear section headers, and keyword-rich language
5. QUANTIFY ACHIEVEMENTS: Add metrics where logical and possible
6. ACTION VERBS: Use strong, industry-appropriate action verbs

USER'S CURRENT PROFILE:
${JSON.stringify({
  personalInfo: {
    firstName: userProfile.personalInfo?.firstName || '',
    lastName: userProfile.personalInfo?.lastName || '',
    title: userProfile.personalInfo?.title || '',
    summary: userProfile.personalInfo?.summary || ''
  },
  workExperience: userProfile.workExperience?.slice(0, 5) || [], // Limit to 5 most recent
  education: userProfile.education?.slice(0, 3) || [], // Limit to 3 most recent
  skills: userProfile.skills?.slice(0, 20) || [], // Limit to 20 skills
  certifications: userProfile.certifications?.slice(0, 5) || []
}, null, 2)}

TARGET JOB DESCRIPTION:
${sanitizedJobDescription.substring(0, 8000)}

OPTIMIZATION INSTRUCTIONS:
1. Rewrite the Professional Summary to better align with the job requirements
2. Optimize work experience descriptions to include relevant keywords naturally
3. Suggest 3-5 additional skills that match the job description (only if user has related experience)
4. Ensure all bullet points are concise and impact-focused
5. Use industry-standard terminology from the job description

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "optimizedSummary": "Enhanced professional summary",
  "optimizedExperience": [
    {
      "title": "Job Title",
      "company": "Company Name", 
      "duration": "Date Range",
      "description": "• Optimized bullet point 1\n• Optimized bullet point 2\n• Optimized bullet point 3"
    }
  ],
  "suggestedSkills": ["skill1", "skill2", "skill3"],
  "keywordMatches": ["keyword1", "keyword2", "keyword3"],
  "optimizationNotes": "Brief explanation of key changes made"
}

Focus on quality over quantity. Make targeted improvements that will help the resume pass ATS screening while remaining authentic and professional.
`;

    // Call OpenAI with cost controls
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model
      messages: [{ role: 'user', content: optimizationPrompt }],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 2000, // Reasonable limit
      timeout: 30000 // 30 second timeout
    });

    const aiResponse = completion.choices[0].message.content.trim();
    
    // Parse the JSON response
    let optimizedContent;
    try {
      optimizedContent = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to process optimization results');
    }

    // Validate the response structure
    if (!optimizedContent.optimizedSummary || !optimizedContent.optimizedExperience) {
      throw new Error('Invalid optimization response format');
    }

    // Record successful usage
    await recordATSOptimization(uid, true);

    // Return optimized content
    return NextResponse.json({
      success: true,
      optimization: optimizedContent,
      usage: {
        remaining: rateLimitCheck.remaining - 1,
        resetsAt: rateLimitCheck.resetsAt
      },
      message: 'Resume successfully optimized for ATS compatibility'
    });

  } catch (error) {
    console.error('ATS optimization error:', error);
    
    // Record failed attempt if we have uid
    if (uid) {
      try {
        await recordATSOptimization(uid, false);
      } catch (recordError) {
        console.error('Failed to record failed attempt:', recordError);
      }
    }

    // Handle specific error types
    if (error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (error.message.includes('Daily limit')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    
    if (error.message.includes('Job description')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Generic error for security
    return NextResponse.json({
      error: 'Optimization failed',
      message: 'Please try again in a few moments'
    }, { status: 500 });
  }
}