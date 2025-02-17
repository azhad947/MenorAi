import { SignUp } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div>
        <SignUp redirectUrl="/onBoarding" />
    </div>
  )
}

export default page