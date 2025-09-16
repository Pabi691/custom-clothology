// components/customizer-layout.tsx

'use client';

import * as React from 'react';
import { useState, useCallback, useEffect } from "react";
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useDesign } from "@/contexts/design-context";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader, 
  SheetTitle, 
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { toPng } from 'html-to-image';
import { Brush, Sparkles, Upload, Lightbulb, Layers } from "lucide-react";
import Header from "@/components/header";

// Dynamically import components to prevent SSR issues
const TShirtCanvas = dynamic(() => import('@/components/tshirt-canvas'), { ssr: false });
const ControlPanel = dynamic(() => import('@/components/control-panel'), { ssr: false });
const TextPanel = dynamic(() => import('@/components/panels/text-panel'), { ssr: false });
const AiPanel = dynamic(() => import('@/components/panels/ai-panel'), { ssr: false });
const UploadPanel = dynamic(() => import('@/components/panels/upload-panel'), { ssr: false });
const IdeasPanel = dynamic(() => import('@/components/panels/ideas-panel'), { ssr: false });
const LayersPanel = dynamic(() => import('@/components/panels/layers-panel'), { ssr: false });

export default function CustomizerLayout() {
  const { elements, setElements, side, setSide, toggleSide } = useDesign();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<{ front: string; back: string }>({ front: "", back: "" });

  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const price = Number(searchParams.get("price"));
  const selectedColor = searchParams.get("selectedColor");
  const selectedSize = searchParams.get("selectedSize");
  const slug = searchParams.get("slug");

  // --- State Management and Data Fetching ---
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    setUserToken(token);
  }, []);

  useEffect(() => {
    if (!slug || !userToken) return;
    async function fetchProduct() {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/get_slug_data/${slug}`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        setProductImages({
          front: data.product_details.primary_img,
          back: data.product_details.secondary_img,
        });
      } catch (err) {
        console.error("Failed to load product", err);
        toast({
          variant: "destructive",
          title: "Product Not Found",
          description: "Could not fetch product details. Please try again.",
        });
      }
    }
    fetchProduct();
  }, [slug, userToken, toast]);

  const clearDesign = () => setElements([]);
  const removeLastElement = () => setElements((prev) => prev.slice(0, -1));

  const handleTabClick = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const closePanel = () => {
    setActiveTab(null);
  };
  
  // --- Core Image Generation Logic ---
  const getDesignAsImage = async (targetSide: 'front' | 'back'): Promise<string | null> => {
      const designArea = document.getElementById('design-area');
      const border = document.getElementById('border');
      if (!designArea) return null;

      // Temporarily switch to the target side to capture the correct canvas
      const originalSide = side;
      if (originalSide !== targetSide) {
          await new Promise(resolve => {
              setSide(targetSide);
              setTimeout(resolve, 100); // Small delay to allow the state change to render
          });
      }

      let image = null;
      border?.style.setProperty('border', 'none', 'important');
      try {
        image = await toPng(designArea, {
            fontEmbedCSS: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');",
        });
      } catch (error) {
        console.error(`Error capturing ${targetSide} design:`, error);
        image = null;
      } finally {
        // Always switch back to the original side
        if (originalSide !== targetSide) {
            await new Promise(resolve => {
                setSide(originalSide);
                setTimeout(resolve, 100);
            });
        }
      }
      return image;
  };

  // --- User Action Handlers ---
  const handlePreview = useCallback(async () => {
    setIsProcessing(true);
    try {
      const image = await getDesignAsImage(side);
      if (image) {
        setPreviewImage(image);
        setIsPreviewing(true);
      } else {
        throw new Error("Failed to generate preview image.");
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        variant: "destructive",
        title: "Preview Failed",
        description: "An error occurred while generating the design preview.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [getDesignAsImage, side, toast]);

  const handleAddToCart = async () => {
    if (!userToken) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
      });
      return;
    }

    if (!isConfirmed) {
      toast({
        variant: "destructive",
        title: "Consent Required",
        description: "Please confirm your design for printing.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const frontImage = await getDesignAsImage('front');
      const backImage = await getDesignAsImage('back');

      if (!previewImage) {
        throw new Error("Failed to capture design images.");
      }

      const data = {
        product_id: productId,
        prod_variation_id: selectedSize,
        quantity: 1,
        price,
        color: selectedColor,
        size: selectedSize,
        front_image: previewImage,
        back_image: previewImage,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/add_to_cart`,
        data,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.status) {
        toast({
          title: "Added to Cart!",
          description: "Your customized product has been added to the cart.",
        });
        setIsPreviewing(false);
        setTimeout(() => {
          window.location.href = "https://clothologyglobal.co.in/cart";
        }, 2000);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast({
        variant: "destructive",
        title: "Failed to Add to Cart",
        description: "An error occurred while adding your design to the cart.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Header 
        onPreviewClick={handlePreview}
        onAddToCartClick={handleAddToCart}
        isProcessing={isProcessing}
        isLoggedIn={!!userToken}
      />
      
      <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Main T-Shirt Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <TShirtCanvas
            isPreviewing={isPreviewing}
            isConfirmed={isConfirmed}
            onBackToEditor={() => setIsPreviewing(false)}
            // FIX 1: Correctly handle the boolean value from the Checkbox
            onConfirmChange={(checked) => setIsConfirmed(Boolean(checked))}
            previewImage={previewImage}
            productImages={productImages}
            // FIX 2: Pass the missing props to the TShirtCanvas component
            isProcessing={isProcessing}
            handlePreview={handlePreview}
            handleAddToCart={handleAddToCart}
          />
        </div>

        {/* Collapsible Control Panel (Sheet) */}
        <Sheet open={!!activeTab} onOpenChange={closePanel}>
          <SheetContent side="bottom" className="max-w-7xl px-10 m-auto flex flex-col h-[60vh] md:h-[70vh] transition-all duration-300">
            <SheetHeader>
              <SheetTitle className="sr-only">Customize Your T-Shirt</SheetTitle> {/* Use sr-only class to hide the title visually */}
            </SheetHeader>
            <div className="p-4 border-b flex justify-between items-center bg-card">
              <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
              <Button variant="ghost" size="icon" onClick={closePanel}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* This is a simple implementation. In a real app, you might use a Switch statement
                  or a more advanced component to render the correct panel based on activeTab. */}
              <Tabs defaultValue={activeTab || "text"}>
                  <TabsContent value="text" className="mt-4">
                      <TextPanel />
                  </TabsContent>
                  <TabsContent value="ai" className="mt-4">
                      <AiPanel />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-4">
                      <UploadPanel />
                  </TabsContent>
                  <TabsContent value="ideas" className="mt-4">
                      <IdeasPanel />
                  </TabsContent>
                  <TabsContent value="layers" className="mt-4">
                      <LayersPanel />
                  </TabsContent>
              </Tabs>
            </div>
            <div className="p-4 border-t flex gap-2 bg-card">
              <Button
                variant="outline"
                onClick={removeLastElement}
                className="flex-1"
                disabled={elements.length === 0}
              >
                Remove Last
              </Button>
              <Button
                variant="destructive"
                onClick={clearDesign}
                className="flex-1"
                disabled={elements.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Fixed Bottom Button Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-2 border-t bg-card flex flex-wrap justify-around sm:justify-center gap-2 z-50">
          <Button onClick={() => handleTabClick('text')} variant={activeTab === 'text' ? 'secondary' : 'ghost'} className="flex-1 sm:flex-none sm:w-28">
            <Brush className="h-4 w-4 mr-1" /> Text
          </Button>
          <Button onClick={() => handleTabClick('ai')} variant={activeTab === 'ai' ? 'secondary' : 'ghost'} className="flex-1 sm:flex-none sm:w-28">
            <Sparkles className="h-4 w-4 mr-1" /> AI
          </Button>
          <Button onClick={() => handleTabClick('upload')} variant={activeTab === 'upload' ? 'secondary' : 'ghost'} className="flex-1 sm:flex-none sm:w-28">
            <Upload className="h-4 w-4 mr-1" /> Upload
          </Button>
          <Button onClick={() => handleTabClick('ideas')} variant={activeTab === 'ideas' ? 'secondary' : 'ghost'} className="flex-1 sm:flex-none sm:w-28">
            <Lightbulb className="h-4 w-4 mr-1" /> Ideas
          </Button>
          <Button onClick={() => handleTabClick('layers')} variant={activeTab === 'layers' ? 'secondary' : 'ghost'} className="flex-1 sm:flex-none sm:w-28">
            <Layers className="h-4 w-4 mr-1" /> Layers
          </Button>
        </div>
      </div>
    </>
  );
}