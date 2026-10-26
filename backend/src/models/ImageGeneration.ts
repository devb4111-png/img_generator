import { Schema, model, Document, Types } from 'mongoose';

export type GenerationMode = 'TEMPLATE' | 'AI';
export type GenerationStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface IImageGeneration extends Document {
  generationMode: GenerationMode;
  templateId?: Types.ObjectId;
  organizationName: string;
  uploadedLogoPath: string;
  originalCreativeIdea?: string;
  structuredPrompt?: string;
  generatedBackgroundPath?: string;
  finalImagePath: string;
  imageWidth: number;
  imageHeight: number;
  status: GenerationStatus;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageGenerationSchema = new Schema<IImageGeneration>(
  {
    generationMode: {
      type: String,
      enum: ['TEMPLATE', 'AI'],
      required: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: function (this: IImageGeneration) {
        return this.generationMode === 'TEMPLATE';
      },
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    uploadedLogoPath: {
      type: String,
      required: true,
    },
    originalCreativeIdea: {
      type: String,
    },
    structuredPrompt: {
      type: String,
    },
    generatedBackgroundPath: {
      type: String,
    },
    finalImagePath: {
      type: String,
      required: true,
    },
    imageWidth: {
      type: Number,
      required: true,
    },
    imageHeight: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ImageGeneration = model<IImageGeneration>(
  'ImageGeneration',
  ImageGenerationSchema
);
