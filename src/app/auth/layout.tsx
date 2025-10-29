import { Card, CardContent } from '@/components/ui/card'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-4xl border-muted/60 bg-background/80 shadow-lg backdrop-blur">
        <CardContent className="p-6 md:p-10">
          {children}
        </CardContent>
      </Card>
    </main>
  )
}
