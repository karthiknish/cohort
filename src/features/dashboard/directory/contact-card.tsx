import type { DirectoryContact } from '@/types/workforce'
import { Card, CardContent } from '@/shared/ui/card'

export function ContactCard({ contact }: { contact: DirectoryContact }) {
  return (
    <Card className="border-muted/50">
      <CardContent className="space-y-3 p-5">
        <div>
          <p className="font-medium text-foreground">{contact.name}</p>
          <p className="text-sm text-muted-foreground">{contact.role}</p>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{contact.team}</p>
          <p>{contact.location} · {contact.timezone}</p>
          <p>{contact.email}</p>
          <p className="text-foreground/80">{contact.focus}</p>
        </div>
      </CardContent>
    </Card>
  )
}
