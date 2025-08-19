'use server';

/**
 * @fileOverview This flow enhances a user-uploaded image using AI to improve its resolution or style.
 *
 * - enhanceUploadedImage - An async function that takes an image data URI as input and returns an enhanced image data URI.
 * - EnhanceUploadedImageInput - The input type for the enhanceUploadedImage function.
 * - EnhanceUploadedImageOutput - The return type for the enhanceUploadedImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceUploadedImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to enhance, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  enhancementPrompt: z
    .string()
    .optional()
    .describe('Optional prompt to guide the image enhancement process.'),
});
export type EnhanceUploadedImageInput = z.infer<typeof EnhanceUploadedImageInputSchema>;

const EnhanceUploadedImageOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe('The enhanced photo, as a data URI.'),
});
export type EnhanceUploadedImageOutput = z.infer<typeof EnhanceUploadedImageOutputSchema>;

export async function enhanceUploadedImage(
  input: EnhanceUploadedImageInput
): Promise<EnhanceUploadedImageOutput> {
  return enhanceUploadedImageFlow(input);
}

const enhanceUploadedImagePrompt = ai.definePrompt({
  name: 'enhanceUploadedImagePrompt',
  input: {schema: EnhanceUploadedImageInputSchema},
  output: {schema: EnhanceUploadedImageOutputSchema},
  prompt: `Enhance the uploaded image to make it suitable for printing on a t-shirt. Enchance resolution and style as requested by the user, taking into account the enhancementPrompt, if present.\n\nUploaded Image: {{media url=photoDataUri}}\n\n{{~#if enhancementPrompt}}Enhancement Instructions: {{{enhancementPrompt}}}{{/if}}\n\nEnsure the enhanced image is high-quality and visually appealing for a t-shirt design.`,
});

const enhanceUploadedImageFlow = ai.defineFlow(
  {
    name: 'enhanceUploadedImageFlow',
    inputSchema: EnhanceUploadedImageInputSchema,
    outputSchema: EnhanceUploadedImageOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: enhanceUploadedImagePrompt.prompt(input).prompt},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!output?.media?.url) {
      throw new Error('Failed to generate enhanced image.');
    }

    return {enhancedPhotoDataUri: output.media.url};
  }
);
