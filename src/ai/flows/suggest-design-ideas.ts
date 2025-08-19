'use server';

/**
 * @fileOverview Provides design ideas or prompts based on a theme or keyword.
 *
 * - suggestDesignIdeas - A function to suggest design ideas.
 * - SuggestDesignIdeasInput - The input type for the suggestDesignIdeas function.
 * - SuggestDesignIdeasOutput - The return type for the suggestDesignIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDesignIdeasInputSchema = z.object({
  theme: z.string().describe('The theme or keyword for design ideas.'),
});
export type SuggestDesignIdeasInput = z.infer<typeof SuggestDesignIdeasInputSchema>;

const SuggestDesignIdeasOutputSchema = z.object({
  ideas: z.array(z.string()).describe('An array of suggested design ideas or prompts.'),
});
export type SuggestDesignIdeasOutput = z.infer<typeof SuggestDesignIdeasOutputSchema>;

export async function suggestDesignIdeas(input: SuggestDesignIdeasInput): Promise<SuggestDesignIdeasOutput> {
  return suggestDesignIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDesignIdeasPrompt',
  input: {schema: SuggestDesignIdeasInputSchema},
  output: {schema: SuggestDesignIdeasOutputSchema},
  prompt: `You are a design assistant. Based on the given theme or keyword, suggest some design ideas or prompts.

Theme: {{{theme}}}

Suggestions:`,
});

const suggestDesignIdeasFlow = ai.defineFlow(
  {
    name: 'suggestDesignIdeasFlow',
    inputSchema: SuggestDesignIdeasInputSchema,
    outputSchema: SuggestDesignIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
