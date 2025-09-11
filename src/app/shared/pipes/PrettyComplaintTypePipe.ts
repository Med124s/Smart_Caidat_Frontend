import { ComplaintTypeLabel } from '.history/src/app/modules/complaint/model/complaint.model_20250907154702';
import { Pipe, PipeTransform } from '@angular/core';
import { ComplaintType } from 'src/app/modules/complaint/model/complaint.model';

@Pipe({
  name: 'prettyComplaintType',
  standalone: true,
})
export class PrettyComplaintTypePipe implements PipeTransform {
  transform(value: ComplaintType): string {
    return ComplaintTypeLabel[value] ?? value;
  }
}