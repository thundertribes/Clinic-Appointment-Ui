"use client";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { DaySchedule } from "@/types/schedule";
import type { ClinicException } from "@/types/exceptions";
import { format } from "date-fns";

// Type for clinic break
interface ClinicBreak {
  id: string;
  clinicId: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  reason: string;
}

// Day mapping for the UI
const DAYS = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 7, name: "Sunday" },
];

export default function WorkingHoursPage() {
  const { toast } = useToast();

  // Schedule state
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [originalSchedule, setOriginalSchedule] = useState<DaySchedule[]>([]); // Track original data
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Track if user made changes

  // Exceptions state
  const [exceptions, setExceptions] = useState<ClinicException[]>([]);
  const [isLoadingExceptions, setIsLoadingExceptions] = useState(true);

  // Breaks state
  const [breaks, setBreaks] = useState<ClinicBreak[]>([]);
  const [isLoadingBreaks, setIsLoadingBreaks] = useState(true);

  // UI state for new exception forms
  const [newSpecialHour, setNewSpecialHour] = useState({
    date: new Date(),
    startTime: "10:00",
    endTime: "16:00",
    reason: "",
  });
  const [newHoliday, setNewHoliday] = useState({
    date: new Date(),
    reason: "",
  });

  // Fetch schedule, exceptions, and breaks on mount
  useEffect(() => {
    fetchSchedule();
    fetchExceptions();
    fetchBreaks();
  }, []);

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/clinic/schedule");
      const data = await response.json();

      if (data.success && data.data) {
        setSchedule(data.data);
        setOriginalSchedule(data.data); // Store original for comparison
        setIsDirty(false); // Reset dirty state
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch schedule",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast({
        title: "Error",
        description: "Failed to fetch schedule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Track changes - compare current schedule with original
  useEffect(() => {
    if (originalSchedule.length === 0) return; // Skip on initial load

    const hasChanges = JSON.stringify(schedule) !== JSON.stringify(originalSchedule);
    setIsDirty(hasChanges);
  }, [schedule, originalSchedule]);

  // Helper to get schedule for a specific day
  const getDaySchedule = (dayOfWeek: number) => {
    return schedule.find((s) => s.dayOfWeek === dayOfWeek);
  };

  // Helper to check if day is enabled
  const isDayEnabled = (dayOfWeek: number) => {
    return schedule.some((s) => s.dayOfWeek === dayOfWeek);
  };

  // Toggle day enabled/disabled
  const toggleDay = (dayOfWeek: number, enabled: boolean) => {
    if (enabled) {
      // Add day with default times
      const newDay: DaySchedule = {
        dayOfWeek,
        dayName: DAYS.find((d) => d.id === dayOfWeek)?.name || "",
        startTime: "09:00",
        endTime: "18:00",
      };
      setSchedule([...schedule, newDay]);
    } else {
      // Remove day
      setSchedule(schedule.filter((s) => s.dayOfWeek !== dayOfWeek));
    }
  };

  // Update day times
  const updateDayTime = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    setSchedule(schedule.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s)));
  };

  // Save schedule
  const handleSaveSchedule = async () => {
    try {
      setIsSaving(true);

      // Format: Backend expects array directly, not wrapped
      const scheduleData = schedule.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }));

      //console.log("Sending schedule data:", scheduleData);

      const response = await fetch("/api/clinic/schedule", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData), // Send array directly
      });

      const data = await response.json();
      //console.log("Save response:", data);

      if (data.success) {
        toast({
          title: "Success",
          description: "Schedule updated successfully",
        });
        // Refresh schedule
        fetchSchedule();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update schedule",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== BREAKS ====================

  // Fetch breaks
  const fetchBreaks = async () => {
    try {
      setIsLoadingBreaks(true);
      const response = await fetch("/api/clinic/breaks");
      const data = await response.json();

      if (data.success && data.data) {
        setBreaks(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch breaks",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching breaks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch breaks",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBreaks(false);
    }
  };

  // Group breaks by reason (e.g., "Lunch Break", "Coffee Break")
  const groupedBreaks = breaks.reduce(
    (acc, breakItem) => {
      const key = breakItem.reason;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(breakItem);
      return acc;
    },
    {} as Record<string, ClinicBreak[]>,
  );

  // ==================== EXCEPTIONS (HOLIDAYS & SPECIAL HOURS) ====================

  // Fetch exceptions
  const fetchExceptions = async () => {
    try {
      setIsLoadingExceptions(true);
      const response = await fetch("/api/clinic/exceptions");
      const data = await response.json();

      if (data.success && data.data) {
        setExceptions(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch exceptions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching exceptions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch exceptions",
        variant: "destructive",
      });
    } finally {
      setIsLoadingExceptions(false);
    }
  };

  // Get special hours (isClosed = false)
  const specialHours = exceptions.filter((e) => !e.isClosed);

  // Get holidays (isClosed = true)
  const holidays = exceptions.filter((e) => e.isClosed);

  // Add special hour
  const handleAddSpecialHour = async () => {
    if (!newSpecialHour.reason.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reason for special hours",
        variant: "destructive",
      });
      return;
    }

    try {
      const exceptionData = {
        date: format(newSpecialHour.date, "yyyy-MM-dd"),
        isClosed: false,
        startTime: newSpecialHour.startTime,
        endTime: newSpecialHour.endTime,
        reason: newSpecialHour.reason,
      };

      const response = await fetch("/api/clinic/exceptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exceptionData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Special hours added successfully",
        });
        // Reset form and refresh
        setNewSpecialHour({
          date: new Date(),
          startTime: "10:00",
          endTime: "16:00",
          reason: "",
        });
        fetchExceptions();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add special hours",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding special hour:", error);
      toast({
        title: "Error",
        description: "Failed to add special hours",
        variant: "destructive",
      });
    }
  };

  // Add holiday
  const handleAddHoliday = async () => {
    if (!newHoliday.reason.trim()) {
      toast({
        title: "Error",
        description: "Please enter a holiday name",
        variant: "destructive",
      });
      return;
    }

    try {
      const exceptionData = {
        date: format(newHoliday.date, "yyyy-MM-dd"),
        isClosed: true,
        reason: newHoliday.reason,
      };

      const response = await fetch("/api/clinic/exceptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exceptionData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Holiday added successfully",
        });
        // Reset form and refresh
        setNewHoliday({
          date: new Date(),
          reason: "",
        });
        fetchExceptions();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add holiday",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding holiday:", error);
      toast({
        title: "Error",
        description: "Failed to add holiday",
        variant: "destructive",
      });
    }
  };

  // Delete exception
  const handleDeleteException = async (id: string) => {
    try {
      const response = await fetch(`/api/clinic/exceptions/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Exception removed successfully",
        });
        fetchExceptions();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete exception",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting exception:", error);
      toast({
        title: "Error",
        description: "Failed to delete exception",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center space-x-2">
          <Link href="/settings">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Working Hours</h1>
        </div>

        {/* Full Page Cancel and Save button */}
        {/* <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => fetchSchedule()}
            disabled={isLoading || !isDirty}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSchedule}
            disabled={isSaving || isLoading || !isDirty}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div> */}
      </div>

      <div className="md:grid max-md:space-y-6 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clinic Hours</CardTitle>
            <CardDescription>Set your clinic's regular operating hours for each day of the week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading schedule...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {DAYS.map((day) => {
                  const daySchedule = getDaySchedule(day.id);
                  const isEnabled = isDayEnabled(day.id);

                  return (
                    <div key={day.id} className="flex items-center justify-between flex-wrap gap-3 space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`day-${day.id}`} checked={isEnabled} onCheckedChange={(checked) => toggleDay(day.id, checked as boolean)} />
                        <Label htmlFor={`day-${day.id}`} className="w-24">
                          {day.name}
                        </Label>
                      </div>
                      <div className="flex flex-1 items-center space-x-2">
                        <Select value={daySchedule?.startTime || "09:00"} onValueChange={(value) => updateDayTime(day.id, "startTime", value)} disabled={!isEnabled}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 13 }, (_, i) => i + 6).map((hour) => (
                              <SelectItem key={`${hour}:00`} value={`${hour.toString().padStart(2, "0")}:00`}>
                                {`${hour}:00 ${hour < 12 ? "AM" : "PM"}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">to</span>
                        <Select value={daySchedule?.endTime || "18:00"} onValueChange={(value) => updateDayTime(day.id, "endTime", value)} disabled={!isEnabled}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 13 }, (_, i) => i + 10).map((hour) => (
                              <SelectItem key={`${hour}:00`} value={`${hour.toString().padStart(2, "0")}:00`}>
                                {`${hour > 12 ? hour - 12 : hour}:00 ${hour < 12 ? "AM" : "PM"}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* <div className="flex items-center space-x-2">
                <Switch id="24-hour" />
                <Label htmlFor="24-hour">Use 24-hour format</Label>
              </div> */}
              <Button variant="outline" size="sm" onClick={() => setSchedule(originalSchedule)}>
                Reset to Default
              </Button>

              <Button onClick={handleSaveSchedule} disabled={isSaving || isLoading || !isDirty}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Break Timings */}
          <Card>
            <CardHeader>
              <CardTitle>Break Times</CardTitle>
              <CardDescription>Daily break times configured for your clinic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingBreaks ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-muted-foreground">Loading breaks...</p>
                </div>
              ) : Object.keys(groupedBreaks).length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-muted-foreground">No break times configured</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedBreaks).map(([reason, breakItems]) => (
                    <div key={reason} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">{reason}</Label>
                        <span className="text-xs text-muted-foreground">
                          {breakItems[0].startTime} - {breakItems[0].endTime}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {breakItems
                          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                          .map((breakItem) => (
                            <div key={breakItem.id} className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-md text-sm">
                              <span>{breakItem.dayName}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 ml-1"
                                onClick={() => {
                                  // Delete functionality placeholder for future implementation
                                  //console.log("Delete break:", breakItem.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <Button variant="outline" size="sm" disabled>
                <Plus className="mr-2 h-4 w-4" />
                Add Break Time
              </Button>
            </CardContent>
          </Card>

          {/* SpecialHours and Holidays */}
          <Card>
            <CardHeader>
              <CardTitle>Special Hours & Holidays</CardTitle>
              <CardDescription>Set special operating hours or mark holidays</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="special">
                <TabsList>
                  <TabsTrigger value="special">Special Hours</TabsTrigger>
                  <TabsTrigger value="holidays">Holidays</TabsTrigger>
                </TabsList>

                {/* SPECIAL HOURS TAB */}
                <TabsContent value="special" className="space-y-4 pt-4">
                  {isLoadingExceptions ? (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                  ) : (
                    <>
                      {/* Existing Special Hours */}
                      {specialHours.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {specialHours.map((sh) => (
                            <div key={sh.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <p className="font-medium">{format(new Date(sh.date), "MMM dd, yyyy")}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">
                                    {sh.startTime} - {sh.endTime}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">{sh.reason}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteException(sh.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New Special Hour Form */}
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-3">Add New Special Hours</p>
                        <div className="flex items-end flex-wrap gap-3">
                          <div className="flex-1 min-w-[150px]">
                            <Label htmlFor="new-special-date">Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <span>{format(newSpecialHour.date, "MMM dd, yyyy")}</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={newSpecialHour.date} onSelect={(date) => date && setNewSpecialHour({ ...newSpecialHour, date })} />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="flex-1 min-w-[100px]">
                            <Label htmlFor="new-special-start">Start Time</Label>
                            <Input type="time" id="new-special-start" value={newSpecialHour.startTime} onChange={(e) => setNewSpecialHour({ ...newSpecialHour, startTime: e.target.value })} />
                          </div>
                          <div className="flex-1 min-w-[100px]">
                            <Label htmlFor="new-special-end">End Time</Label>
                            <Input type="time" id="new-special-end" value={newSpecialHour.endTime} onChange={(e) => setNewSpecialHour({ ...newSpecialHour, endTime: e.target.value })} />
                          </div>
                          <div className="flex-1 min-w-[150px]">
                            <Label htmlFor="new-special-reason">Reason</Label>
                            <Input type="text" id="new-special-reason" placeholder="e.g. Early Closing" value={newSpecialHour.reason} onChange={(e) => setNewSpecialHour({ ...newSpecialHour, reason: e.target.value })} />
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3" onClick={handleAddSpecialHour}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Special Hours
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* HOLIDAYS TAB */}
                <TabsContent value="holidays" className="space-y-4 pt-4">
                  {isLoadingExceptions ? (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                  ) : (
                    <>
                      {/* Existing Holidays */}
                      {holidays.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {holidays.map((holiday) => (
                            <div key={holiday.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="font-medium">{format(new Date(holiday.date), "MMM dd, yyyy")}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">{holiday.reason}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteException(holiday.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New Holiday Form */}
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-3">Add New Holiday</p>
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <Label htmlFor="new-holiday-date">Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <span>{format(newHoliday.date, "MMM dd, yyyy")}</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={newHoliday.date} onSelect={(date) => date && setNewHoliday({ ...newHoliday, date })} />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="new-holiday-name">Holiday Name</Label>
                            <Input type="text" id="new-holiday-name" placeholder="e.g. Christmas Day" value={newHoliday.reason} onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })} />
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3" onClick={handleAddHoliday}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Holiday
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment Slots  */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Appointment Slots</CardTitle>
          <CardDescription>Configure default appointment duration and scheduling rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="default-duration">Default Appointment Duration</Label>
              <Select defaultValue="30">
                <SelectTrigger id="default-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer-time">Buffer Time Between Appointments</Label>
              <Select defaultValue="5">
                <SelectTrigger id="buffer-time">
                  <SelectValue placeholder="Select buffer time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance-booking">Maximum Advance Booking</Label>
              <Select defaultValue="60">
                <SelectTrigger id="advance-booking">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scheduling Rules</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Switch id="allow-same-day" defaultChecked />
                <Label htmlFor="allow-same-day">Allow same-day appointments</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="allow-concurrent" />
                <Label htmlFor="allow-concurrent">Allow concurrent appointments</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="require-approval" defaultChecked />
                <Label htmlFor="require-approval">Require approval for new patients</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="allow-reschedule" defaultChecked />
                <Label htmlFor="allow-reschedule">Allow patient rescheduling</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
