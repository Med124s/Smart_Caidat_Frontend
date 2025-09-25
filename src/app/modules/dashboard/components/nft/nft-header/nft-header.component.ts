import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: 'app-nft-header',
  templateUrl: './nft-header.component.html',
  standalone: true,
  imports: [AngularSvgIconModule],
})
export class NftHeaderComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
