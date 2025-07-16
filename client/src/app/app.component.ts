import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./layout/header/header.component";
import { NgChartsModule } from 'ng2-charts';
import { AccountService } from './core/services/account.service';
import { NgClass } from '@angular/common';
import { ChatbotComponent } from "./features/chatbox/chatbox.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgChartsModule, NgClass, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'MediMart';
  accountService = inject(AccountService);
 
}
