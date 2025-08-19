"use client";

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
import { Brush } from "lucide-react";

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
  const { addElement } = useDesign();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "Hello World",
      fontFamily: "Arial",
      fontSize: 32,
      color: "#000000",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addElement({
      type: "text",
      ...values,
    });
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Add Text</h3>
      <p className="text-sm text-muted-foreground">
        Add custom text to your t-shirt.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

          <FormField
            control={form.control}
            name="fontFamily"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Font Family</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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

          <Button type="submit" className="w-full">
            <Brush className="mr-2 h-4 w-4" /> Add Text to Design
          </Button>
        </form>
      </Form>
    </div>
  );
}
