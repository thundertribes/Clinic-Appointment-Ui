"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
    Pending: "bg-amber-400 text-black",
    Confirmed: "border border-blue-500 text-blue-500 bg-transparent",
    Completed: "bg-green-500 text-white",
    Cancelled: "bg-red-500 text-white",
};

interface StatusDropdownProps {
    value: string;
    onChange: (newStatus: string) => void;
}

export default function StatusDropdown({ value, onChange }: StatusDropdownProps) {
    return (
        <Select.Root value={value} onValueChange={onChange}>
            <Select.Trigger
                className={cn(
                    // match Badge style
                    "inline-flex items-center justify-center rounded-full",
                    "px-2.5 py-0.5 text-xs font-medium",
                    "focus:outline-none focus:ring-0 border-0 shadow-none",
                    "h-[22px] min-w-[90px]", // 👈 same height as Badge
                    statusColors[value] || "bg-gray-200 text-black"
                )}
            >
                <Select.Value />
                <Select.Icon className="ml-1">
                    <ChevronDown className="h-3 w-3" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className="z-50 mt-1 rounded-md bg-white text-black shadow-lg dark:bg-gray-900 dark:text-white"
                    side="bottom"
                    sideOffset={4}
                >
                    <Select.Viewport className="p-1">
                        {["Pending", "Confirmed", "Completed", "Cancelled"].map((status) => (
                            <Select.Item
                                key={status}
                                value={status}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-md px-3 py-1 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-800",
                                    value === status && "bg-amber-600"
                                )}
                            >
                                <Select.ItemText>{status}</Select.ItemText>
                                <Select.ItemIndicator className="absolute right-2">
                                    <Check className="h-4 w-4" />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
