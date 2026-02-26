"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRightLeft, Loader2, MoreHorizontal } from "lucide-react";
import type { Appointment, AppointmentView } from "@/types/appointment";
import { getStatusBadgeStyles, formatStatus, formatType } from "@/types/appointment";

interface AppointmentRowProps {
  appointment: Appointment;
  view: AppointmentView;
}

export function AppointmentRow({ appointment, view }: AppointmentRowProps) {
  const router = useRouter();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const startDate = new Date(appointment.start);

  const formattedDate = format(startDate, "yyyy-MM-dd");
  const formattedTime = format(startDate, "hh:mm a");

  const badgeStyles = getStatusBadgeStyles(appointment.status);

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });

      if (response.ok) {
        setCancelDialogOpen(false);
        setCancelReason("");
        router.refresh();
      } else {
        const result = await response.json();
        console.error("Failed to cancel appointment:", result.message);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (response.ok) {
        setStatusDialogOpen(false);
        setSelectedStatus("");
        router.refresh();
      } else {
        const result = await response.json();
        console.error("Failed to update appointment:", result.message);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      <TableRow>
        {/* Patient */}
        <TableCell>
          <Link href={`/appointments/${appointment.id}`} className="flex items-center gap-3 hover:underline">
            <Avatar>
              <AvatarFallback>{appointment.patient.firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{appointment.patient.firstName} {appointment.patient.lastName}</p>
              <p className="text-sm text-muted-foreground md:hidden">
                {appointment.doctor.name}
              </p>
            </div>
          </Link>
        </TableCell>

        {/* Doctor */}
        <TableCell className="table-cell">{appointment.doctor.name}</TableCell>

        {/* Date & Time */}
        <TableCell>
          <div>
            {view !== "today" && <p>{formattedDate}</p>}
            <p className={`text-sm ${view === "today" ? "" : "text-muted-foreground"}`}>
              {formattedTime}
            </p>
          </div>
        </TableCell>

        {/* Status */}
        <TableCell>
          <Badge variant={badgeStyles.variant} className={badgeStyles.className}>
            {formatStatus(appointment.status)}
          </Badge>
        </TableCell>

        {/* Type */}
        <TableCell className="table-cell">{formatType(appointment.type)}</TableCell>

        {/* Duration */}
        <TableCell className="table-cell">{appointment.durationMinutes} min</TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/appointments/${appointment.id}`}>View details</Link>
              </DropdownMenuItem>

              {appointment.status !== "COMPLETED" && appointment.status !== "CANCELLED" && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/appointments/${appointment.id}/edit`}>Edit appointment</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/appointments/${appointment.id}/reschedule`}>Reschedule</Link>
                  </DropdownMenuItem>
                </>
              )}

              {(appointment.status === "BOOKED" || appointment.status === "IN_PROGRESS") && (
                <DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Change status
                </DropdownMenuItem>
              )}

              {appointment.status === "COMPLETED" && (
                <>
                  {/* <DropdownMenuItem>View medical record</DropdownMenuItem>
                  <DropdownMenuItem>Create follow-up</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Generate invoice</DropdownMenuItem> */}
                </>
              )}

              {appointment.status === "CANCELLED" && (
                <DropdownMenuItem asChild>
                  <Link href={`/appointments/${appointment.id}/reschedule`}>
                    Reschedule appointment
                  </Link>
                </DropdownMenuItem>
              )}

              {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setCancelDialogOpen(true)}
                    className="text-red-600"
                  >
                    Cancel appointment
                  </DropdownMenuItem>
                </>
              )}

              {appointment.status === "CANCELLED" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Delete permanently</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) setCancelReason("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
              Please provide a reason for cancellation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="cancel-reason">Reason for cancellation *</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Enter the reason for cancelling this appointment..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={isCancelling}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelReason("");
              }}
              disabled={isCancelling}
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isCancelling || !cancelReason.trim()}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          setStatusDialogOpen(open);
          if (!open) setSelectedStatus("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Appointment Status</DialogTitle>
            <DialogDescription>
              Select the new status for this appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="COMPLETED" id="status-completed" />
                <Label htmlFor="status-completed" className="flex-1 cursor-pointer">
                  <span className="font-medium">Completed</span>
                  <p className="text-sm text-muted-foreground">Mark this appointment as completed.</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3 mt-2">
                <RadioGroupItem value="NO_SHOW" id="status-no-show" />
                <Label htmlFor="status-no-show" className="flex-1 cursor-pointer">
                  <span className="font-medium">No Show</span>
                  <p className="text-sm text-muted-foreground">Patient did not show up for the appointment.</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialogOpen(false);
                setSelectedStatus("");
              }}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdatingStatus || !selectedStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
