"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Moon, Sun, ShoppingCart, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDesign } from "@/contexts/design-context";
import { useToast } from "@/hooks/use-toast";
import { toast as toaster } from "@/hooks/use-toast";
import { addToCart as addToCartFlow } from "@/ai/flows/add-to-cart";
import { toPng } from 'html-to-image';
import Image from "next/image";


const USER_TOKEN_KEY = 'userToken';

export default function Header() {
  const { setTheme } = useTheme();
  const { productOptions, designs, side, setSide } = useDesign();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const getDesignAsImage = async (targetSide: 'front' | 'back') => {
    const designArea = document.getElementById('design-area');
    if (!designArea) return null;

    // Temporarily switch side to render the correct design, then switch back.
    const originalSide = side;
    if (originalSide !== targetSide) {
      await new Promise(resolve => {
        setSide(targetSide);
        // Allow time for state to update and re-render
        setTimeout(resolve, 100); 
      });
    }
    
    const image = await toPng(designArea, { fontEmbedCSS: '@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap\');' });

    // Switch back to the original side
    if (originalSide !== targetSide) {
      await new Promise(resolve => {
        setSide(originalSide);
        setTimeout(resolve, 100);
      });
    }
    
    return image;
  }

  const handleDownload = async () => {
    try {
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
    }
  };

  const handleAddToCart = async () => {
    if (!productOptions.color || !productOptions.size) {
        toast({
            variant: "destructive",
            title: "Missing Options",
            description: "Please select a color and size before adding to cart.",
        });
        return;
    }
    
    const userToken = localStorage.getItem(USER_TOKEN_KEY);
    if (!userToken) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to add items to the cart.",
        });
        return;
    }

    setIsAddingToCart(true);

    try {
        const rawFrontImage = designs.front.length > 0 ? await getDesignAsImage('front') : undefined;
        const frontImage = rawFrontImage ?? undefined;

        const rawBackImage = designs.back.length > 0 ? await getDesignAsImage('back') : undefined;
        const backImage = rawBackImage ?? undefined;

        
        // Generate a unique ID for the custom product to ensure it's treated as a new item
        const customProductId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;


        const result = await addToCartFlow({
            userToken,
            color: productOptions.color,
            size: productOptions.size,
            price: 599, // Default price as requested
            frontImage,
            backImage,
            productId: customProductId,
        });

        console.log("Add to cart result:", result);

        if (result.success) {
            toaster({
                title: "Added to Cart!",
                description: result.message || `T-Shirt (Color: ${productOptions.color}, Size: ${productOptions.size}) has been added.`,
                action: (
                  <Link href="https://clothologyglobal.co.in/cart" target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary">Go to Cart</Button>
                  </Link>
                ),
            });
        } else {
             toast({
                variant: "destructive",
                title: "Failed to Add to Cart",
                description: result.message,
            });
        }
    } catch (error) {
         console.error("Add to cart error:", error);
         toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred while adding to the cart.",
        });
    } finally {
        setIsAddingToCart(false);
    }
  };


  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <a href="https://clothologyglobal.co.in" target="_blank" rel="noopener noreferrer" className="flex items-center">
        <Image
          src="/logoClothMobile.jpg"
          alt="clothologyglobal Logo"
          width={220}
          height={80}
          className="object-contain"
        />
      </a>

      <div className="flex items-center gap-2">
        <Button onClick={handleAddToCart} variant="outline" disabled={isAddingToCart}>
           {isAddingToCart ? (
             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
           ) : (
             <ShoppingCart className="mr-2 h-4 w-4" />
           )}
          {isAddingToCart ? "Adding..." : "Add to Cart"}
        </Button>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Design
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
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
