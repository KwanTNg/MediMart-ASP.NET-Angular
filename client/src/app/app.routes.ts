import { Routes } from '@angular/router';
import { ShopComponent } from './features/shop/shop.component';
import { ProductDetailsComponent } from './features/shop/product-details/product-details.component';
import { AboutUsComponent } from './features/about-us/about-us.component';
import { DeliveryComponent } from './features/delivery/delivery.component';
import { FaqComponent } from './features/faq/faq.component';
import { ContactUsComponent } from './features/contact-us/contact-us.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { ServerErrorComponent } from './shared/components/server-error/server-error.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { LoginComponent } from './features/account/login/login.component';
import { RegisterComponent } from './features/account/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { emptyCartGuard } from './core/guards/empty-cart.guard';
import { CheckoutSuccessComponent } from './features/checkout/checkout-success/checkout-success.component';
import { OrderComponent } from './features/orders/order/order.component';
import { OrderDetailComponent } from './features/orders/order-detail/order-detail.component';
import { orderCompleteGuard } from './core/guards/order-complete.guard';
import { OrderManagementComponent } from './features/admin/order-management/order-management.component';
import { adminGuard } from './core/guards/admin.guard';
import { SalesChartComponent } from './features/admin/charts/sales-chart/sales-chart.component';

export const routes: Routes = [
    {path: '', component: ShopComponent},
    {path: 'product/:id', component: ProductDetailsComponent},
    {path: 'cart', component: CartComponent},
    {path: 'checkout', component: CheckoutComponent, canActivate: [authGuard, emptyCartGuard]},
    {path: 'checkout/success', component: CheckoutSuccessComponent, canActivate: [authGuard, orderCompleteGuard]},
    {path: 'orders', component: OrderComponent, canActivate: [authGuard]},
    {path: 'orders/:id', component: OrderDetailComponent, canActivate: [authGuard]},
    {path: 'aboutus', component: AboutUsComponent},
    {path: 'delivery', component: DeliveryComponent},
    {path: 'faq', component: FaqComponent},
    {path: 'contactus', component: ContactUsComponent},
    {path: 'account/login', component: LoginComponent},
    {path: 'account/register', component: RegisterComponent},
    {path: 'not-found', component: NotFoundComponent},
    {path: 'server-error', component: ServerErrorComponent},
    {path: 'order-management', component: OrderManagementComponent, canActivate: [authGuard, adminGuard]},
    {path: 'charts', component: SalesChartComponent},
    {path: '**', redirectTo: 'not-found', pathMatch: 'full'},
];
