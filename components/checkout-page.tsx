"use client"

import Image from "next/image"
import Link from "next/link"
import {
  type ChangeEvent,
  type FormEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { ArrowLeft, Lock, ShieldCheck, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { validateDiscountAction } from "@/lib/actions/discountActions"
import { formatPrice } from "@/lib/utils/format"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"

interface CheckoutFormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface DiscountApplyState {
  status: string
  message: string
  code: string
  amount: number
  cartTotal: number
}

type PaymentMethod = "card" | "paypal" | "apple-pay" | "bank-transfer"

const initialForm: CheckoutFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Laos",
}

const initialDiscountState: DiscountApplyState = {
  status: "idle",
  message: "",
  code: "",
  amount: 0,
  cartTotal: 0,
}

const paymentMethodLabel: Record<PaymentMethod, string> = {
  card: "Credit or Debit Card",
  paypal: "PayPal",
  "apple-pay": "Apple Pay",
  "bank-transfer": "Bank Transfer",
}

export function CheckoutPage() {
  const { items, clearCart } = useCart()
  const { toast } = useToast()
  const [form, setForm] = useState<CheckoutFormState>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [discountCode, setDiscountCode] = useState("")
  const [discountState, applyDiscountAction, isApplyingDiscount] = useActionState(
    validateDiscountAction,
    initialDiscountState,
  )
  const lastDiscountMessageRef = useRef<string>("")

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )
  const shipping = subtotal === 0 || subtotal >= 500000 ? 0 : 30000
  const discountAmount = discountState.status === "success" ? discountState.amount : 0
  const total = Math.max(0, subtotal - discountAmount + shipping)

  useEffect(() => {
    if (!discountState.message || discountState.message === lastDiscountMessageRef.current) {
      return
    }

    lastDiscountMessageRef.current = discountState.message

    toast({
      title: discountState.status === "success" ? "Discount applied" : "Discount unavailable",
      description: discountState.message,
      variant: discountState.status === "error" ? "destructive" : "default",
    })
  }, [discountState, toast])

  const onChange = (field: keyof CheckoutFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!items.length) {
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const nextOrder = `GFW-${Date.now().toString().slice(-6)}`
    setOrderNumber(nextOrder)
    clearCart()

    setIsSubmitting(false)
    toast({
      title: "Order placed",
      description: `${nextOrder} placed with ${paymentMethodLabel[paymentMethod]}.${
        discountAmount > 0 ? ` Discount applied: ${discountState.code}.` : ""
      }`,
    })
  }

  if (orderNumber) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-24 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Order Confirmed</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Thanks for your order.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Reference number: {orderNumber}</p>
          <p className="mt-1 text-sm text-muted-foreground">Payment method: {paymentMethodLabel[paymentMethod]}</p>
          <p className="mt-1 text-sm text-muted-foreground">Order total: {formatPrice(total)}</p>
          {discountAmount > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Discount applied: {discountState.code} (-{formatPrice(discountAmount)})
            </p>
          ) : null}
          <p className="mt-4 text-sm text-muted-foreground">
            This checkout is still frontend workflow mode. Discount validation is live, but order
            persistence and discount usage counting still need the full backend checkout flow.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-none px-6">
              <Link href="/">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-none px-6">
              <Link href="/drop">Go to Drop Page</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (!items.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-24 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Checkout</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Your cart is empty.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add products to your cart, then return here to complete checkout.
          </p>
          <div className="mt-8">
            <Button asChild className="rounded-none px-6">
              <Link href="/">Back to Shop</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-24 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Checkout</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Complete your order</h1>
        </div>
        <Button asChild variant="outline" className="rounded-none">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-muted-foreground">Contact</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" value={form.firstName} onChange={onChange("firstName")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" value={form.lastName} onChange={onChange("lastName")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={onChange("email")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={onChange("phone")} required />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-muted-foreground">Shipping</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={onChange("address")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={onChange("city")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input id="state" value={form.state} onChange={onChange("state")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Zip Code</Label>
                <Input id="zip" value={form.zipCode} onChange={onChange("zipCode")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} onChange={onChange("country")} required />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-muted-foreground">Payment</h2>
            <div className="mt-4 space-y-4">
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="gap-2"
              >
                <Label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3">
                  <RadioGroupItem value="card" id="payment-card" />
                  <span className="text-sm">Credit or Debit Card</span>
                </Label>
                <Label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3">
                  <RadioGroupItem value="paypal" id="payment-paypal" />
                  <span className="text-sm">PayPal</span>
                </Label>
                <Label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3">
                  <RadioGroupItem value="apple-pay" id="payment-apple-pay" />
                  <span className="text-sm">Apple Pay</span>
                </Label>
                <Label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3">
                  <RadioGroupItem value="bank-transfer" id="payment-bank-transfer" />
                  <span className="text-sm">Bank Transfer</span>
                </Label>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="grid gap-4 rounded-md border border-border bg-secondary/20 p-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="card-name">Name on Card</Label>
                    <Input
                      id="card-name"
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                      placeholder="Cardholder Name"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-expiry">Expiry</Label>
                    <Input
                      id="card-expiry"
                      value={cardExpiry}
                      onChange={(event) => setCardExpiry(event.target.value)}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-cvc">CVC</Label>
                    <Input
                      id="card-cvc"
                      value={cardCvc}
                      onChange={(event) => setCardCvc(event.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod !== "card" && (
                <div className="rounded-md border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                  {paymentMethodLabel[paymentMethod]} selected. You can hook this choice to your backend payment
                  provider next.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-md border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Secure checkout UI for frontend development mode.</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-none py-6 text-sm font-bold uppercase tracking-widest"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        </form>

        <aside className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-muted-foreground">Order Summary</h2>

          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="flex gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                <div className="relative h-16 w-16 overflow-hidden rounded-md bg-secondary">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity}
                    {item.size ? ` | ${item.size}` : ""}
                    {item.color ? ` | ${item.color}` : ""}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
              </article>
            ))}
          </div>

          <form action={applyDiscountAction} className="space-y-3 border-t border-border pt-4">
            <input type="hidden" name="cartTotal" value={subtotal} />
            <div className="space-y-2">
              <Label htmlFor="discount-code">Discount Code</Label>
              <div className="flex gap-2">
                <Input
                  id="discount-code"
                  name="code"
                  value={discountCode}
                  onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="uppercase"
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="rounded-none px-4"
                  disabled={isApplyingDiscount || discountCode.trim().length === 0}
                >
                  {isApplyingDiscount ? "Applying..." : "Apply"}
                </Button>
              </div>
              {discountState.message ? (
                <p
                  className={`text-xs ${
                    discountState.status === "success" ? "text-emerald-500" : "text-destructive"
                  }`}
                >
                  {discountState.message}
                </p>
              ) : null}
            </div>
          </form>

          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="tabular-nums">
                {discountAmount > 0 ? `-${formatPrice(discountAmount)}` : formatPrice(0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5" />
              Shipping is free over {formatPrice(500000)}.
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Discount codes are validated live before checkout submission.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
