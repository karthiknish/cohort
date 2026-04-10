import type { DirectoryContact } from '@/types/workforce'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import { ContactCard } from './contact-card'

export function PeopleDirectory({ contacts }: { contacts: DirectoryContact[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">People directory</CardTitle>
        <CardDescription>Searchable role and contact context for the internal operating layer.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </CardContent>
    </Card>
  )
}
