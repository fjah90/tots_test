/**
 * Interface Space - Coincide con el modelo Laravel
 */
export interface Space {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  location: string | null;
  amenities: string[] | null;
  image_url: string | null;
  images: string[] | null; // Array de URLs de imágenes para el carousel
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Interface para crear/actualizar espacio
 */
export interface SpacePayload {
  name: string;
  description?: string;
  capacity: number;
  location?: string;
  amenities?: string[];
  image_url?: string;
  images?: string[];
  is_active?: boolean;
}
