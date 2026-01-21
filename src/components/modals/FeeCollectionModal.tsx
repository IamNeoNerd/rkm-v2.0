"use client"

import { useState } from "react"
import { IndianRupee, Wallet, Banknote } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Student } from "@/types"

// Simple Label component since I didn't create a separate primitive for it yet
function SimpleLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
    return (
        <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {children}
        </label>
    )
}

interface FeeCollectionModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    totalDue: number
    studentName?: string // Optional context
    onSubmit: (amount: number, mode: "CASH" | "UPI") => void
}

export function FeeCollectionModal({
    open,
    onOpenChange,
    totalDue,
    studentName,
    onSubmit,
}: FeeCollectionModalProps) {
    const [amount, setAmount] = useState<string>("")
    const [mode, setMode] = useState<"CASH" | "UPI">("CASH")
    const [error, setError] = useState<string | null>(null)

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value)
        setError(null)
    }

    const handleSubmit = () => {
        const value = parseFloat(amount)
        if (isNaN(value) || value <= 0) {
            setError("Please enter a valid positive amount.")
            return
        }
        onSubmit(value, mode)
        // Reset form
        setAmount("")
        setMode("CASH")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Collect Fee</DialogTitle>
                    <DialogDescription>
                        Enter the fee amount to be collected{studentName ? ` for ${studentName}` : ""}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 border border-slate-100">
                        <span className="text-sm font-medium text-slate-500">Total Due</span>
                        <span className="text-xl font-bold text-red-600 flex items-center">
                            <IndianRupee className="h-5 w-5 mr-1" />
                            {Math.abs(totalDue)}
                        </span>
                    </div>

                    <div className="grid gap-2">
                        <SimpleLabel htmlFor="amount">Amount Paying Now</SimpleLabel>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-9"
                                value={amount}
                                onChange={handleAmountChange}
                            />
                        </div>
                        {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>

                    <div className="grid gap-2">
                        <SimpleLabel>Payment Mode</SimpleLabel>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant={mode === "CASH" ? "default" : "outline"}
                                className={mode === "CASH" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                onClick={() => setMode("CASH")}
                            >
                                <Banknote className="mr-2 h-4 w-4" />
                                Cash
                            </Button>
                            <Button
                                type="button"
                                variant={mode === "UPI" ? "default" : "outline"}
                                className={mode === "UPI" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                onClick={() => setMode("UPI")}
                            >
                                <Wallet className="mr-2 h-4 w-4" />
                                UPI
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} className="w-full">Confirm Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
