import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'prettyType' })
export class PrettyTypePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/_/g, ' ').toLowerCase();
  }
}