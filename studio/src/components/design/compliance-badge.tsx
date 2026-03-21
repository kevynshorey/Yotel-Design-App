import { Badge } from '@/components/ui/badge'

interface ComplianceBadgeProps {
  isValid: boolean
  violationCount: number
  warningCount: number
}

export function ComplianceBadge({ isValid, violationCount, warningCount }: ComplianceBadgeProps) {
  if (isValid && warningCount === 0) {
    return <Badge className="bg-green-600 text-white">PASS</Badge>
  }
  if (isValid && warningCount > 0) {
    return <Badge className="bg-amber-500 text-white">{warningCount} warning{warningCount > 1 ? 's' : ''}</Badge>
  }
  return <Badge variant="destructive">{violationCount} violation{violationCount > 1 ? 's' : ''}</Badge>
}
