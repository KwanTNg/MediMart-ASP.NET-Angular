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
import { ChartSummaryComponent } from './features/admin/charts/chart-summary/chart-summary.component';
import { OrderItemComponent } from './features/admin/order-item/order-item.component';
import { ConfirmEmailComponent } from './features/account/email/confirm-email/confirm-email.component';
import { RegisterConfirmComponent } from './features/account/email/register-confirm/register-confirm.component';
import { ForgotPasswordComponent } from './features/account/email/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/account/email/reset-password/reset-password.component';
import { TwoFaSetupComponent } from './features/account/two-fa-setup/two-fa-setup.component';
import { TwoFactorAuthComponent } from './features/account/two-factor-auth/two-factor-auth.component';
import { ChatbotComponent } from './features/chatbox/chatbox.component';
import { SalesChartComponent } from './features/admin/charts/sales-chart/sales-chart.component';
import { TopSellingProductsComponent } from './features/admin/charts/top-selling-products/top-selling-products.component';
import { SalesByStatusComponent } from './features/admin/charts/sales-by-status/sales-by-status.component';
import { RevenuePerProductComponent } from './features/admin/charts/revenue-per-product/revenue-per-product.component';
import { MemberMessagesComponent } from './features/message/member-messages/member-messages.component';
import { Messages } from './features/message/messages/messages.component';
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { AdminComponent } from './features/admin/admin.component';
import { InventoryManagementComponent } from './features/admin/inventory-management/inventory-management.component';
import { DeliveryDistributionComponent } from './features/admin/charts/delivery-distribution/delivery-distribution.component';
import { OnTimeDispatchRateComponent } from './features/admin/charts/on-time-dispatch-rate/on-time-dispatch-rate.component';
import { AverageDeliveryTimeComponent } from './features/admin/charts/average-delivery-time/average-delivery-time.component';
import { RoleDistributionComponent } from './features/admin/charts/role-distribution/role-distribution.component';
import { RegistrationsOverTimeComponent } from './features/admin/charts/registrations-over-time/registrations-over-time.component';
import { TermsComponent } from './features/terms/terms.component';
import { PrivacyComponent } from './features/privacy/privacy.component';

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
    {path: 'order-summary', component: OrderManagementComponent, canActivate: [authGuard]},
    {path: 'order-item', component: OrderItemComponent, canActivate: [authGuard]},
    {path: 'chart', component: ChartSummaryComponent, canActivate: [authGuard]},
    {path: 'admin', component: AdminComponent, canActivate: [authGuard]},
    {path: 'confirm-email', component: ConfirmEmailComponent},
    {path: 'register-confirm', component: RegisterConfirmComponent},
    {path: 'forgot-password', component: ForgotPasswordComponent},
    {path: 'reset-password', component: ResetPasswordComponent},
    {path: 'two-fa-setup', component: TwoFaSetupComponent},
    {path: 'two-factor-auth', component: TwoFactorAuthComponent},
    {path: 'chatbot', component: ChatbotComponent},
    {path: 'sales-over-time', component: SalesChartComponent},
    {path: 'top-selling-products', component: TopSellingProductsComponent},
    {path: 'sales-by-status', component: SalesByStatusComponent},
    {path: 'revenue-per-product', component: RevenuePerProductComponent},
    {path: 'member-messages/:id', component: MemberMessagesComponent},
    {path: 'support-messages', component: MemberMessagesComponent },
    {path: 'messages', component: Messages},
    {path: 'user-management', component: UserManagementComponent},
    {path: 'inventory-management', component: InventoryManagementComponent, canActivate: [authGuard]},
    {path: 'admin/orders/:email/:id', component: OrderComponent, canActivate: [authGuard]},
    {path: 'delivery-distribution', component: DeliveryDistributionComponent},
    {path: 'on-time-dispatch-rate', component: OnTimeDispatchRateComponent},
    {path: 'average-delivery-time', component: AverageDeliveryTimeComponent},
    {path: 'role-distribution', component: RoleDistributionComponent},
    {path: 'registrations-over-time', component: RegistrationsOverTimeComponent},
    {path: 'terms', component: TermsComponent},
    {path: 'privacy', component: PrivacyComponent},
    {path: '**', redirectTo: 'not-found', pathMatch: 'full'}
];
