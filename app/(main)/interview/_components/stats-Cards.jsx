import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { ArrowBigUpDashIcon, Brain, Percent, ScanBarcode, Trophy } from "lucide-react"
  
const StatsCards = ({assessments}) => {
    let totalQuestions = 0;
    let score = 0
    let latestScore = 0
    assessments.map((as , index) => {
        if(as[index] > assessments.length -  2){
            latestScore= as.quizScore
        }
        score = score +   as.quizScore 
        totalQuestions = totalQuestions +  as.questions.length ;
       
    })
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-2'>

<Card >
<CardHeader className='flex flex-row justify-between items-center pb-2'>
    <CardTitle>Average Score</CardTitle>
    <Trophy />
    
  </CardHeader>
  <CardContent className='flex items-center text-xl'>
   {score / totalQuestions * 100}
   <Percent className="w-4 h-4"/>
  </CardContent>
  <CardFooter>
    <p className=" text-gray-400 text-sm">Across all assesments</p>
  </CardFooter>
</Card>

<Card>
<CardHeader className='flex flex-row justify-between items-center pb-2'>
    <CardTitle>Question Practiced</CardTitle>
    <Brain />
  
  </CardHeader>
  <CardContent>
    {totalQuestions }
  </CardContent>
  <CardFooter>
    <p>Total questions</p>
  </CardFooter>
</Card>

<Card>
<CardHeader className='flex flex-row justify-between items-center pb-2'>

    <CardTitle>Latest Score</CardTitle>
    <ArrowBigUpDashIcon />

  </CardHeader>
  <CardContent>
    {latestScore}
  </CardContent>
  <CardFooter>
    <p>Most recent Quiz</p>
  </CardFooter>
</Card>

    </div>
  )
} 

export default StatsCards