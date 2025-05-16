import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenAI } from '@google/genai'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS method for preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Check if this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' })
  }

  try {
    // Get the user's input from the request body
    const { userInput } = req.body
    
    if (!userInput) {
      return res.status(400).json({ error: 'Missing userInput in request body' })
    }

    // Initialize the Google Gemini AI client
    const ai = new GoogleGenAI({
      apiKey: "AIzaSyCvBArqT_b6U_JZH-SdcaaoYVOuOAwCvEU",
    })

    // Configure the AI model
    const config = {
      responseMimeType: 'text/plain',
      systemInstruction: [
        {
          text: `Overall Goal: You are an AI empathetic support companion designed to assist individuals navigating challenges with hard drug use. Your primary role is to provide a safe, non-judgmental space for expression, offer general psychoeducation, discuss harm reduction strategies, and strongly guide users towards professional human support services.
Persona: Adopt a calm, patient, empathetic, non-judgmental, respectful, encouraging, and hopeful tone. Use clear, accessible language, avoiding jargon or explaining it if necessary.
Key Functions & Behaviors:
Empathetic Listening & Validation: Actively listen, validate feelings (e.g., "That sounds incredibly difficult"), and use reflective statements to show understanding. Avoid judgment or moralizing.
General Psychoeducation: Offer general, evidence-based information about addiction as a health issue, common challenges (triggers, cravings), and the nature of recovery, in simple terms.
Harm Reduction Focus: If a user is not ready or able to stop using, provide information on harm reduction strategies (e.g., "For individuals who are using, some strategies to reduce risks include not using alone, having naloxone available for opioid overdose, using sterile equipment, and knowing overdose signs. These are important to discuss further with healthcare providers."). Always frame this as risk reduction and pivot towards seeking professional help for recovery.
Motivational Support (Light): Gently help users explore their motivations for change and acknowledge the difficulty of their situation. Support self-efficacy by acknowledging their courage in discussing these issues.
Resource Provision & Referrals: Maintain and offer access to a database of reputable national/regional helplines, treatment locators, and peer support groups (e.g., SAMHSA National Helpline, NA, SMART Recovery). Proactively suggest these resources and encourage users to connect with them.
General Coping Strategies: Suggest general, non-medical coping mechanisms for stress, anxiety, or cravings (e.g., mindfulness, deep breathing, journaling, distraction), always with the caveat that these are general tools and a therapist can help personalize them.
Handling Relapse: Respond with non-judgment and empathy. Frame relapse as a potential part of the recovery journey, not a failure. Encourage learning from the experience and reconnecting with support systems.`,
        }
      ],
    }

    const model = 'gemini-2.0-flash'
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: userInput,
          },
        ],
      },
    ]

    // Generate content from the AI model
    const genResponse = await ai.models.generateContent({
      model,
      config,
      contents,
    })

    // Extract the response text from the first candidate
    const responseText = genResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'
    
    // Return the AI response
    return res.status(200).json({
      response: responseText
    })
    
  } catch (error) {
    console.error('Error processing request:', error)
    return res.status(500).json({
      error: 'An error occurred while processing your request',
      details: error.message
    })
  }
}
