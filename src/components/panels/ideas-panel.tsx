"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDesign } from "@/contexts/design-context";
import { suggestDesignIdeas } from "@/ai/flows/suggest-design-ideas";
import { generateTShirtDesign } from "@/ai/flows/generate-t-shirt-design";
import { Lightbulb, Sparkles } from "lucide-react";

interface Idea {
  prompt: string;
  isGenerating: boolean;
}

export default function IdeasPanel() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { addElement } = useDesign();

  useEffect(() => {
    async function fetchIdeas() {
      setIsLoading(true);
      try {
        const result = await suggestDesignIdeas({
          theme: "popular t-shirt designs",
        });
        setIdeas(result.ideas.slice(0, 4).map(prompt => ({ prompt, isGenerating: false })));
      } catch (error) {
        console.error("Failed to fetch design ideas", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch design ideas.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchIdeas();
  }, [toast]);

  const handleGenerateIdea = async (ideaIndex: number) => {
    setIdeas(currentIdeas => 
      currentIdeas.map((idea, index) => 
        index === ideaIndex ? { ...idea, isGenerating: true } : idea
      )
    );

    const ideaToGenerate = ideas[ideaIndex];

    try {
      const result = await generateTShirtDesign({ prompt: ideaToGenerate.prompt });
      if (result.image) {
        addElement({ type: "image", src: result.image });
        toast({
          title: "Image Added!",
          description: `Generated image for "${ideaToGenerate.prompt}" and added it to your design.`,
        });
      } else {
        throw new Error("AI did not return an image.");
      }
    } catch (error) {
      console.error("Error generating AI image from idea:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the image for this idea. Please try again.",
      });
    } finally {
      setIdeas(currentIdeas => 
        currentIdeas.map((idea, index) => 
          index === ideaIndex ? { ...idea, isGenerating: false } : idea
        )
      );
    }
  };


  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Design Ideas</h3>
      <p className="text-sm text-muted-foreground">
        Need some inspiration? Here are a few ideas to get you started.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardContent>
                <CardFooter className="p-4">
                   <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))
          : ideas.map((idea, index) => (
              <Card key={index} className="flex flex-col">
                <CardContent className="p-4 flex-1">
                  <p className="text-sm">{idea.prompt}</p>
                </CardContent>
                <CardFooter className="p-4">
                  <Button
                    onClick={() => handleGenerateIdea(index)}
                    disabled={idea.isGenerating}
                    className="w-full"
                    variant="secondary"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {idea.isGenerating ? "Generating..." : "Use this Idea"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
}
