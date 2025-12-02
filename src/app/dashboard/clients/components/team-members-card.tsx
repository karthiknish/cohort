'use client'

import Link from 'next/link'
import { Search, UserPlus, Users as UsersIcon, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface TeamMember {
  name: string
  role: string
}

interface TeamMembersCardProps {
  teamMembers: TeamMember[]
  filteredTeamMembers: TeamMember[]
  teamSearch: string
  onTeamSearchChange: (value: string) => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Team Member Card Component
function TeamMemberCard({ member }: { member: TeamMember }) {
  const isManager = member.role?.toLowerCase().includes('manager')

  return (
    <div className="flex items-center gap-3 rounded-lg border border-muted/40 bg-card p-3 transition-all hover:border-muted hover:bg-muted/50">
      <Avatar className="h-10 w-10">
        <AvatarFallback className={cn(
          'text-sm font-medium',
          isManager ? 'bg-primary/10 text-primary' : 'bg-muted'
        )}>
          {getInitials(member.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
        <p className="truncate text-xs text-muted-foreground">{member.role || 'Contributor'}</p>
      </div>
      <Badge
        variant="secondary"
        className={cn(
          'shrink-0 text-xs',
          isManager && 'bg-primary/10 text-primary'
        )}
      >
        {isManager ? 'Manager' : 'Member'}
      </Badge>
    </div>
  )
}

// Empty Team State Component
function EmptyTeamState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
      <div className="mb-4 rounded-full bg-muted p-3">
        <UsersIcon className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <p className="text-sm font-medium text-foreground">No team members assigned</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add collaborators from the admin clients page to start working together.
      </p>
      <Button asChild variant="outline" className="mt-4">
        <Link href="/admin/clients">
          <UserPlus className="mr-2 h-4 w-4" />
          Manage Team
        </Link>
      </Button>
    </div>
  )
}

export function TeamMembersCard({
  teamMembers,
  filteredTeamMembers,
  teamSearch,
  onTeamSearchChange,
}: TeamMembersCardProps) {
  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Team Members</CardTitle>
          <CardDescription>
            {teamMembers.length} {teamMembers.length === 1 ? 'person' : 'people'} with access to this workspace
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search team..."
              value={teamSearch}
              onChange={(e) => onTeamSearchChange(e.target.value)}
              className="h-9 w-full pl-9 pr-8 sm:w-48"
            />
            {teamSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                onClick={() => onTeamSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/clients">
              <UserPlus className="mr-2 h-4 w-4" />
              Add
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <EmptyTeamState />
        ) : filteredTeamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
            <Search className="mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No matching members</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term
            </p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => onTeamSearchChange('')}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredTeamMembers.map((member, index) => (
              <TeamMemberCard key={`${member.name}-${index}`} member={member} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
