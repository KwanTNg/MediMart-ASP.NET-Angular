import { Component, inject } from '@angular/core';
import { ChatbotService } from '../../core/services/chatbot.service';
import { NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-chatbox',
  imports: [NgFor, NgClass, FormsModule],
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.scss'
})
export class ChatbotComponent {
  private chatbotService = inject(ChatbotService);
  userInput = '';
  messages: { from: 'user' | 'bot', text: string }[] = [];


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
}
