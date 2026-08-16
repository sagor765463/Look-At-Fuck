import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import CheckoutModal from '@/components/CheckoutModal';

export default function CartDrawer() {
  const { items, total, isOpen, closeCart, updateQty, removeItem, clear } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="flex items-center gap-2 font-heading text-lg font-bold"><ShoppingBag className="h-5 w-5 text-primary" /> Your Cart</h3>
          <Button variant="ghost" size="icon" onClick={closeCart}><X className="h-5 w-5" /></Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild onClick={closeCart}><Link to="/shop">Start Shopping</Link></Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.map(it => (
                <div key={it.id} className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <img src={it.image} alt={it.name} className="h-16 w-16 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${it.id}`} onClick={closeCart} className="line-clamp-1 text-sm font-medium hover:text-primary">{it.name}</Link>
                    <p className="text-xs text-muted-foreground">{it.brand}</p>
                    <p className="text-sm font-semibold text-primary">৳{it.price.toLocaleString()}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(it.id, it.qty - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-6 text-center text-sm">{it.qty}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(it.id, it.qty + 1)}><Plus className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="ml-auto h-6 w-6 text-destructive" onClick={() => removeItem(it.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-border p-4">
              <div className="flex items-center justify-between font-heading text-lg font-bold">
                <span>Total</span><span className="text-primary">৳{total.toLocaleString()}</span>
              </div>
              <Button className="w-full" onClick={() => setCheckoutOpen(true)}>Checkout</Button>
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={clear}>Clear Cart</Button>
            </div>
          </>
        )}
        <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      </aside>
    </div>
  );
}