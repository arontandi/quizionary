import { Injectable } from '@angular/core';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { environment } from 'environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: environment.openaiApiKey,
      dangerouslyAllowBrowser: true
     });
  }

  async generateResponse(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', 
        messages: messages as ChatCompletionMessageParam[],
        max_tokens: 20, 
      });

      return response.choices[0].message?.content || 'No response.';
    } catch (error) {
      console.error('Error with OpenAI API:', error);
      throw new Error('Failed to generate a response.');
    }
  }
}
