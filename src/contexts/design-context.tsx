"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import type { DesignElement, TextElementData, ImageElementData } from "@/lib/types";

type ShirtSide = 'front' | 'back';

interface ProductOptions {
    color: string | null;
    size: string | null;
}

interface DesignContextType {
  designs: Record<ShirtSide, DesignElement[]>;
  setDesigns: React.Dispatch<React.SetStateAction<Record<ShirtSide, DesignElement[]>>>;
  side: ShirtSide;
  setSide: React.Dispatch<React.SetStateAction<ShirtSide>>;
  toggleSide: () => void;
  elements: DesignElement[]; // The elements for the current side
  setElements: React.Dispatch<React.SetStateAction<DesignElement[]>>; // Sets elements for the current side
  addElement: (elementData: TextElementData | ImageElementData) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  selectedElementId: string | null;
  setSelectedElementId: React.Dispatch<React.SetStateAction<string | null>>;
  productOptions: ProductOptions;
  setProductOptions: React.Dispatch<React.SetStateAction<ProductOptions>>;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export function DesignProvider({ children }: { children: ReactNode }) {
  const [designs, setDesigns] = useState<Record<ShirtSide, DesignElement[]>>({ front: [], back: [] });
  const [side, setSide] = useState<ShirtSide>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<ProductOptions>({ color: null, size: null });

  const toggleSide = () => {
    setSelectedElementId(null); // Deselect elements when switching sides
    setSide(current => current === 'front' ? 'back' : 'front');
  }

  const addElement = (elementData: TextElementData | ImageElementData) => {
    const newElementBase = {
      id: `${Date.now()}-${Math.random()}`,
      x: 10,
      y: 10,
      rotation: 0,
    };

    let newElement: DesignElement;

    if (elementData.type === "text") {
      newElement = {
        ...newElementBase,
        ...elementData,
        width: 200,
        height: 50,
      };
    } else {
      newElement = {
        ...newElementBase,
        ...elementData,
        width: 150,
        height: 150, 
      };
    }
    
    setDesigns(prev => ({
        ...prev,
        [side]: [...prev[side], newElement]
    }));
    setSelectedElementId(newElement.id);
  };
  
  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setDesigns(prev => ({
        ...prev,
        [side]: prev[side].map(el => el.id === id ? { ...el, ...updates } : el)
    }));
  };

  const setElementsForCurrentSide = (newElements: DesignElement[] | ((prevElements: DesignElement[]) => DesignElement[])) => {
    setDesigns(prev => {
        const currentElements = prev[side];
        const updatedElements = typeof newElements === 'function' ? newElements(currentElements) : newElements;
        return {
            ...prev,
            [side]: updatedElements
        };
    });
};

  return (
    <DesignContext.Provider value={{ 
        designs, 
        setDesigns, 
        side, 
        setSide,
        toggleSide,
        elements: designs[side],
        setElements: setElementsForCurrentSide,
        addElement, 
        updateElement, 
        selectedElementId, 
        setSelectedElementId,
        productOptions,
        setProductOptions
    }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (context === undefined) {
    throw new Error("useDesign must be used within a DesignProvider");
  }
  return context;
}
