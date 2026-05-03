import { auth } from '@clerk/nextjs/server'
export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const res = await fetch(
    `https://api.unkey.dev/v1/apis.listKeys?apiId=${process.env.UNKEY_API_ID}&ownerId=${userId}`,
    { headers: { 'Authorization': `Bearer ${process.env.UNKEY_ROOT_KEY}` } }
  )
  const data = await res.json()
  return Response.json(data)
}
