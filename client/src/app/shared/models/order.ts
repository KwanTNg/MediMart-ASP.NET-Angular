export type Order = {
  id: number
  orderDate: string
  buyerEmail: string
  shippingAddress: ShippingAddress
  deliveryMethod: string
  shippingPrice: number
  paymentSummary: PaymentSummary
  orderItems: OrderItem[]
  subtotal: number
  status: string
  paymentIntentId: string
  total: number
  deliveryDate?: string;
}

export type ShippingAddress = {
  name: string
  line1: string
  line2?: any
  city: string
  state: string
  postalCode: string
  country: string,
  phoneNumber: string
}

export type PaymentSummary = {
  last4: number
  brand: string
  expMonth: number
  expYear: number
}

export type OrderItem = {
  id: number
  productId: number
  productName: string
  pictureUrl: string
  price: number
  quantity: number
}

//create another interface to match Dto in API
export type OrderToCreate = {
    cartId: string
    deliveryMethodId: number
    shippingAddress: ShippingAddress
    paymentSummary: PaymentSummary
}