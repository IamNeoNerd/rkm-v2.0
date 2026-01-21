import { Phone, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Family } from "@/types";
import { cn } from "@/lib/utils";

interface FamilyCardProps {
    family: Family;
    onCollectFee: (family: Family) => void;
}

export function FamilyCard({ family, onCollectFee }: FamilyCardProps) {
    const isDue = family.total_due < 0;

    return (
        <Card className="w-full max-w-md bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-2 sm:gap-y-0 pb-2">
                <div className="flex flex-col space-y-1 w-full sm:w-auto">
                    <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2 break-all sm:break-normal">
                        <User className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <span className="truncate">{family.father_name}</span>
                    </h3>
                    <div className="flex items-center text-sm text-slate-500">
                        <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                        {family.phone}
                    </div>
                </div>
                <Badge
                    variant={isDue ? "destructive" : "success"}
                    className={cn("px-3 py-1 text-sm whitespace-nowrap w-fit self-start sm:self-auto")}
                >
                    {isDue ? `Due: ₹${Math.abs(family.total_due)}` : `Advance: ₹${family.total_due}`}
                </Badge>
            </CardHeader>
            <CardContent className="grid gap-2">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Children
                </div>
                {family.children.map((child) => (
                    <div
                        key={child.id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                        <span className="font-medium text-slate-700">{child.name}</span>
                        <Badge variant="outline" className="bg-white text-slate-600 border-slate-200">
                            {child.class}
                        </Badge>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="lg"
                    onClick={() => onCollectFee(family)}
                >
                    Collect Fee
                </Button>
            </CardFooter>
        </Card>
    );
}
