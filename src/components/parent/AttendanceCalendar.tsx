"use client";

import { useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
    parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendanceRecord {
    date: string;
    status: string;
}

interface AttendanceCalendarProps {
    attendance: AttendanceRecord[];
}

export function AttendanceCalendar({ attendance }: AttendanceCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "MMMM yyyy";

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                    {format(currentMonth, dateFormat)}
                </h3>
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 uppercase">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const getStatusForDay = (day: Date) => {
        return attendance.find(record => isSameDay(parseISO(record.date.toString()), day))?.status;
    };

    const renderCells = () => {
        return (
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                {days.map((day, i) => {
                    const status = getStatusForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={i}
                            className={`min-h-[60px] p-2 bg-white flex flex-col items-center justify-between ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : "text-gray-900"
                                }`}
                        >
                            <span className={`text-xs font-medium ${isToday ? "bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center" : ""}`}>
                                {format(day, "d")}
                            </span>
                            {status && (
                                <div className={`flex items-center mt-1`}>
                                    <Circle className={`h-3 w-3 fill-current ${status === 'Present' ? "text-green-500" :
                                        status === 'Absent' ? "text-red-500" :
                                            "text-yellow-500"
                                        }`} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-4 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
            {renderHeader()}
            {renderDays()}
            {renderCells()}

            <div className="mt-4 flex gap-4 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Present</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Absent</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Late</span>
                </div>
            </div>
        </div>
    );
}
