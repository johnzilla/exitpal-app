import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getDailyUsage } from '../lib/vonage-service'
import { useAuth } from './auth-provider'
import { Crown, MessageSquare } from 'lucide-react'

export function UsageIndicator() {
  const { user } = useAuth()
  const [usage, setUsage] = useState({ count: 0, limit: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsage = async () => {
      if (!user) return
      
      try {
        const dailyUsage = await getDailyUsage()
        setUsage(dailyUsage)
      } catch (error) {
        console.error('Error loading usage:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsage()
    
    // Refresh usage every 30 seconds
    const interval = setInterval(loadUsage, 30000)
    return () => clearInterval(interval)
  }, [user])

  if (!user || loading) return null

  const percentage = usage.limit > 0 ? (usage.count / usage.limit) * 100 : 0
  const isNearLimit = percentage >= 80
  const isAtLimit = usage.count >= usage.limit

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
          <Badge variant={user.isPremium ? "default" : "secondary"} className="flex items-center gap-1">
            {user.isPremium ? (
              <>
                <Crown className="h-3 w-3" />
                Premium
              </>
            ) : (
              <>
                <MessageSquare className="h-3 w-3" />
                Free
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          {usage.count} of {usage.limit} messages sent today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress 
            value={percentage} 
            className={`h-2 ${isNearLimit ? 'text-orange-500' : isAtLimit ? 'text-red-500' : 'text-green-500'}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{usage.count} used</span>
            <span>{usage.limit - usage.count} remaining</span>
          </div>
          {isAtLimit && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Daily limit reached. {user.isPremium ? 'Limit resets at midnight.' : 'Upgrade to Premium for higher limits.'}
            </p>
          )}
          {isNearLimit && !isAtLimit && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              Approaching daily limit. {!user.isPremium && 'Consider upgrading to Premium.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}