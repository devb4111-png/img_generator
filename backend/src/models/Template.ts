import { Schema, model, Document } from 'mongoose';

export interface ILogoPlacement {
  x: number; // 0..1 if normalized or pixel
  y: number; // 0..1 if normalized or pixel
  width: number;
  height: number;
  isNormalized?: boolean;
}

export interface ITextPlacement {
  x: number;
  y: number;
  fontSize: number;
  fontColor: string;
  textAlign: 'left' | 'center' | 'right';
  maxTextWidth: number;
  isNormalized?: boolean;
}

export interface ITemplatePlacements {
  logo: ILogoPlacement;
  organizationName: ITextPlacement;
}

export interface ITemplate extends Document {
  name: string;
  description: string;
  previewImagePath: string;
  backgroundImagePath: string;
  width: number;
  height: number;
  placements: ITemplatePlacements;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    previewImagePath: { type: String, required: true },
    backgroundImagePath: { type: String, required: true },
    width: { type: Number, required: true, min: 100 },
    height: { type: Number, required: true, min: 100 },
    placements: {
      logo: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        isNormalized: { type: Boolean, default: true },
      },
      organizationName: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        fontSize: { type: Number, required: true, default: 42 },
        fontColor: { type: String, default: '#FFFFFF' },
        textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
        maxTextWidth: { type: Number, required: true },
        isNormalized: { type: Boolean, default: true },
      },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Template = model<ITemplate>('Template', TemplateSchema);
