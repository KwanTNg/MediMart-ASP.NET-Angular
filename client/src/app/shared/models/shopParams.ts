export class ShopParams {
    brands: string[] = [];
    types: string[] = [];
    sort = 'name';
    categories: string[] = [];
    symptomIds: number[] = [];
    pageNumber = 1;
    pageSize = 12;
    search = '';
}