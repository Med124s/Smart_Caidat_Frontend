import { Pipe, PipeTransform } from '@angular/core';
import { ComplaintStatus, ComplaintStatusLabel } from 'src/app/modules/complaint/model/complaint.model';

@Pipe({
  name: 'prettyComplaintStatus',
  standalone: true,
})
export class PrettyComplaintStatusPipe implements PipeTransform {
  transform(value: ComplaintStatus): string {
    return ComplaintStatusLabel[value] ?? value;
  }
}