import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationToken, StripeAddressElement, StripeAddressElementChangeEvent, StripePaymentElement, StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';
import { StripeService } from '../../core/services/stripe.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { AccountService } from '../../core/services/account.service';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { firstValueFrom } from 'rxjs';
import { Address } from '../../shared/models/users';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { CheckoutReviewComponent } from "../checkout-review/checkout-review.component";
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../core/services/order.service';
import { OrderToCreate, ShippingAddress } from '../../shared/models/order';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-checkout',
  imports: [
    OrderSummaryComponent,
    MatStepperModule,
    MatButton,
    RouterLink,
    MatCheckboxModule,
    CheckoutDeliveryComponent,
    CheckoutReviewComponent,
    CurrencyPipe,
    MatProgressSpinnerModule
],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private stripeService = inject(StripeService);
  private accountService = inject(AccountService);
  private orderService = inject(OrderService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  cartService = inject(CartService);
  addressElement?: StripeAddressElement;
  paymentElement?: StripePaymentElement;
  saveAddress = false;
  //ensure all the info obtained before pay
  completionStatus = signal<{address: boolean, card: boolean, delivery: boolean}>(
    {address: false, card: false, delivery: false}
  )
  confirmationToken?: ConfirmationToken;
  loading = false;

  async ngOnInit(){
    try {
      this.addressElement = await this.stripeService.createAddressElement();
      //stripe will attach the address for us
      this.addressElement.mount('#address-element');
      this.addressElement.on('change', this.handleAddressChange)

      this.paymentElement = await this.stripeService.createPaymentElement();
      this.paymentElement.mount('#payment-element');
      this.paymentElement.on('change', this.handlePaymentChange);

    }catch (error:any) {
      this.snackbar.error(error.message);
      this.router.navigateByUrl('/cart');
    }
  }

   handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    setTimeout(() => {
    this.completionStatus.update(state => {
      state.address = event.complete;
      return state;
    });
      this.cdr.detectChanges();
    });
  }
  handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    setTimeout(() => {
    this.completionStatus.update(state => {
      state.card = event.complete;
      return state;
    });
    this.cdr.detectChanges();
    });
  }
  handleDeliveryChange(event: boolean) {
    setTimeout(() => {
    this.completionStatus.update(state => {
      state.delivery = event;
      return state;
    });
    this.cdr.detectChanges();
    });
  } 
  //the address will be reset whenever checkout component is disposed of
  //so user cannot get other's address even he has same stripe element
  ngOnDestroy(): void {
    this.stripeService.disposeElements();
  }

  async onStepChange(event: StepperSelectionEvent) {
    //check if the user move forward to next page
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = await this.getAddressFromStripeAddress() as Address;
        address && firstValueFrom(this.accountService.updateAddress(address));
      }
    }
    if (event.selectedIndex === 2) {   
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }
    if (event.selectedIndex === 3) {
      await this.getConfirmationToken();
    }
  }
   private async createOrderModel(): Promise<OrderToCreate> {
    const cart = this.cartService.cart();
    //return as ShippingAddress, but not Address
    const shippingAddress = await this.getAddressFromStripeAddress() as ShippingAddress;
    const card = this.confirmationToken?.payment_method_preview.card;

    if (!cart?.id || !cart.deliveryMethodId || !card || !shippingAddress) {
      throw new Error('Problem creating order');
    }

    return {
      cartId: cart.id,
      paymentSummary: {
        //cast to int using +
        last4: +card.last4,
        brand: card.brand,
        expMonth: card.exp_month,
        expYear: card.exp_year
      },
      deliveryMethodId:cart.deliveryMethodId,
      shippingAddress
    }
  }

  private async getAddressFromStripeAddress(): Promise<Address | ShippingAddress | null> {
    const result = await this.addressElement?.getValue();
    const address = result?.value.address;

    if (address) {
      return {
        name: result.value.name,
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        country: address.country,
        state: address.state,
        postalCode: address.postal_code,
        phoneNumber: result.value.phone || undefined
      }
    } else {
      return null;
    }
  }

  onSaveAddressCheckboxChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }

  async getConfirmationToken() {
    try {
      if (Object.values(this.completionStatus()).every(status => status === true)) {
        const result = await this.stripeService.createConfirmationToken();
        if (result.error) throw new Error(result.error.message);
        this.confirmationToken = result.confirmationToken;
        console.log(this.confirmationToken)
      }
    } catch (error: any) {
      this.snackbar.error(error.message);
    }
  }

  async confirmPayment(stepper: MatStepper) {
    this.loading = true;
    try {
      if (this.confirmationToken) {
        const result = await this.stripeService.confirmPayment(this.confirmationToken);
        if (result.paymentIntent?.status === 'succeeded') {
          const order = await this.createOrderModel();
          const orderResult = await firstValueFrom(this.orderService.createOrder(order));
          if (!orderResult) {
            throw new Error('Order creation failed');
          }
          this.orderService.orderComplete = true;
          //if sucess, remove the cart and delivery method
          this.cartService.deleteCart();
          this.cartService.selectedDelivery.set(null);

          this.router.navigateByUrl('/checkout/success');
        
        } else if (result.error) {
            throw new Error(result.error.message);
        } else {
          throw new Error('Something went wrong');
        }
      }
    } catch (error: any) {
      this.snackbar.error(error.message || 'Something went wrong');
      //if error, redirect to previos step
      stepper.previous();
    } finally {
      this.loading = false;
    }
  }
}
