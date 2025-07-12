import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./layout/header/header.component";
import { NgChartsModule } from 'ng2-charts';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgChartsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'MediMart';
 
}
