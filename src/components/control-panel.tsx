"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextPanel from "@/components/panels/text-panel";
import AiPanel from "@/components/panels/ai-panel";
import UploadPanel from "@/components/panels/upload-panel";
import IdeasPanel from "@/components/panels/ideas-panel";
import LayersPanel from "@/components/panels/layers-panel";
import { Brush, Sparkles, Upload, Lightbulb, Layers } from "lucide-react";

export default function ControlPanel() {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="text" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5 sticky top-0 bg-background z-10">
          {/* Note: Updated grid-cols-5 since 'Product' tab is commented out */}
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
        </TabsList>
        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="text">
            <TextPanel />
          </TabsContent>
          <TabsContent value="ai">
            <AiPanel />
          </TabsContent>
          <TabsContent value="upload">
            <UploadPanel />
          </TabsContent>
          <TabsContent value="ideas">
            <IdeasPanel />
          </TabsContent>
          <TabsContent value="layers">
            <LayersPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}