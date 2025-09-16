"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateTShirtDesign } from "@/ai/flows/generate-t-shirt-design";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(5, {
    message: "Prompt must be at least 5 characters.",
  }),
});

export default function AiPanel() {
  const { addElement } = useDesign();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await generateTShirtDesign({ prompt: values.prompt });
      if (result.image) {
        addElement({
        type: "image",
        src: result.image,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      });
        toast({
          title: "Image Generated!",
          description: "The AI-generated image has been added to your design.",
        });
      } else {
        throw new Error("AI did not return an image.");
      }
    } catch (error) {
      console.error("Error generating AI image:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the image. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Generate with AI</h3>
      <p className="text-sm text-muted-foreground">
        Describe the image you want to create on your t-shirt.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., A majestic lion wearing a crown, vintage style"
                    {...field}
                    rows={4}
                    maxLength={200}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? "Generating..." : "Generate Image"}
          </Button>
        </form>
      </Form>
      {isLoading && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Generating your masterpiece...</p>
          <Skeleton className="w-full h-40 rounded-lg" />
        </div>
      )}
    </div>
  );
}
