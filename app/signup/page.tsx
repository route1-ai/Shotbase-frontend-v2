"use client"
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#050505'}}>
      <SignUp fallbackRedirectUrl="/onboarding" signInUrl="/signin" />
    </div>
  )
}
