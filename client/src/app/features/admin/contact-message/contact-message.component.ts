import { Component, inject } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { Pagination } from '../../../shared/models/pagination';
import { ContactMessageParams } from '../../../shared/models/contactMessageParams';
import { ContactMessage } from '../../../shared/models/contactMessage';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DatePipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
  selector: 'app-contact-message',
  imports: [MatPaginator, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, DatePipe],
  templateUrl: './contact-message.component.html',
  styleUrl: './contact-message.component.scss'
})
export class ContactMessageComponent {
private adminService = inject(AdminService);
private snack = inject(SnackbarService);
contactMessageParams = new ContactMessageParams();
contactMessages?: Pagination<ContactMessage>;
encodeURIComponent = encodeURIComponent;

  ngOnInit(): void {
    this.loadContactMessages();
  }

  loadContactMessages() {
     this.adminService.getContactMessages(this.contactMessageParams).subscribe({
      next: response => this.contactMessages = response,
      error: error => this.snack.error("Too Many Requests!"),
  })
  }

  onPageChange(event: PageEvent) {
    this.contactMessageParams.pageNumber = event.pageIndex + 1;
    this.contactMessageParams.pageSize = event.pageSize;
    this.loadContactMessages();
}

getFileType(url: string): 'image' | 'pdf' | 'doc' | 'excel' | 'other' {
  const ext = url.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';
  if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['xls', 'xlsx'].includes(ext)) return 'excel';
  return 'other';
}


}
