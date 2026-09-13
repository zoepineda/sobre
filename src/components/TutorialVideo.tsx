"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// "Watch" button next to the Tour: plays the rendered Sobre tutorial.
// The video element mounts only while the dialog is open, so the 2 MB
// file is never fetched until someone asks for it.
export default function TutorialVideo() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
        >
          <i className="lni lni-play" aria-hidden /> Watch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sobre in one minute</DialogTitle>
        </DialogHeader>
        {open && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src="/tutorial.mp4"
            controls
            autoPlay
            playsInline
            className="w-full rounded-lg bg-pine"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
