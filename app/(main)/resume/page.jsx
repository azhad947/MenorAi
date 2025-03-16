import { getResume } from "@/actions/resume"
import ResumeBuilder from "./_components/ResumeBuilder"

const page = async () => {

  const resume = await getResume()
  return (
    <div>
      <ResumeBuilder  />
    </div>
  )
}

export default page