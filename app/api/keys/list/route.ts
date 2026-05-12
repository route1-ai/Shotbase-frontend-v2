import { auth } from '@clerk/nextjs/server'
export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const res = await fetch(
      `https://api.unkey.dev/v1/apis.listKeys?apiId=${process.env.UNKEY_API_ID}&ownerId=${userId}`,
      { headers: { 'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY}` } }
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Unkey API error:', res.status, errorText)
      return Response.json({ error: 'Failed to fetch keys from Unkey' }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error('Failed to fetch Unkey API:', err)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
