import { getAssessment } from "@/actions/interview";
import StatsCards from "./_components/stats-Cards";
import PerformanceChart from "./_components/performance-Chart";
import Quizlist from "./_components/quiz-list";

const page = async() => {
  const assessments =await getAssessment()
  console.log(assessments)
  return (
    <div>
      <div className="m-auto -mt-8 -z-50 w-[100%] h-[100%] fixed bg-[#141E30] bg-[linear-gradient(to_top,#243B55,#141E30)]"></div>
      <div className="gradient-title text-4xl">Interview Preparation</div>

      <div className="space-y-6"> 
       <StatsCards assessments={assessments} />
       <PerformanceChart assessments={assessments} />
       <Quizlist  assessments={assessments} />
       
      </div>
    </div>
  );
};

export default page;
