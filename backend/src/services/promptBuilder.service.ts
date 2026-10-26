export interface PromptBuildOptions {
  creativeIdea: string;
  style?: 'vivid' | 'natural';
  brandingZone?: 'bottom' | 'top' | 'center';
}

export interface StructuredPromptResult {
  structuredPrompt: string;
  originalIdea: string;
  brandingZone: string;
}

export class PromptBuilderService {
  /**
   * Validates user-submitted creative idea
   */
  public validateIdea(idea: unknown): string {
    if (!idea || typeof idea !== 'string') {
      throw new Error('A creative idea or concept description is required.');
    }

    const trimmed = idea.trim();
    if (trimmed.length < 5) {
      throw new Error('Creative idea must be at least 5 characters long.');
    }
    const words = trimmed.split(/\s+/).length;
    if (words > 10000 || trimmed.length > 60000) {
      throw new Error('Creative idea cannot exceed 10,000 words.');
    }

    return trimmed;
  }

  /**
   * Deterministically builds a high-fidelity image generation prompt
   * that preserves original intent while ensuring suitable space for branding overlays
   */
  public buildPrompt(options: PromptBuildOptions): StructuredPromptResult {
    const rawIdea = this.validateIdea(options.creativeIdea);
    const style = options.style || 'vivid';
    const brandingZone = options.brandingZone || 'bottom';

    // Composition framing instruction based on branding zone
    let framingInstruction = '';
    switch (brandingZone) {
      case 'top':
        framingInstruction =
          'Wide-angle composition with generous, uncluttered negative space and soft atmospheric gradient in the upper third of the canvas.';
        break;
      case 'center':
        framingInstruction =
          'Vignette framing with central depth and subtle, soft lighting around the perimeter, maintaining balanced negative space.';
        break;
      case 'bottom':
      default:
        framingInstruction =
          'Cinematic composition with expansive depth, leaving clean, uncluttered negative space and smooth gradients in the lower third of the canvas.';
        break;
    }

    // Aesthetic and lighting descriptors based on style
    const aestheticStyle =
      style === 'natural'
        ? 'Photorealistic documentary aesthetic, soft diffuse natural ambient lighting, true-to-life organic color palette, crisp 8k texture fidelity.'
        : 'Vibrant modern commercial aesthetic, cinematic golden hour lighting, rich saturated hues, volumetric illumination, sleek high-end editorial finish.';

    // Strict negative constraint to prevent AI model from attempting to render text or logos
    const negativeConstraint =
      'CRITICAL REQUIREMENT: Pure background imagery only. Absolutely NO text, NO typography, NO words, NO letters, NO numbers, NO watermarks, and NO logos anywhere in the image. Keep designated branding space smooth and clean for external digital overlay.';

    // Compile final structured prompt
    const structuredPrompt = [
      `Subject and Scene: ${rawIdea}.`,
      `Style and Atmosphere: ${aestheticStyle}`,
      `Composition and Framing: ${framingInstruction}`,
      negativeConstraint,
    ].join(' ');

    return {
      structuredPrompt,
      originalIdea: rawIdea,
      brandingZone,
    };
  }
}

export const promptBuilder = new PromptBuilderService();
