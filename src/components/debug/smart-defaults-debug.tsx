'use client'

import { useSmartDefaults } from '@/hooks/use-smart-defaults'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function SmartDefaultsDebug() {
  const { taskDefaults, contextInfo } = useSmartDefaults()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Smart Defaults Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-xs font-medium mb-2">Context Info</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Client:</span>
              <Badge variant={contextInfo.clientId ? "default" : "secondary"}>
                {contextInfo.clientName || 'None'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Project:</span>
              <Badge variant={contextInfo.projectId ? "default" : "secondary"}>
                {contextInfo.projectName || 'None'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>User:</span>
              <Badge variant={contextInfo.userId ? "default" : "secondary"}>
                {contextInfo.userId ? 'Set' : 'None'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Auto-populated:</span>
              <Badge variant={contextInfo.isAutoPopulated ? "default" : "secondary"}>
                {contextInfo.isAutoPopulated ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium mb-2">Task Defaults</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Priority:</span>
              <span className="font-mono">{taskDefaults.priority}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-mono">{taskDefaults.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Due Date:</span>
              <span className="font-mono">
                {taskDefaults.dueDate ? new Date(taskDefaults.dueDate).toLocaleDateString() : 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Assigned To:</span>
              <span className="font-mono">{taskDefaults.assignedTo || 'None'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
