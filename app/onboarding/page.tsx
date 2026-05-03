"use client"
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    fetch('/api/keys/list')
      .then(r => r.json())
      .then(data => { if (data.keys?.[0]) setApiKey(data.keys[0].start + '••••••••') })
  }, [])

  const copy = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{minHeight:'100vh',background:'#050505',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{maxWidth:'480px',width:'100%'}}>
        <div style={{display:'flex',gap:'8px',marginBottom:'32px'}}>
          {[1,2,3].map(s => (
            <div key={s} style={{height:'3px',flex:1,background:s<=step?'#00e87b':'#1a1a24',borderRadius:'2px',transition:'background 0.3s'}}/>
          ))}
        </div>

        {step === 1 && (
          <div>
            <p style={{color:'#00e87b',fontFamily:'monospace',fontSize:'12px',marginBottom:'8px'}}>STEP 1 OF 3</p>
            <h1 style={{color:'#f0f0f8',fontSize:'24px',fontWeight:'700',marginBottom:'8px'}}>Your API key is ready</h1>
            <p style={{color:'#555566',marginBottom:'24px'}}>Copy it now. You can always find it in your dashboard.</p>
            <div style={{background:'#0c0c12',border:'1px solid #1a1a24',borderRadius:'8px',padding:'16px',fontFamily:'monospace',fontSize:'13px',color:'#00e87b',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span>{apiKey || 'Loading your key...'}</span>
              <button onClick={copy} style={{background:copied?'transparent':'#00e87b',color:copied?'#00e87b':'#000',border:copied?'1px solid #00e87b':'none',padding:'6px 14px',borderRadius:'4px',cursor:'pointer',fontFamily:'monospace',fontSize:'11px',fontWeight:'700'}}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <button onClick={() => setStep(2)} style={{width:'100%',background:'#00e87b',color:'#000',border:'none',padding:'12px',borderRadius:'6px',fontWeight:'700',cursor:'pointer',fontSize:'14px'}}>
              I copied it, continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{color:'#00e87b',fontFamily:'monospace',fontSize:'12px',marginBottom:'8px'}}>STEP 2 OF 3</p>
            <h1 style={{color:'#f0f0f8',fontSize:'24px',fontWeight:'700',marginBottom:'8px'}}>Take your first screenshot</h1>
            <p style={{color:'#555566',marginBottom:'24px'}}>Try the API right now from your terminal.</p>
            <div style={{background:'#0c0c12',border:'1px solid #1a1a24',borderRadius:'8px',padding:'16px',fontFamily:'monospace',fontSize:'12px',color:'#c8c8d4',lineHeight:'1.9',marginBottom:'24px'}}>
              <span style={{color:'#555566'}}># paste this in your terminal</span><br/>
              curl -X POST https://shotbase-production.up.railway.app/screenshot \<br/>
              &nbsp;&nbsp;-H "Authorization: Bearer YOUR_KEY" \<br/>
              &nbsp;&nbsp;-d '{JSON.stringify({url:"https://stripe.com",format:"png"})}' \<br/>
              &nbsp;&nbsp;--output screenshot.png
            </div>
            <button onClick={() => setStep(3)} style={{width:'100%',background:'#00e87b',color:'#000',border:'none',padding:'12px',borderRadius:'6px',fontWeight:'700',cursor:'pointer',fontSize:'14px'}}>
              Done, continue →
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <p style={{color:'#00e87b',fontFamily:'monospace',fontSize:'12px',marginBottom:'8px'}}>STEP 3 OF 3</p>
            <h1 style={{color:'#f0f0f8',fontSize:'24px',fontWeight:'700',marginBottom:'8px'}}>You are ready</h1>
            <p style={{color:'#555566',marginBottom:'8px'}}>500 free screenshots per month.</p>
            <p style={{color:'#555566',marginBottom:'24px'}}>No credit card needed to get started.</p>
            <button onClick={() => router.push('/dashboard')} style={{width:'100%',background:'#00e87b',color:'#000',border:'none',padding:'12px',borderRadius:'6px',fontWeight:'700',cursor:'pointer',fontSize:'14px'}}>
              Go to dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
