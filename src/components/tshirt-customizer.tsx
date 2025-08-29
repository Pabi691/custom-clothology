'use client';

import { useDesign } from "@/contexts/design-context";
import ControlPanel from "@/components/control-panel";
import dynamic from 'next/dynamic';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// ✅ Move this OUTSIDE the component
const TShirtCanvas = dynamic(() => import('@/components/tshirt-canvas'), { ssr: false });

function CustomizerLayout() {
  const { elements, setElements } = useDesign();

  const clearDesign = () => {
    setElements([]);
  };

  const removeLastElement = () => {
    setElements((prev) => prev.slice(0, -1));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] h-full gap-6 p-6">
      <Card className="flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          <ControlPanel />
        </CardContent>
        <div className="p-4 border-t flex gap-2">
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
      </Card>
      <div className="h-full flex items-center justify-center">
        <TShirtCanvas />
      </div>
    </div>
  );
}

export default function TShirtCustomizer() {
  return <CustomizerLayout />;
}
