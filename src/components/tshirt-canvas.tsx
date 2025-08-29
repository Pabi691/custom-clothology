'use client';

import Image from "next/image";
import { useDesign } from "@/contexts/design-context";
import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import axios from "axios";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";
import { Rnd } from "react-rnd";
import type { TextElement, ImageElement, DesignElement } from "@/lib/types";
import { useSearchParams } from 'next/navigation';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;

function TextEditor({
  selectedElement,
  onUpdate,
}: {
  selectedElement: DesignElement | null;
  onUpdate: (id: string, updates: Partial<DesignElement>) => void;
}) {
  if (!selectedElement || selectedElement.type !== "text") return null;
  const element = selectedElement as TextElement;

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-100 rounded-lg html2canvas-ignore">
      <h4 className="text-lg font-bold">Edit Text</h4>
      <label className="flex items-center gap-2">
        Font Size:
        <input
          type="number"
          value={element.fontSize || 24}
          onChange={(e) =>
            onUpdate(selectedElement.id, { fontSize: Number(e.target.value) })
          }
          className="w-20 p-1 border rounded"
        />
      </label>
      <label className="flex items-center gap-2">
        Color:
        <input
          type="color"
          value={element.color || "#000000"}
          onChange={(e) =>
            onUpdate(selectedElement.id, { color: e.target.value })
          }
          className="w-10 h-10 border rounded"
        />
      </label>
      <label className="flex flex-col gap-1">
        Font Family:
        <select
          value={element.fontFamily || "Arial"}
          onChange={(e) =>
            onUpdate(selectedElement.id, { fontFamily: e.target.value })
          }
          className="p-2 border rounded"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </label>
    </div>
  );
}

export default function TShirtCanvas() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const price = Number(searchParams.get("price"));
  const productId = searchParams.get("productId");
  const selectedColor = searchParams.get("selectedColor");
  const selectedSize = searchParams.get("selectedSize");

  const [userToken, setUserToken] = useState<string | null>(null);
  const { elements, updateElement, selectedElementId, setSelectedElementId, side, setSide, toggleSide } = useDesign();
  const [productImages, setProductImages] = useState<{ front: string; back: string }>({ front: "", back: "" });
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartImageToGenerate, setCartImageToGenerate] = useState<'front' | 'back' | null>(null);

  const frontCanvasRef = useRef<HTMLDivElement>(null);
  const backCanvasRef = useRef<HTMLDivElement>(null);

  const getCanvasImage = useCallback(async (): Promise<string> => {
    const el = side === "front" ? frontCanvasRef.current : backCanvasRef.current;
    
    if (!el) {
      console.error(`Canvas element for ${side} not found.`);
      return "";
    }

    const images = Array.from(el.getElementsByTagName('img'));
    const promises = images.map(img => {
      return new Promise<void>((resolve, reject) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => reject(`Image failed to load: ${img.src}`);
        }
      });
    });

    try {
      await Promise.all(promises);
      console.log("All images loaded successfully for canvas capture.");
    } catch (err) {
      console.error("Error loading images for capture:", err);
      return "";
    }

    await new Promise((r) => setTimeout(r, 200));

    try {
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
        logging: true,
        ignoreElements: (element) => element.classList.contains("html2canvas-ignore"),
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error capturing canvas:", error);
      return "";
    }
  }, [side]);

  // New useEffect to handle the cart image generation
  useEffect(() => {
    async function generateAndAddToCart() {
      if (cartImageToGenerate) {
        setIsProcessing(true);

        try {
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

          console.log('Data to be sent to API:', data);

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
            alert("Item added to cart!");
          } else {
            alert("Failed to add to cart: " + response.data.message);
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          alert("Error adding to cart.");
        } finally {
          setIsProcessing(false);
          setCartImageToGenerate(null); // Reset the trigger
        }
      }
    }

    generateAndAddToCart();
  }, [cartImageToGenerate, getCanvasImage, productId, selectedSize, price, selectedColor, userToken]);

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
      }
    }
    fetchProduct();
  }, [slug, userToken]);

  if (!slug || !productId || !selectedColor || !selectedSize || !price) {
    return <p>Error: Missing product information. Please access this page from the product page.</p>;
  }

  if (!userToken) {
    return <p>Please log in to customize your product.</p>;
  }

  const handlePreview = async () => {
    setIsProcessing(true);
    console.log("Starting preview capture for side:", side);
    const image = await getCanvasImage();
    setIsProcessing(false);
    if (!image) {
      alert("Failed to generate preview. Please try again.");
      return;
    }
    setPreviewImage(image);
    setIsPreviewing(true);
  };

  const handleAddToCart = async () => {
    if (side !== 'front') {
        setSide('front');
    }
    setCartImageToGenerate('front');
  };

  const designAreaStyle: React.CSSProperties = {
    position: "absolute",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "35%",
    height: "40%",
    border: "2px dashed hsl(var(--primary) / 0.5)",
    overflow: "visible",
    zIndex: 10,
  };

  const renderTShirtBase = (imageUrl: string) =>
    imageUrl ? (
      <div className="absolute inset-0">
        <Image src={imageUrl} alt="T-Shirt Base" fill style={{ objectFit: "cover", zIndex: 0 }} priority />
      </div>
    ) : null;

  const renderDesignElements = () =>
    elements.map((element, index) => {
      const isSelected = selectedElementId === element.id;
      const style: React.CSSProperties = {
        outline: isSelected ? "2px dashed hsl(var(--primary))" : "none",
        outlineOffset: "4px",
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
          style={{ ...style, zIndex: index + 1 }}
          bounds="parent"
          onClick={(e: React.MouseEvent) => { // Fixed TypeScript error
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
              className="nodrag object-contain"
            />
          )}
        </Rnd>
      );
    });

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  return (
    <div className="w-full h-full bg-card rounded-lg flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner gap-4">
      {!isPreviewing ? (
        <>
          <div className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            {/* Front side */}
            <div
              ref={frontCanvasRef}
              className={`absolute inset-0 transition-opacity duration-300`}
              style={{
                opacity: side === "front" ? 1 : 0,
                pointerEvents: side === "front" ? "auto" : "none",
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {renderTShirtBase(productImages.front)}
              <div style={designAreaStyle}>{renderDesignElements()}</div>
            </div>

            {/* Back side */}
            <div
              ref={backCanvasRef}
              className={`absolute inset-0 transition-opacity duration-300`}
              style={{
                opacity: side === "back" ? 1 : 0,
                pointerEvents: side === "back" ? "auto" : "none",
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {renderTShirtBase(productImages.back)}
              <div style={designAreaStyle}>{renderDesignElements()}</div>
            </div>

            <Button
              variant="outline"
              onClick={toggleSide}
              className="absolute top-2 right-2 z-20 html2canvas-ignore"
              disabled={isProcessing}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Rotate
            </Button>
          </div>

          <Button onClick={handlePreview} className="mt-4 html2canvas-ignore" disabled={isProcessing}>
            {isProcessing ? "Generating..." : "Preview"}
          </Button>
          {/* The TextEditor is commented out in your code, keeping it that way */}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <div>
            <h3>{side === "front" ? "Front View" : "Back View"}</h3>
            {previewImage && (
              <Image src={previewImage} alt="Design Preview" width={300} height={400} />
            )}
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setIsPreviewing(false)} variant="outline" disabled={isProcessing}>
              Back to Editor
            </Button>
            <Button onClick={handleAddToCart} disabled={isProcessing}>
              {isProcessing ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}