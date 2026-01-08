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
// Team Member Card Component
function TeamMemberCard({ member }: { member: TeamMember }) {
  const isManager = member.role?.toLowerCase().includes('manager')

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-muted/30 bg-muted/5 p-4 transition-all hover:bg-muted/10">
      <Avatar className="h-10 w-10 border border-muted/20">
        <AvatarFallback className={cn(
          'text-xs font-bold uppercase tracking-wider',
          isManager ? 'bg-primary/10 text-primary' : 'bg-muted/30 text-muted-foreground/60'
        )}>
          {getInitials(member.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">{member.name}</p>
        <p className="truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{member.role || 'Contributor'}</p>
      </div>
      <Badge
        variant="secondary"
        className={cn(
          'shrink-0 h-6 px-2 text-[10px] font-black uppercase tracking-widest rounded-full border-none',
          isManager ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted-foreground/50'
        )}
      >
        {isManager ? 'Coach' : 'Collaborator'}
      </Badge>
    </div>
  )
}

// Empty Team State Component
function EmptyTeamState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted/30 bg-muted/5 py-12 px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/10 text-muted-foreground/20">
        <UsersIcon className="h-7 w-7" />
      </div>
      <p className="text-sm font-bold tracking-tight text-foreground">No team members assigned</p>
      <p className="mt-1 max-w-xs text-xs font-medium text-muted-foreground/60 leading-relaxed">
        Collaborators assigned to this client will appear here for project management.
      </p>
      <Button asChild variant="outline" className="mt-6 h-9 rounded-xl border-muted/30 px-6 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all hover:bg-muted/5 active:scale-[0.98]">
        <Link href="/admin/clients">
          <UserPlus className="mr-2 h-3.5 w-3.5" />
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
    <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
      <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Team Members</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                {teamMembers.length} Active Contributors
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
              <Input
                placeholder="Search team..."
                value={teamSearch}
                onChange={(e) => onTeamSearchChange(e.target.value)}
                className="h-9 w-full rounded-xl border-muted/30 bg-background pl-10 pr-8 text-[11px] font-medium shadow-sm transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/5 sm:w-48"
              />
              {teamSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-lg p-0 text-muted-foreground/40 hover:text-foreground"
                  onClick={() => onTeamSearchChange('')}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-muted/30 bg-background px-4 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all hover:bg-muted/5 active:scale-[0.98]">
              <Link href="/admin/clients">
                <UserPlus className="mr-2 h-3.5 w-3.5" />
                Add
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {teamMembers.length === 0 ? (
          <EmptyTeamState />
        ) : filteredTeamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted/30 bg-muted/5 py-12 text-center">
            <Search className="mb-4 h-10 w-10 text-muted-foreground/10" />
            <p className="text-sm font-bold text-foreground">No matching members</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground/50">
              Try refining your search criteria
            </p>
            <Button variant="ghost" size="sm" className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary" onClick={() => onTeamSearchChange('')}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredTeamMembers.map((member, index) => (
              <TeamMemberCard key={`${member.name}-${index}`} member={member} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
