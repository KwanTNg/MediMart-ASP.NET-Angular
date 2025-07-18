import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination } from '../../shared/models/pagination';
import { Product } from '../../shared/models/product';
import { ShopParams } from '../../shared/models/shopParams';
import { Symptom } from '../../shared/models/symptom';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
baseUrl = environment.apiUrl;
private http = inject(HttpClient);
types: string[] = [];
brands: string[] = [];
categories: string[] = [];
symptomIds: number[] = [];
symptoms: Symptom[] = [];

getProducts(shopParams: ShopParams) {
  let params = new HttpParams();
  if(shopParams.brands.length > 0) {
    params = params.append('brands', shopParams.brands.join(','));
  }
   if(shopParams.types.length > 0) {
    params = params.append('types', shopParams.types.join(','));
  }
  if(shopParams.categories.length > 0) {
    params = params.append('categories', shopParams.categories.join(','));
  }
  if (shopParams.symptomIds.length > 0) {
    for (const id of shopParams.symptomIds) {
      params = params.append('symptomIds', id.toString());
    }
  }
  if (shopParams.sort) {
    params = params.append('sort', shopParams.sort);
  }
  if (shopParams.search) {
    params = params.append('search', shopParams.search);
  }

  params = params.append('pageSize', shopParams.pageSize);
  params = params.append('pageIndex', shopParams.pageNumber);

  return this.http.get<Pagination<Product>>(this.baseUrl + 'products', {params})
}

getProduct(id: number) {
  return this.http.get<Product>(this.baseUrl + 'products/' + id);
}

getBrands() {
  //It will only execute once
  if (this.brands.length > 0) return;
  return this.http.get<string[]>(this.baseUrl + 'products/brands').subscribe({
    next: response => this.brands = response
  })
}

getTypes() {
  if (this.types.length > 0) return;
  return this.http.get<string[]>(this.baseUrl + 'products/types').subscribe({
    next: response => this.types = response
  })
}

getCategories() {
  if (this.categories.length > 0) return;
  return this.http.get<string[]>(this.baseUrl + 'products/categories').subscribe({
    next: response => this.categories = response
  })
}

getSymptoms() {
  if (this.symptoms.length > 0) return;
  return this.http.get<Symptom[]>(this.baseUrl + 'symptoms').subscribe({
    next: response => {this.symptoms = response
    console.log(this.symptoms)}
  })
}

updateProduct(id: number, formData: FormData) {
  for (const [key, value] of formData.entries()) {
  console.log(`${key}:`, value);
}
  return this.http.put(`${this.baseUrl}products/${id}`, formData, {withCredentials: true});
}

}
