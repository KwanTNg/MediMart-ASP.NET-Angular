import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShopService } from '../../../core/services/shop.service';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-symptoms-filter-dialog',
  imports: [
    MatButton,
    FormsModule
],
  templateUrl: './symptoms-filter-dialog.component.html',
  styleUrl: './symptoms-filter-dialog.component.scss'
})
export class SymptomsFilterDialogComponent {
  shopService = inject(ShopService);
  private dialogRef = inject(MatDialogRef<SymptomsFilterDialogComponent>);
  data = inject(MAT_DIALOG_DATA);
  currentQuestionIndex = 0;
  symptoms = this.shopService.symptoms;

  selectedSymptomIds: number[] = [];

  get currentSymptom() {
    return this.symptoms[this.currentQuestionIndex];
  }
  answerYes() {
    this.selectedSymptomIds.push(this.currentSymptom.id);
    this.nextQuestion();
  }

  answerNo() {
    this.nextQuestion();
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.symptoms.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.dialogRef.close(this.selectedSymptomIds);
    }
  }
}
