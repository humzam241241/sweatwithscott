"use client"

import { ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import BookableSchedule from "@/components/bookable-schedule"

interface BookingDialogProps {
  trigger: ReactNode
}

export default function BookingDialog({ trigger }: BookingDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance Booking</DialogTitle>
        </DialogHeader>
        <BookableSchedule userMode />
      </DialogContent>
    </Dialog>
  )
}
