'use server';
/**
 * @fileOverview Generates a t-shirt design using a text prompt.
 *
 * - generateTShirtDesign - A function that generates a t-shirt design.
 * - GenerateTShirtDesignInput - The input type for the generateTShirtDesign function.
 * - GenerateTShirtDesignOutput - The return type for the generateTShirtDesign function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTShirtDesignInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired t-shirt design.'),
});
export type GenerateTShirtDesignInput = z.infer<typeof GenerateTShirtDesignInputSchema>;

const GenerateTShirtDesignOutputSchema = z.object({
  image: z.string().describe('The generated t-shirt design as a data URI.'),
});
export type GenerateTShirtDesignOutput = z.infer<typeof GenerateTShirtDesignOutputSchema>;

export async function generateTShirtDesign(input: GenerateTShirtDesignInput): Promise<GenerateTShirtDesignOutput> {
  return generateTShirtDesignFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTShirtDesignPrompt',
  input: {schema: GenerateTShirtDesignInputSchema},
  output: {schema: GenerateTShirtDesignOutputSchema},
  prompt: `Generate an image of a t-shirt design based on the following prompt: {{{prompt}}}. Return the image as a data URI.
`,
});

const generateTShirtDesignFlow = ai.defineFlow(
  {
    name: 'generateTShirtDesignFlow',
    inputSchema: GenerateTShirtDesignInputSchema,
    outputSchema: GenerateTShirtDesignOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {image: media!.url};
  }
);
