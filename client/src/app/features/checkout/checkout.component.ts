import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { StripeAddressElement } from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';
import { StripeService } from '../../core/services/stripe.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { AccountService } from '../../core/services/account.service';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { firstValueFrom } from 'rxjs';
import { Address } from '../../shared/models/users';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';

@Component({
  selector: 'app-checkout',
  imports: [
    OrderSummaryComponent,
    MatStepperModule,
    MatButton,
    RouterLink,
    MatCheckboxModule,
    CheckoutDeliveryComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private stripeService = inject(StripeService);
  private accountService = inject(AccountService);
  private snackbar = inject(SnackbarService);
  addressElement?: StripeAddressElement;
  saveAddress = false;

  async ngOnInit(){
    try {
      this.addressElement = await this.stripeService.createAddressElement();
      //stripe will attach the address for us
      this.addressElement.mount('#address-element');
    }catch (error:any) {
      this.snackbar.error(error.message);
    }
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
        const address = await this.getAddressFromStripeAddress();
        address && firstValueFrom(this.accountService.updateAddress(address));
      }
    }
  }
  private async getAddressFromStripeAddress(): Promise<Address | null> {
    const result = await this.addressElement?.getValue();
    const address = result?.value.address;

    if (address) {
      return {
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        country: address.country,
        state: address.state,
        postalCode: address.postal_code
      }
    } else {
      return null;
    }
  }

  onSaveAddressCheckboxChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }
}
