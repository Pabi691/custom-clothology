'use client';

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDesign } from "@/contexts/design-context";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';
import Image from "next/image";

export default function Header() {
  const { setTheme } = useTheme();
  const { side, setSide } = useDesign();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const getDesignAsImage = async (targetSide: 'front' | 'back') => {
    const designArea = document.getElementById('design-area');
    if (!designArea) return null;

    const originalSide = side;
    if (originalSide !== targetSide) {
      await new Promise(resolve => {
        setSide(targetSide);
        setTimeout(resolve, 100);
      });
    }

    const image = await toPng(designArea, {
      fontEmbedCSS: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');",
    });

    if (originalSide !== targetSide) {
      await new Promise(resolve => {
        setSide(originalSide);
        setTimeout(resolve, 100);
      });
    }

    return image;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const image = await getDesignAsImage(side);
      if (image) {
        const link = document.createElement('a');
        link.download = `tshirt-design-${side}.png`;
        link.href = image;
        link.click();

        toast({
          title: "Download Started",
          description: `Your ${side} design is downloading.`,
        });
      } else {
        throw new Error("Could not generate image for download.");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "An error occurred while preparing your design for download.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <a
        href="https://clothologyglobal.co.in"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        <Image
          src="/logoClothMobile.jpg"
          alt="Clothologyglobal Logo"
          width={220}
          height={80}
          className="object-contain"
        />
      </a>

      <div className="flex items-center gap-2">
        <Button onClick={handleDownload} disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download Design"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
