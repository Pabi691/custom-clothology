// components/tshirt-canvas.tsx

'use client';

import Image from "next/image";
import { useDesign } from "@/contexts/design-context";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";
import { Rnd } from "react-rnd";
import type { TextElement, ImageElement, DesignElement } from "@/lib/types";
import { Checkbox } from './ui/checkbox';
import type { CheckedState } from "@radix-ui/react-checkbox";

interface TShirtCanvasProps {
  isPreviewing: boolean;
  onBackToEditor: () => void;
  // This prop's type is correct as it expects a boolean
  onConfirmChange: (checked: boolean) => void;
  isConfirmed: boolean;
  previewImage: string | null;
  productImages: { front: string; back: string };
  isProcessing: boolean;
  handlePreview: () => void;
  handleAddToCart: () => void;
}

export default function TShirtCanvas({
  isPreviewing,
  onBackToEditor,
  onConfirmChange,
  isConfirmed,
  previewImage,
  productImages,
  isProcessing,
  handlePreview,
  handleAddToCart,
}: TShirtCanvasProps) {
  const { elements, updateElement, selectedElementId, setSelectedElementId, side, toggleSide } = useDesign();

  const designAreaStyle: React.CSSProperties = {
    position: "absolute",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "40%",
    height: "60%",
    overflow: "visible",
    zIndex: 10,
  };

  const borderStyle: React.CSSProperties = {
    position: "absolute",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "40%",
    height: "60%",
    border: "2px dashed hsl(var(--primary) / 0.5)",
    zIndex: 9,
  };

  const renderTShirtBase = (imageUrl: string) =>
    imageUrl ? (
      <div className="absolute inset-0">
        <Image src={imageUrl} alt="T-Shirt Base" fill style={{ objectFit: "contain", zIndex: 0 }} priority />
      </div>
    ) : null;

  const renderDesignElements = () =>
    elements.map((element, index) => {
      const isSelected = selectedElementId === element.id;
      const style: React.CSSProperties = {
        cursor: "grab",
      };

      return (
        <Rnd
          key={element.id}
          size={{ width: element.width, height: element.height }}
          position={{ x: element.x, y: element.y }}
          onDragStart={() => setSelectedElementId(element.id)}
          onDragStop={(e, d) => updateElement(element.id, { x: d.x, y: d.y })}
          onResizeStart={() => setSelectedElementId(element.id)}
          onResizeStop={(e, direction, ref, delta, position) =>
            updateElement(element.id, {
              width: parseInt(ref.style.width, 10),
              height: parseInt(ref.style.height, 10),
              ...position,
            })
          }
          className={`${isSelected ? 'outline-2 outline-dashed outline-primary outline-offset-4 html2canvas-ignore' : ''}`}
          style={{ ...style, zIndex: index + 1 }}
          bounds="parent"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedElementId(element.id);
          }}
        >
          {element.type === "text" && (
            <div className="w-full h-full flex items-center justify-center text-center">
              <span
                contentEditable
                suppressContentEditableWarning
                className="nodrag"
                onBlur={(e) =>
                  updateElement(element.id, { text: e.currentTarget.innerText })
                }
                style={{
                  fontSize: `${(element as TextElement).fontSize || 24}px`,
                  color: (element as TextElement).color || "#000000",
                  fontFamily: (element as TextElement).fontFamily || "Arial",
                }}
              >
                {(element as TextElement).text}
              </span>
            </div>
          )}
          {element.type === "image" && (
            <Image
              src={(element as ImageElement).src}
              alt="Design"
              fill
              className="nodrag"
            />
          )}
        </Rnd>
      );
    });
    
  // New wrapper function to handle the type from the Checkbox
  const handleCheckboxChange = (checked: CheckedState) => {
      // Ensure the checked value is a boolean before passing it up
      if (typeof checked === 'boolean') {
          onConfirmChange(checked);
      }
  };


  return (
    <div className="w-full h-full rounded-lg flex flex-col items-center justify-start p-4 overflow-hidden gap-4">
      {!isPreviewing ? (
        <>
          <div className="relative w-full h-full max-w-[280px] lg:max-w-[500px] max-h-[300px] min-h-[300px] lg:max-h-[500px]">
             {/* Front side (rendered conditionally) */}
            <div
              id="design-area"
              className={`absolute inset-0 transition-opacity duration-300`}
              style={{
                opacity: side === "front" ? 1 : 0,
                pointerEvents: side === "front" ? "auto" : "none",
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {renderTShirtBase(productImages.front)}
              <div id="border" style={borderStyle} className="html2canvas-ignore"></div>
              <div style={designAreaStyle}>{renderDesignElements()}</div>
            </div>

            {/* Back side (rendered conditionally) */}
            <div
              className={`absolute inset-0 transition-opacity duration-300`}
              style={{
                opacity: side === "back" ? 1 : 0,
                pointerEvents: side === "back" ? "auto" : "none",
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {renderTShirtBase(productImages.back)}
              <div style={borderStyle} className="html2canvas-ignore"></div>
              <div style={designAreaStyle}>{renderDesignElements()}</div>
            </div>

            <Button
              variant="outline"
              onClick={toggleSide}
              className="absolute top-2 right-2 z-20 html2canvas-ignore"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
            </Button>
            <Button onClick={handlePreview} 
            className="html2canvas-ignore absolute top-2 left-2 z-20" disabled={isProcessing}>
              {isProcessing ? "Generating..." : "Preview"}
            </Button>
          </div>
          
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <div>
            <h3>{side === "front" ? "Front View" : "Back View"}</h3>
            {previewImage && (
              <Image src={previewImage} alt="Design Preview" width={300} height={400} />
            )}
            <p className="mt-5 text-center">It will be printed like this. Please review your design carefully.</p>
            <ul className="text-sm mt-2">
              <li>- Are the text and images clear and easy to read?</li>
              <li>- Do the design elements fit in the safety area?</li>
              <li>- Does everything look correct?</li>
            </ul>
          </div>
          <div className="flex gap-2 items-center">
            <Checkbox
              id="confirm"
              checked={isConfirmed}
              // Use the new wrapper function
              onCheckedChange={handleCheckboxChange}
            />
            <label htmlFor="confirm" className="html2canvas-ignore text-sm">
              I have authorization to use this design and I approve it for printing.
            </label>
          </div>
          <div className="flex gap-4 items-center">
            <Button onClick={onBackToEditor} variant="outline" className="" disabled={isProcessing}>
              Back to Editor
            </Button>
            <Button onClick={handleAddToCart} disabled={isProcessing || !isConfirmed}>
               {isProcessing ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}