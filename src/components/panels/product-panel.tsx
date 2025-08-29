"use client";

import { useDesign } from "@/contexts/design-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS = [
    { name: "White", value: "#FFFFFF" },
    { name: "Black", value: "#000000" },
    { name: "Gray", value: "#808080" },
    { name: "Navy", value: "#000080" },
    { name: "Red", value: "#FF0000" },
]

export default function ProductPanel() {
  const { productOptions, setProductOptions } = useDesign();

  const handleSizeChange = (size: string) => {
    setProductOptions(prev => ({...prev, size}));
  };

  const handleColorChange = (color: string) => {
    setProductOptions(prev => ({...prev, color}));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Product Options</h3>
      <p className="text-sm text-muted-foreground">
        Select the color and size for your t-shirt.
      </p>

      <div className="space-y-4">
        <Label>T-Shirt Color</Label>
        <RadioGroup
          value={productOptions.color ?? ""}
          onValueChange={handleColorChange}
          className="flex flex-wrap gap-2"
        >
          {COLORS.map(color => (
            <Label
              key={color.value}
              htmlFor={`color-${color.value}`}
              className={`relative flex items-center justify-center rounded-full w-8 h-8 cursor-pointer border-2
                ${productOptions.color === color.value ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              <RadioGroupItem value={color.value} id={`color-${color.value}`} className="sr-only" />
            </Label>
          ))}
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="size-select">Size</Label>
        <Select onValueChange={handleSizeChange} value={productOptions.size ?? ""}>
          <SelectTrigger id="size-select">
            <SelectValue placeholder="Select a size" />
          </SelectTrigger>
          <SelectContent>
            {SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
