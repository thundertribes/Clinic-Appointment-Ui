"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppointmentView } from "@/types/appointment";

interface AppointmentTabsProps {
  currentView: AppointmentView;
}

export function AppointmentTabs({ currentView }: AppointmentTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("view");
    } else {
      params.set("view", value);
    }

    const queryString = params.toString();
    router.push(`/appointments${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <Tabs value={currentView} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="all">All Appointments</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="today">Today</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
