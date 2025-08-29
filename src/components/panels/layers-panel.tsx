"use client";

import { useDesign } from "@/contexts/design-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Type,
  Image as ImageIcon,
} from "lucide-react";

export default function LayersPanel() {
  const { elements, setElements, selectedElementId, setSelectedElementId } =
    useDesign();

  const moveElement = (id: string, direction: "up" | "down") => {
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1) return;

    const newElements = [...elements];
    const element = newElements.splice(index, 1)[0];

    if (direction === "up" && index < elements.length -1) {
      newElements.splice(index + 1, 0, element);
    } else if (direction === "down" && index > 0) {
      newElements.splice(index - 1, 0, element);
    } else {
      // If we can't move, put it back
      newElements.splice(index, 0, element);
    }

    setElements(newElements);
  };

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  if (elements.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <p>No layers yet.</p>
        <p className="text-sm">Add some text or an image to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Layers</h3>
      <p className="text-sm text-muted-foreground">
        Manage the order and visibility of your design elements. The topmost item in the list appears in the front.
      </p>
      <div className="space-y-2">
        {[...elements].reverse().map((element, i) => {
          const isSelected = selectedElementId === element.id;
          const index = elements.length - 1 - i;

          return (
            <Card
              key={element.id}
              className={`p-2 transition-all ${
                isSelected ? "border-primary ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedElementId(element.id)}
            >
              <CardContent className="p-0 flex items-center gap-4">
                <div className="flex-shrink-0 w-8 text-center text-muted-foreground">
                  {element.type === "text" ? (
                    <Type className="w-5 h-5 mx-auto" />
                  ) : (
                    <ImageIcon className="w-5 h-5 mx-auto" />
                  )}
                </div>
                <div className="flex-1 truncate text-sm">
                  {element.type === "text"
                    ? element.text
                    : "Image"}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveElement(element.id, "up");
                    }}
                    disabled={index === elements.length - 1}
                    aria-label="Move layer up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveElement(element.id, "down");
                    }}
                    disabled={index === 0}
                     aria-label="Move layer down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                     aria-label="Delete layer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
