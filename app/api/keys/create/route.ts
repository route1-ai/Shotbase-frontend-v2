import { auth } from '@clerk/nextjs/server'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const res = await fetch('https://api.unkey.dev/v1/keys.createKey', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiId: process.env.UNKEY_API_ID,
        ownerId: userId,
        prefix: "sk_live"
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Unkey API error:', res.status, errorText)
      return Response.json({ error: 'Failed to create key' }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error('Failed to create Unkey API key:', err)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
