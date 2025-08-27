import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {  RequestRoutingModule } from './request_documents-routing.module';
import { RouterOutlet } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [CommonModule, RequestRoutingModule, RouterOutlet],
})
export class RequestModule {}
