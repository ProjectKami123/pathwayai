// app/api/generate-resume/route.js

import { NextResponse } from 'next/server';
import { adminDb, verifyToken } from '@/lib/firebaseAdmin'; // Use shared verifyToken, no need for adminAuth here
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  let token = null;
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or malformed token' }, { status: 401 });
    }

    token = authorization.split('Bearer ')[1];
    const decodedToken = await verifyToken(token);
    const uid = decodedToken.uid;
    // Logging redacted for security - UID verification successful

    const { jobData } = await request.json();
    if (!jobData || !jobData.description) {
      return NextResponse.json({ error: 'Missing or invalid job data' }, { status: 400 });
    }

    const profileDoc = await adminDb.collection('userProfiles').doc(uid).get();
    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    const userProfile = profileDoc.data();

    const prompt = `
      As an expert resume writer, rewrite the 'Work Experience' section of the user's profile to be perfectly tailored for the provided job description.

      **Instructions:**
      - Focus on quantifiable achievements. Use numbers and metrics where possible.
      - Use strong action verbs.
      - Rephrase the user's experience to directly match the key requirements in the job description.
      - Output the result as a clean string, ready to be used. Start with a heading "## Professional Experience".

      **User's Professional Experience (for context):**
      ${JSON.stringify({
        workExperience: userProfile.workExperience,
        skills: userProfile.skills,
        education: userProfile.education
      }, null, 2)}

      **Target Job Description:**
      ${(jobData.description || '').substring(0, 10000)}

      **Generated Resume Section:**
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const resumeSection = response.choices[0].message.content.trim();
    return NextResponse.json({ resume: resumeSection });

  } catch (error) {
    console.error('Error in /api/generate-cover-letter:', error.code || 'Unknown error');
    
    // Generic error messages to prevent information leakage
    if (error.message && error.message.toLowerCase().includes('unauthorized')) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}
