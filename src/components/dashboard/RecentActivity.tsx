
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ActivityItem {
    id: number;
    name: string; // "Student Name" or "Payment" (if generic)
    type: string; // ADMISSION, PAYMENT
    amount: number;
    createdAt: Date;
}

interface RecentActivityProps {
    data: ActivityItem[]
}

export function RecentActivity({ data }: RecentActivityProps) {
    return (
        <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Latest admissions and transactions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {data.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
                    {data.map((item, index) => (
                        <div key={`${item.type}-${item.id}-${index}`} className="flex items-start justify-between space-x-4">
                            <div className="flex items-center space-x-4 min-w-0">
                                <Avatar className="h-9 w-9 flex-shrink-0">
                                    <AvatarFallback className={item.type === 'ADMISSION' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                        {item.type === 'ADMISSION' ? 'AD' : 'PY'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 min-w-0">
                                    <p className="text-sm font-medium leading-none truncate pr-2">
                                        {item.type === 'ADMISSION' ? `New Admission: ${item.name}` : `Payment Received`}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm font-medium whitespace-nowrap flex-shrink-0">
                                {item.type === 'PAYMENT' ? `+₹${item.amount}` : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
