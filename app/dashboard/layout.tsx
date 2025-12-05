import { redirect } from 'next/navigation'
import { verifyAuth } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await verifyAuth()

  if (!auth.authenticated) {
    redirect('/login')
  }

  return <>{children}</>
}

