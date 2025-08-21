'use server';

/**
 * @fileOverview Handles adding a customized product to the cart via an external API.
 * 
 * - addToCart - A function to add an item to the cart.
 * - AddToCartInput - The input type for the addToCart function.
 * - AddToCartOutput - The return type for the addToCart function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

const AddToCartInputSchema = z.object({
  userToken: z.string().describe('The authentication token for the user.'),
  color: z.string().describe('The selected color of the product.'),
  size: z.string().describe('The selected size of the product.'),
  price: z.number().describe('The price of the product.'),
  frontImage: z.string().optional().describe("A data URI of the front design."),
  backImage: z.string().optional().describe("A data URI of the back design."),
  productId: z.string().describe("The unique ID for the custom product."),
});
export type AddToCartInput = z.infer<typeof AddToCartInputSchema>;

const AddToCartOutputSchema = z.object({
  success: z.boolean().describe('Whether the item was successfully added to the cart.'),
  message: z.string().describe('A message indicating the result of the operation.'),
});
export type AddToCartOutput = z.infer<typeof AddToCartOutputSchema>;

export async function addToCart(input: AddToCartInput): Promise<AddToCartOutput> {
  return addToCartFlow(input);
}



const addToCartFlow = ai.defineFlow(
  {
    name: 'addToCartFlow',
    inputSchema: AddToCartInputSchema,
    outputSchema: AddToCartOutputSchema,
  },
  async (input) => {
    const { userToken, size, price, color, frontImage, backImage, productId } = input;

    console.log('Received input:', input);
    console.log('productId', productId);

    const API_URL = process.env.API_URL;

    if (!API_URL) {
      throw new Error('API URL is not configured.');
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/add_to_cart`,
        {
          product_id: productId, 
          prod_variation_id: size, 
          quantity: 1,
          price: price,
          color: color,
          size: size,
          front_image: frontImage,
          back_image: backImage,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      ); 
      console.log('response', response);

      if (response.data.status) {
        return {
          success: true,
          message: response.data.message || 'Item added to cart successfully!',
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to add item to cart.',
        };
      }
    } catch (error) {
      console.error('Add to cart API error:', error);
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'An unexpected error occurred.';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
);
