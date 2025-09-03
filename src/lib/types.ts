export interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export type DesignElement = TextElement | ImageElement;

// Types for adding new elements, without the base properties
export type TextElementData = Omit<TextElement, 'id' | 'x' | 'y' | 'width' | 'height' | 'rotation'>;
export type ImageElementData = Omit<ImageElement, 'id' | 'x' | 'y' | 'width' | 'height' | 'rotation'>;
