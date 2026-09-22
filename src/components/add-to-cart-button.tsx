"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, type CartItem } from "@/lib/store";
import { CartIcon, CheckIcon } from "./icons";
import { buttonClass, cx } from "./ui";

/** Reusable Add to Cart control used on hosting, shop and service pages. */
export function AddToCartButton({
  item,
  label = "Add to Cart",
  quantity = 1,
  variant = "primary",
  size = "md",
  className,
  showIcon = true,
}: {
  item: Omit<CartItem, "quantity">;
  label?: string;
  quantity?: number;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add(item, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }}
      className={cx(buttonClass(variant, size), className)}
      aria-label={`${label}: ${item.name}`}
    >
      {added ? (
        <>
          <CheckIcon className="size-4" /> Added to cart
        </>
      ) : (
        <>
          {showIcon && <CartIcon className="size-4" />}
          {label}
        </>
      )}
    </button>
  );
}

/** Adds the item then goes straight to checkout. */
export function BuyNowButton({
  item,
  quantity = 1,
  label = "Buy Now",
  variant = "primary",
  size = "md",
  className,
}: {
  item: Omit<CartItem, "quantity">;
  quantity?: number;
  label?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { add } = useCart();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        add(item, quantity);
        router.push("/checkout");
      }}
      className={cx(buttonClass(variant, size), className)}
    >
      {label}
    </button>
  );
}
