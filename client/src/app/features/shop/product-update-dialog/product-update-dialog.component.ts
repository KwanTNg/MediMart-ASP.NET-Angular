import { Component, inject, OnDestroy } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product } from '../../../shared/models/product';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgFor, NgIf } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-product-update-dialog',
  imports: [
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,           
    FormsModule,
    NgIf,
    NgFor,
    MatCheckbox,
    MatProgressSpinnerModule
  ],
  templateUrl: './product-update-dialog.component.html',
  styleUrl: './product-update-dialog.component.scss'
})
export class ProductUpdateDialogComponent implements OnDestroy {
  shopService = inject(ShopService);
  dialogRef = inject(MatDialogRef<ProductUpdateDialogComponent>);
  router = inject(Router);
  private snack = inject(SnackbarService);
  data = inject(MAT_DIALOG_DATA) as {
    product?: Product;
    mode: 'create' | 'edit';
  };

  product: Product = this.data.product ?? {
    id: 0,
    name: '',
    description: '',
    price: 0,
    brand: '',
    type: '',
    quantityInStock: 0,
    category: '',
    pictureUrl: '',
    symptomIds: []
  };
  imageFile?: File;
  isDragging = false;
  uploadingImage = false;
  imagePreviewUrl?: string;
  loading = false

  submitProduct() {
  this.loading = true;
  const formData = new FormData();

  // Append fields
  formData.append('name', this.product.name);
  formData.append('description', this.product.description);
  formData.append('price', this.product.price.toString());
  formData.append('type', this.product.type);
  formData.append('brand', this.product.brand);
  formData.append('quantityInStock', this.product.quantityInStock.toString());
  formData.append('category', this.product.category);

  // SymptomIds (assuming it's an array of numbers)
  this.product.symptomIds.forEach((id: number) => {
    formData.append('symptomIds', id.toString());
  });

  // Append image file (optional)
  if (this.imageFile) {
    formData.append('picture', this.imageFile);
  }

  const request = this.data.mode === 'edit'
    ? this.shopService.updateProduct(this.product.id, formData)
    : this.shopService.createProduct(formData);

  request.pipe(
    finalize(() => this.loading = false) // Always run this
  ).subscribe({
    next: res => {
      this.dialogRef.close(true);
      this.snack.success(
        this.data.mode === 'edit'
          ? 'Product updated successfully'
          : 'Product created successfully'
      );
      this.router.navigateByUrl('/');
    },
    error: err => {
      console.error(`${this.data.mode} failed`, err);
      const message = err?.error?.message || 'Something went wrong. Please try again.';
      this.snack.error(message);
    }
  });
}
 


  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
  event.preventDefault();
  this.isDragging = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    this.imageFile = file;
    this.setImagePreview(file);
  }
}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.imageFile = file;
      this.setImagePreview(file);
    }
  }

  setImagePreview(file: File) {
    this.imagePreviewUrl = URL.createObjectURL(file);
}

ngOnDestroy() {
  if (this.imagePreviewUrl) {
    URL.revokeObjectURL(this.imagePreviewUrl);
  }
}

onSymptomChange(symptom: any) {
  const index = this.product.symptomIds.indexOf(symptom.id);
  if (symptom.selected && index === -1) {
    this.product.symptomIds.push(symptom.id);
  } else if (!symptom.selected && index > -1) {
    this.product.symptomIds.splice(index, 1);
  }
}



}
