import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusBadge' })
export class StatusBadgePipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'Disponible':
      case 'Completado':
      case 'ENTRADA':
        return 'text-bg-success';
      case 'Stock bajo':
      case 'Pendiente':
        return 'text-bg-warning';
      case 'Sin stock':
      case 'Cancelado':
      case 'SALIDA':
        return 'text-bg-danger';
      case 'En preparación':
      case 'Listo para retiro':
      case 'REPOSICIÓN':
        return 'text-bg-info';
      default:
        return 'text-bg-secondary';
    }
  }
}
