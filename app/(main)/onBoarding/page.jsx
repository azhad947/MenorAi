import { getOnboardingStatus } from '@/actions/user'
import { redirect } from 'next/navigation'
import React from 'react'
import Onboardingform from './_components/onboarding-form'

const Onboardingpage =  async() => {
    console.log("Onboarding page rendered");
     const { isOnboarded} = await getOnboardingStatus()
    
        if(isOnboarded){
            redirect("/dashboard")
        }
  return (
    <main>
       <Onboardingform />
    </main>
  )
}

export default Onboardingpage