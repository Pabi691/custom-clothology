"use client";

import Image from "next/image";
import { useDesign } from "@/contexts/design-context";
import type { TextElement, ImageElement, DesignElement } from "@/lib/types";
import { Rnd } from "react-rnd";
import { useState } from "react";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;

const TSHIRT_IMAGES = {
  front: 'https://kyletest.in/image/tshirt-front.png',
  back: 'https://kyletest.in/image/tshirt-back.png',
}

export default function TShirtCanvas() {
  const { elements, updateElement, selectedElementId, setSelectedElementId, side, toggleSide } = useDesign();
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const handleDoubleClick = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element?.type === 'text') {
      setIsEditing(id);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    updateElement(id, { text: e.target.value } as Partial<TextElement>);
  };

  const handleBlur = () => {
    setIsEditing(null);
  };


  const renderElement = (element: DesignElement) => {
    if (element.type === "text") {
      const textStyle: React.CSSProperties = {
        fontFamily: element.fontFamily,
        fontSize: `${element.fontSize}px`,
        color: element.color,
        whiteSpace: "nowrap",
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        padding: 0,
        margin: 0,
      };

      return (
        isEditing === element.id ? (
          <input
            type="text"
            value={element.text}
            onChange={(e) => handleTextChange(e, element.id)}
            onBlur={handleBlur}
            autoFocus
            style={textStyle}
            className="nodrag" // Prevents Rnd from dragging while editing
          />
        ) : (
          <div
            style={textStyle}
            onDoubleClick={() => handleDoubleClick(element.id)}
          >
            {element.text}
          </div>
        )
      );
    }

    if (element.type === "image") {
      return (
        <Image
          src={element.src}
          alt="Custom design element"
          fill
          style={{objectFit: "contain"}}
          className="pointer-events-none"
        />
      );
    }

    return null;
  };

  const designAreaStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '35%',
    height: '40%',
    border: '2px dashed hsl(var(--primary) / 0.5)',
    overflow: 'hidden',
  };

  return (
    <div className="w-full h-full bg-card rounded-lg flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner gap-4">
      <div 
        className="relative"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        onClick={(e) => {
            // Deselect element if clicking on the canvas background
            if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'tshirt-image-container') {
                setSelectedElementId(null);
            }
        }}
        >
        <div id="tshirt-image-container" className="absolute inset-0">
            <Image
            src={TSHIRT_IMAGES[side]}
            data-ai-hint="white t-shirt"
            alt="White T-Shirt"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{objectFit: "contain"}}
            priority
            key={side} // Re-render image on side change
            />
        </div>
        
        <Button variant="outline" onClick={toggleSide} className="absolute top-2 right-2 z-20">
          <RotateCcw className="mr-2 h-4 w-4" />
          Rotate
        </Button>

        <div id="design-area" style={designAreaStyle}>
          {elements.map((element, index) => {
            const isSelected = selectedElementId === element.id;
            const style: React.CSSProperties = {
              outline: isSelected ? "2px dashed hsl(var(--primary))" : "none",
              outlineOffset: '4px',
              cursor: 'grab'
            };

            return (
              <Rnd
                key={element.id}
                size={{ width: element.width, height: element.height }}
                position={{ x: element.x, y: element.y }}
                onDragStart={() => setSelectedElementId(element.id)}
                onDragStop={(e, d) => {
                  updateElement(element.id, { x: d.x, y: d.y });
                }}
                onResizeStart={() => setSelectedElementId(element.id)}
                onResizeStop={(e, direction, ref, delta, position) => {
                  updateElement(element.id, {
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                    ...position,
                  });
                }}
                style={{...style, zIndex: index + 1}}
                bounds="parent"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent deselecting when clicking an element
                  setSelectedElementId(element.id)
                }}
                className={isEditing === element.id ? 'z-50' : ''}
                cancel=".nodrag"
              >
                {renderElement(element)}
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
}
