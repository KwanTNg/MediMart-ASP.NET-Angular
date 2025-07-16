import { Component, inject } from '@angular/core';
import { ChatbotService } from '../../core/services/chatbot.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';


@Component({
  selector: 'app-chatbox',
  imports: [NgFor, NgClass, FormsModule, NgIf, MatButton],
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.scss'
})
export class ChatbotComponent {
  private chatbotService = inject(ChatbotService);
  userInput = '';
  messages: { from: 'user' | 'bot', text: string }[] = [];
  isOpen = false;


  sendMessage() {
    const message = this.userInput.trim();
    if (!message) return;

    this.messages.push({ from: 'user', text: message });
    this.userInput = '';

    this.chatbotService.askGemini(message).subscribe(res => {
      const reply = res?.message || 'No response';
      this.messages.push({ from: 'bot', text: reply });
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
}
}
