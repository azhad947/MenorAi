"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateQuiz() {
  // 1️⃣ Authentication Check
  const authData = await auth();
  if (!authData || !authData.userId) {
    console.error("Auth failed or user not logged in");
    throw new Error("Unauthorized: Authentication failed");
  }
  const { userId } = authData;

  // 2️⃣ Fetch User Details from Database
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, skills: true },
  });

  if (!user) {
    console.error(`User not found for userId: ${userId}`);
    throw new Error("User not found in database");
  }

  // 3️⃣ Generate AI Prompt
  const prompt = `
  Generate 3 technical interview questions for a ${user.industry} professional${user.skills?.length ? " with expertise in " + user.skills.join(", ") : ""}.
  
  Each question should:
  - Be a multiple-choice question with 4 answer options.
  - Have a clearly defined correct answer.
  - Include a short explanation for why the correct answer is right.
  
  ⚠️ IMPORTANT INSTRUCTIONS:
  - Do NOT include any code blocks (\`\`\`) or markdown formatting.
  - Return only valid **raw JSON** (not wrapped in code block formatting).
  - The JSON should be structured exactly like this:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  - Do NOT include any introductory/explanatory text before or after the JSON.
  - Keep all questions and answers **plain text** (no markdown, no formatting).
  `;
  

  // 4️⃣ Generate Quiz Using AI Model
  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error) {
    console.error("AI model failed to generate content:", error);
    throw new Error("Quiz generation failed: AI model error");
  }

  if (!result || !result.response) {
    console.error("AI response is undefined");
    throw new Error("Quiz generation failed: No response from AI model");
  }

  const text = result.response.text();

  // 5️⃣ Parse AI Response to JSON
  let quiz;
  try {
    const  cleanedText = text
    .replace(/^```json|```$/g, "") // Removes the opening/closing ```json backticks
    .replace(/```(javascript|python|json)?\n?/g, "") // Removes inline code blocks inside questions
    .trim();

    quiz = JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error parsing AI response:", text);
    throw new Error("Failed to parse quiz JSON");
  }

  return quiz.questions;
}



export async function savingQuizResult(data) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authorized");
    }

    // User lookup
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        id: true,
        industry: true,
        skills: true,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const { questions, answer, score } = data;

    // Input validation
    if (!questions || !Array.isArray(questions)) {
      throw new Error("Invalid questions format");
    }

    // Ensure answer is an array
    const userAnswers = Array.isArray(answer) ? answer : [...answer];

    // Process question results
    const questionResults = questions.map((q, index) => ({
      question: q.question,
      answer: q.correctAnswer,
      userAnswer: userAnswers[index] ,
      isCorrect: q.correctAnswer === (userAnswers[index]),
      explanation: q.explanation,
    }));

    // Handle wrong answers and improvement tips
    const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
    let improvementTip = null;

    if (wrongAnswers.length > 0) {
      const wrongQuestionsText = wrongAnswers
        .map(
          (q) =>
            `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
        )
        .join("\n\n");

      const improvementPrompt = `
        The user got the following ${user.industry} technical interview questions wrong:

        ${wrongQuestionsText}

        Based on these mistakes, provide a concise, specific improvement tip.
        Focus on the knowledge gaps revealed by these wrong answers.
        Keep the response under 2 sentences and make it encouraging.
        Don't explicitly mention the mistakes, instead focus on what to learn/practice.
      `;

      try {
        const tipResult = await model.generateContent(improvementPrompt);
        improvementTip = tipResult.response.text().trim();
      } catch (error) {
        console.error("Error generating improvement tip:", error);
        // Continue without improvement tip
      }
    }

    // Save to database
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score || 0, // Ensure score is never null
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return  assessment;

  } catch (error) {
    console.error("Error in savingQuizResult:", error);
    throw new Error(`Failed to save quiz result: ${error.message}`);
  }
}

export async function getAssessment() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authorized");
  }
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    select: {
      id: true,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const assessment = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return assessment;
  } catch (error) {
    console.error("Error getting assessment:", error);
        throw new Error("Failed to get assessment");
  }
}
