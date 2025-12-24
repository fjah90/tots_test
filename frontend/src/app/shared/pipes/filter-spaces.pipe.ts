import { Pipe, PipeTransform } from '@angular/core';
import { Space } from '../interfaces';

export interface SpaceFilterCriteria {
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  isActive?: boolean;
}

/**
 * Pipe para filtrar espacios localmente
 * Uso: spaces | filterSpaces:{ search: 'sala', minCapacity: 10 }
 */
@Pipe({
  name: 'filterSpaces',
  standalone: true,
  pure: true,
})
export class FilterSpacesPipe implements PipeTransform {
  transform(spaces: Space[] | null, criteria: SpaceFilterCriteria): Space[] {
    if (!spaces || spaces.length === 0) {
      return [];
    }

    return spaces.filter(space => {
      // Filtro por búsqueda de texto
      if (criteria.search) {
        const searchTerm = criteria.search.toLowerCase();
        const matchesSearch =
          space.name.toLowerCase().includes(searchTerm) ||
          space.description?.toLowerCase().includes(searchTerm) ||
          space.location?.toLowerCase().includes(searchTerm);

        if (!matchesSearch) return false;
      }

      // Filtro por capacidad mínima
      if (criteria.minCapacity !== undefined && criteria.minCapacity > 0) {
        if (space.capacity < criteria.minCapacity) return false;
      }

      // Filtro por capacidad máxima
      if (criteria.maxCapacity !== undefined && criteria.maxCapacity > 0) {
        if (space.capacity > criteria.maxCapacity) return false;
      }

      // Filtro por estado activo
      if (criteria.isActive !== undefined) {
        if (space.is_active !== criteria.isActive) return false;
      }

      return true;
    });
  }
}
