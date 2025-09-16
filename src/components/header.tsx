// components/header.tsx

"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Moon, Sun, ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDesign } from "@/contexts/design-context";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface HeaderProps {
  onPreviewClick: () => void;
  onAddToCartClick: () => void;
  isProcessing: boolean;
  isLoggedIn: boolean;
}

export default function Header({ onPreviewClick, onAddToCartClick, isProcessing, isLoggedIn }: HeaderProps) {
  const { setTheme } = useTheme();
  const { side, setSide } = useDesign();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  // You can still keep the download functionality here if you want a separate download button
  const handleDownload = async () => {
    // ... (Your existing download logic here)
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
          src="/logo.png"
          alt="Clothologyglobal Logo"
          width={220}
          height={80}
          className="object-contain"
        />
      </a>

      <div className="flex items-center gap-2">
        {/* <Button 
          onClick={onPreviewClick} 
          variant="outline" 
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Preview"}
        </Button>
        <Button 
          onClick={onAddToCartClick} 
          disabled={isProcessing || !isLoggedIn}
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> 
          {isProcessing ? "Adding..." : "Add to Cart"}
        </Button>
        <Button 
          onClick={handleDownload} 
          disabled={isDownloading}
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download Design"}
        </Button> */}

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