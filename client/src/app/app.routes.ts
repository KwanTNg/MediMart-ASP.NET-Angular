import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ShopComponent } from './features/shop/shop.component';
import { ProductDetailsComponent } from './features/shop/product-details/product-details.component';
import { AboutUsComponent } from './features/about-us/about-us.component';
import { DeliveryComponent } from './features/delivery/delivery.component';
import { FaqComponent } from './features/faq/faq.component';
import { ContactUsComponent } from './features/contact-us/contact-us.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { ServerErrorComponent } from './shared/components/server-error/server-error.component';

export const routes: Routes = [
    {path: '', component: ShopComponent},
    {path: 'product/:id', component: ProductDetailsComponent},
    {path: 'aboutus', component: AboutUsComponent},
    {path: 'delivery', component: DeliveryComponent},
    {path: 'faq', component: FaqComponent},
    {path: 'contactus', component: ContactUsComponent},
    {path: 'not-found', component: NotFoundComponent},
    {path: 'server-error', component: ServerErrorComponent},
    {path: '**', redirectTo: 'not-found', pathMatch: 'full'},
];
