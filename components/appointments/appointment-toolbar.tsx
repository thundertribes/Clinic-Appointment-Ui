"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

export function AppointmentToolbar() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Appointments</h2>
        <p className="text-muted-foreground">Manage your clinic's appointments and schedules.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/appointments/calendar">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar View
          </Link>
        </Button>
        <Button asChild>
          <Link href="/appointments/add">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>
    </div>
  );
}
