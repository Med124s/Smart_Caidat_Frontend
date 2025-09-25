import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterOutlet } from '@angular/router';
import { ComplaintsRoutingModule } from './complaints-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, ComplaintsRoutingModule, RouterOutlet],
})
export class ComplaintsModule {}
