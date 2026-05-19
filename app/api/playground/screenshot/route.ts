import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    
    // Proxy the request to Railway backend
    const res = await fetch('https://shotbase-production.up.railway.app/screenshot', {
      method: 'POST',
      headers: {
        // Use a generic bypass or root key for the playground proxy
        'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY || 'playground_bypass'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Railway API error:', res.status, errorText)
      return new Response(errorText, { status: res.status })
    }

    // Return the binary blob
    const blob = await res.blob()
    const headers = new Headers()
    headers.set('Content-Type', res.headers.get('Content-Type') || 'image/png')
    headers.set('x-cache', res.headers.get('x-cache') || 'MISS')
    
    return new Response(blob, { status: 200, headers })
  } catch (err: any) {
    console.error('Playground proxy error:', err)
    return Response.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
