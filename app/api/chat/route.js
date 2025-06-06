// app/api/chat/route.js
import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🔍 User question:', message);

    // Step 1: Convert user question to embedding
    console.log('🤖 Creating embedding for user question...');
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-large', // This creates 3072-dimensional embeddings (matches your index)
      input: message,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log(`✅ Embedding created (dimension: ${queryEmbedding.length})`);

    // Step 2: Query Pinecone for similar vectors
    console.log('🔎 Searching Pinecone for relevant information...');
    const index = pc.index(process.env.PINECONE_INDEX);
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 5, // Get top 5 most relevant results
      includeMetadata: true,
    });

    console.log(`📊 Found ${queryResponse.matches?.length || 0} relevant matches`);

    // Step 3: Extract relevant information from matches
    const relevantInfo = queryResponse.matches
      .filter(match => match.score > 0.1) // Only include reasonably relevant matches
      .map(match => {
        const metadata = match.metadata;
        return {
          id: match.id,
          score: match.score,
          occupation: metadata['ANZSCO Occupation Name'],
          description: metadata['ANZSCO Occupation Description'],
          code: metadata['ANZSCO Occupation Code'],
          skillLevel: metadata['Skill Level'],
          tasks: metadata['Tasks'],
          specialisations: metadata['Specialisations'],
          skillAssessingAuthority: metadata['Skill Assessing Authority'],
          // Visa eligibility
          mltssl: metadata['MLTSSL'],
          stsol: metadata['STSOL'],
          pmsol: metadata['PMSOL'],
          regional: metadata['Regional (494)'],
          // Earnings data
          avgEarningsMale: metadata['Avg Weekly Earnings Males'],
          avgEarningsFemale: metadata['Avg Weekly Earnings Females'],
          avgEarningsTotal: metadata['Avg Weekly Earnings Persons'],
          // State availability
          nsw: metadata['New South Wales'],
          vic: metadata['Victoria'],
          qld: metadata['Queensland'],
          wa: metadata['Western Australia'],
          sa: metadata['South Australia'],
          tas: metadata['Tasmania'],
          act: metadata['Australian Capital Territory'],
          nt: metadata['Northern Territory'],
        };
      });

    console.log(`📋 Processed ${relevantInfo.length} relevant occupations`);

    // Step 4: Generate AI response using the retrieved information
    console.log('🧠 Generating AI response...');
    
    const systemPrompt = `You are an expert Australian immigration and career advisor. You help people understand Australian occupations, visa eligibility, and career pathways.

Context: You have access to detailed ANZSCO (Australian and New Zealand Standard Classification of Occupations) data including:
- Occupation descriptions and skill levels
- Visa eligibility lists (MLTSSL, STSOL, PMSOL, Regional 494)
- Average weekly earnings by gender
- State/territory availability
- Skill assessing authorities
- Required tasks and specialisations

Guidelines:
- Be helpful, accurate, and professional
- Use the provided occupation data to give specific, relevant answers
- Explain visa eligibility clearly (MLTSSL = Medium and Long-term Strategic Skills List, STSOL = Short-term Skilled Occupation List, etc.)
- Mention salary ranges when relevant
- If no relevant data is found, say so honestly
- Always encourage users to verify information with official sources

User Question: ${message}`;

    const userPrompt = relevantInfo.length > 0 
      ? `Based on the following relevant Australian occupation data, please answer the user's question:

${relevantInfo.map((info, index) => `
Occupation ${index + 1}:
- Name: ${info.occupation}
- Code: ${info.code}
- Description: ${info.description}
- Skill Level: ${info.skillLevel}
- Tasks: ${info.tasks}
- Specialisations: ${info.specialisations}
- Skill Assessing Authority: ${info.skillAssessingAuthority}
- MLTSSL Eligible: ${info.mltssl}
- STSOL Eligible: ${info.stsol}
- PMSOL Eligible: ${info.pmsol}
- Regional (494) Eligible: ${info.regional}
- Average Weekly Earnings: Male $${info.avgEarningsMale}, Female $${info.avgEarningsFemale}, Total $${info.avgEarningsTotal}
- State Availability: NSW(${info.nsw}), VIC(${info.vic}), QLD(${info.qld}), WA(${info.wa}), SA(${info.sa}), TAS(${info.tas}), ACT(${info.act}), NT(${info.nt})
`).join('\n')}`
      : "I couldn't find any closely matching occupation data for this question. Please provide a general helpful response and suggest the user try rephrasing their question or ask about specific occupations.";

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('✅ AI response generated');

    return NextResponse.json({
      response: aiResponse,
      relevantData: relevantInfo,
      matches: queryResponse.matches?.length || 0,
    });

  } catch (error) {
    console.error('❌ Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}