"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {  GoogleGenerativeAI } from "@google/generative-ai";
 






const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model  = genAi.getGenerativeModel({ model : "gemini-1.5-flash"});



export const  generatedAiInsight = async (industry) => {
    const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "HIGH" | "Medium" | "LOW",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }
    
    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges.
    Growth rate should be a percentage.
    Include at least 5 skills and trends.
  `;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
 console.log(cleanedText);
  return JSON.parse(cleanedText);

  
}
export async function getIndustryInsight(){
      const { userId } = await auth();
    
      if (!userId) {
        throw new Error("User not authorized");
      }
      const user = await db.user.findUnique({
        where: {
          clerkUserId: userId,
        },
        select: {
          industryInsight: true
          

          // Add other fields you need to select
        }
      });
      if (!user) {
        throw new Error("User not found");
      }

      try {

        if(!user.industryInsight){
            const insights = await generatedAiInsight(user.industry)
            const industries =   await db.industryInsight.create({
                data:{
                    industry:user.industry,
                    ...insights,
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            })
            return industries
            
        }

        return user.industryInsight
      } catch (error) {
        console.log(error)
      }
      
}