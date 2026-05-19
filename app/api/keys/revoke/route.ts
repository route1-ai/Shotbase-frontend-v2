import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { keyId } = await req.json()
    if (!keyId) return Response.json({ error: 'Missing keyId' }, { status: 400 })

    const listRes = await fetch(
      `https://api.unkey.dev/v1/apis.listKeys?apiId=${process.env.UNKEY_API_ID}&ownerId=${userId}`,
      { headers: { 'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY}` } }
    )
    const listData = await listRes.json()
    const ownsKey = listData.keys?.some((k: any) => k.id === keyId)
    
    if (!ownsKey) {
      return Response.json({ error: 'Unauthorized or key not found' }, { status: 403 })
    }

    const res = await fetch('https://api.unkey.dev/v1/keys.deleteKey', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ keyId })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Unkey API error:', res.status, errorText)
      return Response.json({ error: 'Failed to revoke key' }, { status: res.status })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Failed to revoke Unkey API key:', err)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
