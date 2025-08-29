"use client";

import { useState, useRef, useCallback } from "react";
import { useDesign } from "@/contexts/design-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Camera, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function UploadPanel() {
  const { addElement } = useDesign();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        addElement({ type: "image", src });
        toast({
          title: "Image Uploaded",
          description: "Your image has been added to the design.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
      });
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCameraOpen(false);
  }, [stream]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      addElement({ type: "image", src: dataUrl });
      toast({
        title: "Image Captured!",
        description: "Your snapshot has been added to the design.",
      });
      stopCamera();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Upload Image</h3>
      <p className="text-sm text-muted-foreground">
        Use your own images on the t-shirt.
      </p>
      <div className="space-y-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload from Device
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <Button onClick={startCamera} className="w-full" variant="outline">
          <Camera className="mr-2 h-4 w-4" />
          Use Camera
        </Button>
      </div>

      <Dialog open={isCameraOpen} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Camera</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-md" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
             <Button variant="outline" onClick={stopCamera}>
                Cancel
             </Button>
             <Button onClick={captureImage}>
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
