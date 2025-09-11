import { ComplaintPriorityLabel } from '.history/src/app/modules/complaint/model/complaint.model_20250907154702';
import { Pipe, PipeTransform } from '@angular/core';
import { ComplaintPriority } from 'src/app/modules/complaint/model/complaint.model';

@Pipe({
  name: 'prettyComplaintPriority',
  standalone: true,
})
export class PrettyComplaintPriorityPipe implements PipeTransform {
  transform(value: ComplaintPriority): string {
    return ComplaintPriorityLabel[value] ?? value;
  }
}