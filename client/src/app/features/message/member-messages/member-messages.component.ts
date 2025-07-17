import { DatePipe, NgClass } from '@angular/common';
import { Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../core/services/message.service';
import { Message } from '../../../shared/models/message';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';


@Component({
  selector: 'app-member-messages',
  imports: [DatePipe, FormsModule, TimeAgoPipe, NgClass, MatIconModule, MatIconButton ],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.scss'
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageEndRef') messageEndRef! : ElementRef;
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  protected messages = signal<Message[]>([]);
  protected messageContent = '';
  recipientId = '';
  isSupportMode = false;

  constructor() {
    effect(() => {
      const currentMessages = this.messages();
      if (currentMessages.length > 0) {
        this.scrollToBottom();
      }
    })
  }

 ngOnInit(): void {
  const routeId = this.route.snapshot.paramMap.get('id');

  if (!routeId) {
    // Support mode (no :id in URL)
    this.isSupportMode = true;
    this.loadAdminMessages();
  } else {
    // Member-to-member mode
    this.recipientId = routeId;
    this.loadMessages();
  }
}


  loadAdminMessages() {
  this.messageService.getMessageThreadWithAdmin().subscribe({
    next: messages => this.messages.set(messages.map(message => ({
      ...message,
      currentUserSender: !message.isFromAdmin,
    })))
  });
}

  loadMessages() {
    if (this.recipientId) {
      this.messageService.getMessageThread(this.recipientId).subscribe({
        next: messages => this.messages.set(messages.map(message => ({
          ...message,
          currentUserSender: message.senderId !== this.recipientId
        })))
      })
    }
  }

  sendMessage() {
    if (!this.messageContent.trim()) return;

    const send$ = this.isSupportMode
      ? this.messageService.sendMessageToAdmin(this.messageContent)
      : this.messageService.sendMessage(this.recipientId!, this.messageContent);

    send$.subscribe({
      next: (message) => {
        message.currentUserSender = true;
        this.messages.update((msgs) => [...msgs, message]);
        this.messageContent = '';
      },
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messageEndRef) {
        this.messageEndRef.nativeElement.scrollIntoView({behavior: 'smooth'})
      }
    })
  }

}
