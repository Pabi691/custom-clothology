'use client';

import Image from "next/image";
import { useDesign } from "@/contexts/design-context";
import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import axios from "axios";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";
import { Rnd } from "react-rnd";
import type { TextElement, ImageElement, DesignElement } from "@/lib/types";
import { useSearchParams } from 'next/navigation';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;

export default function TShirtCanvas() {
  const searchParams = useSearchParams();

  const slug = searchParams.get('slug');
  const price = Number(searchParams.get('price'));
  const productId = searchParams.get('productId');
  const selectedColor = searchParams.get('selectedColor');
  const selectedSize = searchParams.get('selectedSize');
 const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setUserToken(token);
  }, []);

  if (!userToken) {
    return <p>Please log in to customize your product.</p>;
  }
  const { elements, updateElement, selectedElementId, setSelectedElementId, side, toggleSide } = useDesign();
  const [productImages, setProductImages] = useState<{ front: string, back: string }>({
    front: '',
    back: ''
  });
  const [isEditing, setIsEditing] = useState<string | null>(null);

 useEffect(() => {
  if (!slug) return;

  async function fetchProduct() {
    try {
      const { data } = await axios.get(`https://clothologyglobal.co.in/api/v1/products/${slug}`);
      setProductImages({
        front: data.primary_img,
        back: data.secondary_img,
      });
    } catch (err) {
      console.error("Failed to load product", err);
    }
  }

  fetchProduct();
}, [slug]);


  const getCanvasImage = async (): Promise<{ front: string; back: string }> => {
    const capture = async (id: string) => {
      const el = document.getElementById(id);
      if (!el) throw new Error(`Canvas "${id}" not found`);
      const canvas = await html2canvas(el);
      return canvas.toDataURL('image/png');
    };

    return {
      front: await capture('tshirt-front'),
      back: await capture('tshirt-back'),
    };
  };

  const handleAddToCart = async () => {
    try {
      const { front, back } = await getCanvasImage();

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/add_to_cart`, {
        product_id: productId,
        prod_variation_id: selectedSize,
        quantity: 1,
        price: price,
        color: selectedColor,
        size: selectedSize,
        front_image: front,
        back_image: back,
      }, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }
      });

      if (response.data.status) {
        alert('Item added to cart!');
        window.location.href = 'https://clothologyglobal.co.in/cart';
      } else {
        alert('Failed to add to cart: ' + response.data.message);
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart.');
    }
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

  const renderDesignArea = (id: string) => (
    <div id={id} className="absolute inset-0">
      <Image
        src={side === 'front' ? productImages.front : productImages.back}
        alt="T-Shirt"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  );

  if (!slug || !productId || !selectedColor || !selectedSize || !price) {
  return <p>Error: Missing product information. Please access this page from the product page.</p>;
}


  return (
    <div className="w-full h-full bg-card rounded-lg flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner gap-4">
      <div
        className="relative"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        onClick={() => setSelectedElementId(null)}
      >
        {side === 'front' ? renderDesignArea('tshirt-front') : renderDesignArea('tshirt-back')}

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
                style={{ ...style, zIndex: index + 1 }}
                bounds="parent"
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  setSelectedElementId(element.id);
                }}
                cancel=".nodrag"
              >
                {element.type === 'text' && (
                  <div className="nodrag w-full h-full flex items-center justify-center text-center">
                    <span>{(element as TextElement).text}</span>
                  </div>
                )}

                {element.type === 'image' && (
                  <Image
                    src={(element as ImageElement).src}
                    alt="Design"
                    fill
                    className="nodrag object-contain"
                  />
                )}

              </Rnd>
            );
          })}
        </div>
      </div>

      <Button onClick={handleAddToCart} className="mt-4">
        Add to Cart
      </Button>
    </div>
  );
}
