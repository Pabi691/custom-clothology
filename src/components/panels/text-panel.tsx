"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDesign } from "@/contexts/design-context";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Brush, Text, Palette, Type } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components
import type { TextElement } from "@/lib/types";

const formSchema = z.object({
  text: z.string().min(1, { message: "Text cannot be empty." }),
  fontFamily: z.string(),
  fontSize: z.number().min(10).max(100),
  color: z.string(),
});

const fontFamilies = [
  "Arial",
  "Verdana",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Lucida Console",
  "Impact",
];

export default function TextPanel() {
  const { selectedElementId, elements, updateElement, addElement } = useDesign();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedElement = elements.find(
    (el) => el.id === selectedElementId && el.type === "text"
  ) as TextElement | undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "HeY BuDDy",
      fontFamily: "Arial",
      fontSize: 32,
      color: "#000000",
    },
  });

  // Live update form values into the selected element
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (selectedElementId && selectedElement) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          updateElement(selectedElementId, values);
        }, 300);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [form, selectedElementId, selectedElement, updateElement]);

  // Reset form when a new element is selected
  useEffect(() => {
    if (selectedElement) {
      form.reset({
        text: selectedElement.text,
        fontFamily: selectedElement.fontFamily,
        fontSize: selectedElement.fontSize,
        color: selectedElement.color,
      });
    }
  }, [selectedElement, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (selectedElementId && selectedElement) {
      updateElement(selectedElementId, values);
    } else {
      addElement({
        type: "text",
        ...values,
      });
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="flex items-center gap-1">
                <Text className="h-4 w-4" /> Text
              </TabsTrigger>
              <TabsTrigger value="font" className="flex items-center gap-1">
                <Type className="h-4 w-4" /> Font
              </TabsTrigger>
              <TabsTrigger value="style" className="flex items-center gap-1">
                <Palette className="h-4 w-4" /> Style
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Content</FormLabel>
                    <FormControl>
                      <Input placeholder="Your text here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="font">
              <FormField
                control={form.control}
                name="fontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font} value={font}>
                            <span style={{ fontFamily: font }}>{font}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fontSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Size: {field.value}px</FormLabel>
                    <FormControl>
                      <Slider
                        min={10}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="style">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4">
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} className="w-16 p-1 h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
          <Button type="submit" className="w-full">
            <Brush className="mr-2 h-4 w-4" />
            {selectedElement ? "Update Text" : "Add Text to Design"}
          </Button>
        </form>
      </Form>
    </div>
  );
}