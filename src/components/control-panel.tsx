"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextPanel from "@/components/panels/text-panel";
import AiPanel from "@/components/panels/ai-panel";
import UploadPanel from "@/components/panels/upload-panel";
import IdeasPanel from "@/components/panels/ideas-panel";
import LayersPanel from "@/components/panels/layers-panel";
import ProductPanel from "@/components/panels/product-panel";
import { Brush, Sparkles, Upload, Lightbulb, Layers, ShoppingBag } from "lucide-react";

export default function ControlPanel() {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="text" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="text">
            <Brush className="w-4 h-4 mr-1" /> Text
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="w-4 h-4 mr-1" /> AI
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-1" /> Upload
          </TabsTrigger>
          <TabsTrigger value="ideas">
            <Lightbulb className="w-4 h-4 mr-1" /> Ideas
          </TabsTrigger>
          <TabsTrigger value="layers">
            <Layers className="w-4 h-4 mr-1" /> Layers
          </TabsTrigger>
          {/* <TabsTrigger value="product">
            <ShoppingBag className="w-4 h-4 mr-1" /> Product
          </TabsTrigger> */}
        </TabsList>
        <div className="flex-1 overflow-y-auto p-1">
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
          {/* <TabsContent value="product" className="mt-4">
            <ProductPanel />
          </TabsContent> */}
        </div>
      </Tabs>
    </div>
  );
}
