import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { PaymentMethod, Order } from '../types';
import { COUNTRIES, BD_64_DISTRICTS, Country, DistrictData } from '../data/geoData';
import { PaymentGatewayModal } from '../components/PaymentGatewayModal';
import {
  ShoppingBasket,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ArrowRight,
  Phone,
  MapPin,
  User,
  CreditCard,
  FileText,
  ArrowLeft,
  Globe,
  Building,
  Mail,
  HelpCircle,
  AlertCircle,
  Printer,
  Download,
  Plus,
  Minus,
  Trash2,
  X,
  MessageCircle,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    directBuyItem,
    setDirectBuyItem,
    updateCartQty,
    removeFromCart,
    deliveryConfig,
    paymentConfig,
    createOrder,
    clearCart,
    applyCoupon,
    navigateToHome,
    navigateToTracking,
    openInvoiceModal,
    navigateBack,
    language,
    showToast,
    syncCustomerServerCart,
    currentCustomer,
    getComboDiscountForProduct,
    products,
    checkoutUpsells,
  } = useShop();

  const [selectedUpsellId, setSelectedUpsellId] = useState<string | null>(null);

  const [directAddonItems, setDirectAddonItems] = useState<any[]>(() => {
    try {
      const raw = sessionStorage.getItem('bastra_pdp_addon_items');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const itemsToCheckout = directBuyItem ? [directBuyItem, ...directAddonItems] : cart;
  const checkoutSubtotal = useMemo(() => {
    return itemsToCheckout.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  }, [itemsToCheckout]);

  // Find eligible upsell matching items in cart or targetCategory
  const eligibleUpsell = useMemo(() => {
    if (!checkoutUpsells || checkoutUpsells.length === 0) return null;
    const active = checkoutUpsells.filter((u) => u.isActive);
    if (active.length === 0) return null;

    // Check if any cart item matches targetCategory
    for (const upsell of active) {
      const target = (upsell.targetCategory || 'ALL').toUpperCase();
      if (target === 'ALL') return upsell;

      const hasMatch = itemsToCheckout.some((itm) => {
        const p = products.find((pr) => pr.id === (itm.item.productId || itm.item.id)) || (itm.item as any);
        const cat = (p.category || '').toUpperCase();
        const sub = (p.subCategory || '').toUpperCase();
        const name = (p.name || '').toUpperCase();
        const bName = (p.banglaName || '').toUpperCase();
        return (
          cat === target ||
          sub === target ||
          cat.includes(target) ||
          sub.includes(target) ||
          name.includes(target) ||
          bName.includes(target)
        );
      });
      if (hasMatch) return upsell;
    }
    return active[0] || null;
  }, [checkoutUpsells, itemsToCheckout, products]);

  const activeUpsellPrice = selectedUpsellId && eligibleUpsell?.id === selectedUpsellId ? eligibleUpsell.upsellPrice : 0;

  const handleIncreaseQty = (sku: string) => {
    if (directBuyItem) {
      setDirectBuyItem({
        ...directBuyItem,
        quantity: directBuyItem.quantity + 1,
        item: { ...directBuyItem.item, quantity: directBuyItem.quantity + 1 },
      });
    } else {
      const itm = cart.find((c) => c.item.sku === sku);
      if (itm) {
        updateCartQty(sku, itm.quantity + 1);
      }
    }
  };

  const handleDecreaseQty = (sku: string) => {
    if (directBuyItem) {
      if (directBuyItem.item.sku === sku) {
        if (directBuyItem.quantity > 1) {
          setDirectBuyItem({
            ...directBuyItem,
            quantity: directBuyItem.quantity - 1,
            item: { ...directBuyItem.item, quantity: directBuyItem.quantity - 1 },
          });
        } else {
          showToast('মূল পোশাকের পরিমাণ কমপক্ষে ১টি হতে হবে');
        }
      } else {
        setDirectAddonItems((prev) => {
          const next = prev.map((a) => (a.item.sku === sku ? { ...a, quantity: Math.max(1, a.quantity - 1) } : a));
          try {
            sessionStorage.setItem('bastra_pdp_addon_items', JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    } else {
      const itm = cart.find((c) => c.item.sku === sku);
      if (itm) {
        updateCartQty(sku, itm.quantity - 1);
      }
    }
  };

  const handleRemoveItem = (sku: string) => {
    if (directBuyItem) {
      if (directBuyItem.item.sku === sku) {
        showToast('প্রোডাক্ট বিবরণী থেকে অর্ডারের মূল পোশাকটি চেকআউট থেকে রিমুভ করা যাবে না');
        return;
      } else {
        setDirectAddonItems((prev) => {
          const next = prev.filter((a) => a.item.sku !== sku);
          try {
            sessionStorage.setItem('bastra_pdp_addon_items', JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    } else {
      removeFromCart(sku);
    }
  };

  // Customer Information
  const [customerName, setCustomerName] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('BD');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Domestic Address (Bangladesh)
  const [selectedDistrictId, setSelectedDistrictId] = useState('sirajganj');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [deliveryAreaDetails, setDeliveryAreaDetails] = useState('');

  // International Address (Outside Bangladesh)
  const [stateProvince, setStateProvince] = useState('');
  const [cityTown, setCityTown] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [internationalStreet, setInternationalStreet] = useState('');

  // General Order Notes
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [paymentTxnId, setPaymentTxnId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponBarOpen, setIsCouponBarOpen] = useState(false);

  // Success State
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const justPlacedOrderRef = useRef<boolean>(false);
  const [activeGatewaySession, setActiveGatewaySession] = useState<{
    orderId: string;
    amount: number;
    gateway: 'bkash' | 'nagad' | 'sslcommerz' | 'card';
    paymentId?: string;
    orderData?: any;
  } | null>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === selectedCountryCode) || COUNTRIES[0];
  const isDomestic = selectedCountry.isDomestic === true;

  // Selected district object & upazilas
  const currentDistrict =
    BD_64_DISTRICTS.find((d) => d.id === selectedDistrictId) || BD_64_DISTRICTS[0];

  // Auto-fill customer details from logged-in account (currentCustomer) or saved details
  useEffect(() => {
    if (currentCustomer) {
      if (currentCustomer.name) setCustomerName(currentCustomer.name);
      if (currentCustomer.phone) {
        // Strip country code if prefixed
        const cleanP = currentCustomer.phone.replace(/^\+880\s?/, '').replace(/^880/, '');
        setCustomerPhone(cleanP);
      }
      if (currentCustomer.email) setCustomerEmail(currentCustomer.email);
      if (currentCustomer.countryCode) setSelectedCountryCode(currentCustomer.countryCode);
      if (currentCustomer.address) setDeliveryAreaDetails(currentCustomer.address);
      if (currentCustomer.district) {
        const foundD = BD_64_DISTRICTS.find(
          (d) =>
            d.banglaName === currentCustomer.district ||
            d.name.toLowerCase() === (currentCustomer.district || '').toLowerCase()
        );
        if (foundD) setSelectedDistrictId(foundD.id);
      }
      if (currentCustomer.upazila) setSelectedUpazila(currentCustomer.upazila);
    } else {
      try {
        const saved = localStorage.getItem('bastra_customer_details') || localStorage.getItem('bastra_current_customer');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name && !customerName) setCustomerName(parsed.name);
          if (parsed.phone && !customerPhone) {
            setCustomerPhone(parsed.phone.replace(/^\+880\s?/, '').replace(/^880/, ''));
          }
          if (parsed.email && !customerEmail) setCustomerEmail(parsed.email);
          if (parsed.countryCode) setSelectedCountryCode(parsed.countryCode);
          if (parsed.address && !deliveryAreaDetails) setDeliveryAreaDetails(parsed.address);
          if (parsed.districtId) {
            setSelectedDistrictId(parsed.districtId);
          } else if (parsed.district) {
            const foundD = BD_64_DISTRICTS.find(
              (d) =>
                d.banglaName === parsed.district ||
                d.name.toLowerCase() === (parsed.district || '').toLowerCase()
            );
            if (foundD) setSelectedDistrictId(foundD.id);
          }
          if (parsed.upazila && !selectedUpazila) setSelectedUpazila(parsed.upazila);
        }
      } catch {}
    }
  }, [currentCustomer]);

  // Auto-default Upazila when district changes if current Upazila is not in the district
  useEffect(() => {
    if (isDomestic && currentDistrict?.upazilas?.length > 0) {
      if (!selectedUpazila || !currentDistrict.upazilas.includes(selectedUpazila)) {
        setSelectedUpazila(currentDistrict.upazilas[0]);
      }
    }
  }, [selectedDistrictId, currentDistrict, isDomestic, selectedUpazila]);

  // Auto-save form changes to localStorage so customer never has to re-type on refresh or return
  useEffect(() => {
    if (customerName || customerPhone || deliveryAreaDetails) {
      try {
        const details = {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          countryCode: selectedCountryCode,
          district: currentDistrict?.banglaName || currentDistrict?.name,
          districtId: selectedDistrictId,
          upazila: selectedUpazila,
          address: deliveryAreaDetails,
        };
        localStorage.setItem('bastra_customer_details', JSON.stringify(details));
      } catch {}
    }
  }, [customerName, customerPhone, customerEmail, selectedCountryCode, selectedDistrictId, selectedUpazila, deliveryAreaDetails, currentDistrict]);

  // Adjust payment method if switching to International or if current method is disabled
  useEffect(() => {
    const isCodActive = paymentConfig.enableCod ?? (paymentConfig as any).isCodActive ?? true;
    const isBkashActive = Boolean(paymentConfig.enableBkash || (paymentConfig as any).isBkashActive);
    const isNagadActive = Boolean(paymentConfig.enableNagad || (paymentConfig as any).isNagadActive);
    const isRocketActive = Boolean(paymentConfig.enableRocket || (paymentConfig as any).isRocketActive);
    const isUpayActive = Boolean(paymentConfig.enableUpay || (paymentConfig as any).isUpayActive);

    if (!isDomestic) {
      // International doesn't allow COD
      if (paymentMethod === 'cod') {
        setPaymentMethod('international_card');
      }
    } else {
      if (paymentMethod === 'international_card' || paymentMethod === 'bank_transfer') {
        if (isCodActive) setPaymentMethod('cod');
        else if (isBkashActive) setPaymentMethod('bkash');
        else if (isNagadActive) setPaymentMethod('nagad');
        else setPaymentMethod('card');
      } else if (paymentMethod === 'cod' && !isCodActive) {
        if (isBkashActive) setPaymentMethod('bkash');
        else if (isNagadActive) setPaymentMethod('nagad');
        else if (isRocketActive) setPaymentMethod('rocket');
        else if (isUpayActive) setPaymentMethod('upay');
        else setPaymentMethod('card');
      }
    }
  }, [selectedCountryCode, isDomestic, paymentConfig]);

  // When visiting checkout with cart items (not right after Buy-Now completion), ensure previous completed order screen is cleared
  useEffect(() => {
    if (justPlacedOrderRef.current) {
      return;
    }
    if (itemsToCheckout.length > 0 && createdOrderId) {
      setCreatedOrderId(null);
      setCompletedOrder(null);
    }
  }, [itemsToCheckout.length]);

  // Delivery Calculations
  const isSirajganj = isDomestic && (selectedDistrictId === 'sirajganj' || selectedDistrictId === 'sirajgonj');
  const isFreeDelivery = isDomestic && checkoutSubtotal >= (deliveryConfig.freeDeliveryThreshold || 2000);

  let deliveryCharge = 0;
  if (!isDomestic) {
    // International shipping rate (Standard air courier)
    deliveryCharge = 2200;
  } else if (isFreeDelivery) {
    deliveryCharge = 0;
  } else if (isSirajganj) {
    deliveryCharge = deliveryConfig.insideSirajganjCharge ?? 70;
  } else {
    deliveryCharge = deliveryConfig.outsideSirajganjCharge ?? 130;
  }

  const comboDiscountAmount = useMemo(() => {
    let disc = 0;
    for (const itm of itemsToCheckout) {
      const fullProd = products.find((p) => p.id === (itm.item.productId || itm.item.id)) || (itm.item as any);
      const info = getComboDiscountForProduct(fullProd);
      if (info && info.hasDiscount) {
        const originalPrice = itm.item.price || fullProd.price || 0;
        const diff = originalPrice - info.discountedPrice;
        disc += Math.max(0, diff * itm.quantity);
      }
    }
    return disc;
  }, [itemsToCheckout, products, getComboDiscountForProduct]);

  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const discountAmount = couponDiscountAmount + comboDiscountAmount;
  const grandTotal = Math.max(0, checkoutSubtotal + deliveryCharge + activeUpsellPrice - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);
    const res = applyCoupon(couponInput, checkoutSubtotal);
    if (res.valid) {
      setAppliedCoupon({
        code: couponInput.trim().toUpperCase(),
        discount: res.discount,
        message: res.message,
      });
    } else {
      setCouponError(res.message);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast(language === 'en' ? 'Please enter your full name.' : 'অনুগ্রহ করে আপনার পূর্ণ নাম প্রদান করুন।');
      return;
    }

    if (!customerPhone.trim()) {
      showToast(language === 'en' ? 'Please enter a valid phone number.' : 'অনুগ্রহ করে আপনার সচল মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    if (isDomestic) {
      if (!deliveryAreaDetails.trim()) {
        showToast(
          language === 'en'
            ? 'Please provide your full delivery address (House, Road, Area).'
            : 'অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা) প্রদান করুন।'
        );
        return;
      }
    } else {
      if (!cityTown.trim() || !internationalStreet.trim() || !postalCode.trim()) {
        showToast(
          language === 'en'
            ? 'Please provide complete international address details (City, Street, Postal Code).'
            : 'অনুগ্রহ করে আন্তর্জাতিক ডেলিভারির জন্য সম্পূর্ণ ঠিকানা, শহর ও পোস্টাল কোড প্রদান করুন।'
        );
        return;
      }
    }

    if (itemsToCheckout.length === 0) {
      showToast(language === 'en' ? 'Your order is empty!' : 'আপনার অর্ডারে কোনো পোশাক নেই!');
      return;
    }

    if (!agreedToTerms) {
      showToast(
        language === 'en'
          ? 'Please read and agree to the website terms and conditions.'
          : 'অনুগ্রহ করে ওয়েবসাইটের শর্তাবলীতে সম্মতি প্রদান করুন।'
      );
      return;
    }

    const toAsciiDigits = (val: string) =>
      String(val || '').replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

    const normalizedDigits = toAsciiDigits(customerPhone).replace(/\D/g, '');
    let fullPhone = `${selectedCountry.dialCode} ${normalizedDigits}`;
    if (isDomestic) {
      let bdDigits = normalizedDigits;
      if (bdDigits.startsWith('00880')) bdDigits = bdDigits.slice(4);
      else if (bdDigits.startsWith('8801')) bdDigits = bdDigits.slice(2);
      else if (bdDigits.startsWith('880')) bdDigits = '0' + bdDigits.slice(3);
      else if (bdDigits.length === 10 && bdDigits.startsWith('1')) bdDigits = '0' + bdDigits;

      if (!/^01[3-9]\d{8}$/.test(bdDigits)) {
        showToast(
          language === 'en'
            ? 'Please enter a valid 11-digit Bangladesh mobile number (e.g. 017XXXXXXXX).'
            : 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর (যেমন: 017XXXXXXXX) প্রদান করুন।'
        );
        return;
      }
      fullPhone = bdDigits;
    } else if (normalizedDigits.length < 6) {
      showToast(
        language === 'en'
          ? 'Please enter a valid international phone number.'
          : 'অনুগ্রহ করে সঠিক আন্তর্জাতিক মোবাইল নম্বর প্রদান করুন।'
      );
      return;
    }

    const fullAddress = isDomestic
      ? `${deliveryAreaDetails}, ${selectedUpazila}, ${currentDistrict.banglaName} (${currentDistrict.name})`
      : `${internationalStreet}, ${cityTown}, ${stateProvince ? stateProvince + ', ' : ''}${postalCode}, ${selectedCountry.name}`;

    const clearOrderedItems = () => {
      justPlacedOrderRef.current = true;
      try {
        sessionStorage.removeItem('bastra_selected_pdp_addons');
        sessionStorage.removeItem('bastra_pdp_addon_items');
      } catch {}
      setDirectAddonItems([]);
      if (directBuyItem) {
        setDirectBuyItem(null);
      } else {
        clearCart();
      }
    };

    setIsSubmitting(true);

    const placeOrderBackend = async () => {
      try {
        const payload = {
          customerName: customerName.trim(),
          customerPhone: fullPhone,
          customerEmail: customerEmail.trim() || undefined,
          deliveryAddress: fullAddress,
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
          postalCode: isDomestic ? undefined : postalCode.trim(),
          district: isDomestic ? currentDistrict.name : cityTown.trim(),
          upazila: isDomestic ? selectedUpazila : stateProvince.trim(),
          paymentMethod,
          paymentTxnId: paymentTxnId.trim() || undefined,
          couponCode: appliedCoupon?.code,
          customerNotes: customerNotes.trim(),
          selectedUpsellId: selectedUpsellId || undefined,
          selectedAddons: (() => {
            try {
              const raw = sessionStorage.getItem('bastra_selected_pdp_addons');
              return raw ? JSON.parse(raw) : undefined;
            } catch {
              return undefined;
            }
          })(),
          items: itemsToCheckout.map((c) => ({
            productId: c.item.productId,
            variantId: c.item.variantId,
            quantity: c.quantity,
            price: c.item.price,
            productName: c.item.productName,
            banglaName: c.item.banglaName,
            sku: c.item.sku,
            image: c.item.image,
          })),
        };

        const res = await fetch('/api/checkout/place-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && (data.order || data.orderId)) {
          const bo = data.order || {};
          const finalOrderId = data.orderId || bo.id;

          // Synchronize locally without overwriting backend ID
          createOrder(
            {
              id: finalOrderId,
              customerName: bo.customerName || bo.customer_name || customerName.trim(),
              customerPhone: bo.customerPhone || bo.customer_phone || fullPhone,
              customerEmail: bo.customerEmail || bo.customer_email || customerEmail.trim() || undefined,
              deliveryAddress: bo.deliveryAddress || bo.delivery_address || fullAddress,
              district: bo.district || (isDomestic ? currentDistrict.name : cityTown.trim()),
              upazila: bo.upazila || (isDomestic ? selectedUpazila : stateProvince.trim()),
              country: selectedCountry.name,
              countryCode: selectedCountry.code,
              items: Array.isArray(bo.items) && bo.items.length > 0 ? bo.items : itemsToCheckout.map((c) => c.item),
              subtotal: bo.subtotal ?? checkoutSubtotal,
              deliveryCharge: bo.deliveryCharge ?? bo.delivery_charge ?? deliveryCharge,
              discount: bo.discount ?? discountAmount,
              couponCode: bo.couponCode || bo.coupon_code || appliedCoupon?.code,
              total: bo.total ?? grandTotal,
              paymentMethod: bo.paymentMethod || bo.payment_method || paymentMethod,
              paymentStatus: bo.paymentStatus || bo.payment_status || 'pending',
              paymentTxnId: bo.paymentTxnId || bo.payment_txn_id || paymentTxnId.trim(),
              orderStatus: bo.orderStatus || bo.order_status || 'pending',
              customerNotes: bo.customerNotes || bo.customer_notes || customerNotes.trim(),
              orderDate: bo.orderDate || bo.order_date,
              timeline: bo.timeline,
            },
            true
          );

          // If payment method is an online gateway (bkash, nagad, card, sslcommerz)
          if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'card') {
            try {
              const initRes = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: finalOrderId,
                  gateway: paymentMethod === 'card' ? 'sslcommerz' : paymentMethod,
                }),
              });
              const initData = await initRes.json();
              if (initData.success) {
                if (initData.mode === 'redirect' && initData.paymentUrl?.startsWith('http')) {
                  window.location.href = initData.paymentUrl;
                  return;
                }
                setActiveGatewaySession({
                  orderId: finalOrderId,
                  amount: bo.total ?? grandTotal,
                  gateway: (paymentMethod === 'card' ? 'sslcommerz' : paymentMethod) as any,
                  paymentId: initData.paymentId,
                  orderData: bo,
                });
                setIsSubmitting(false);
                return;
              }
            } catch (pErr) {
              console.warn('Payment initiation error, proceeding to direct order confirmation:', pErr);
            }
          }

          const fullOrderSnapshot: Order = data.order || {
            id: finalOrderId,
            customerName: customerName.trim(),
            customerPhone: fullPhone,
            customerEmail: customerEmail.trim() || undefined,
            deliveryAddress: fullAddress,
            country: selectedCountry.name,
            countryCode: selectedCountry.code,
            district: isDomestic ? currentDistrict.name : cityTown.trim(),
            upazila: isDomestic ? selectedUpazila : stateProvince.trim(),
            postalCode: isDomestic ? undefined : postalCode.trim(),
            stateProvince: isDomestic ? undefined : stateProvince.trim(),
            items: itemsToCheckout.map((c) => ({
              ...c.item,
              unitPrice: c.item.price,
              totalPrice: c.item.price * c.quantity,
              quantity: c.quantity,
            })),
            subtotal: checkoutSubtotal,
            deliveryCharge,
            discount: discountAmount,
            couponCode: appliedCoupon?.code,
            total: grandTotal,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : paymentTxnId ? 'paid' : 'pending',
            paymentTxnId: paymentTxnId || undefined,
            orderStatus: 'pending',
            orderDate: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            timeline: [],
          };

          setCompletedOrder(fullOrderSnapshot);
          clearOrderedItems();
          setCreatedOrderId(finalOrderId);
          setIsSubmitting(false);
          return;
        }

        if (!res.ok && res.status >= 400 && res.status < 500) {
          showToast(
            data?.error ||
              (language === 'en'
                ? 'Could not place order. Please review your order details.'
                : 'অর্ডার সম্পন্ন করা যায়নি। অনুগ্রহ করে প্রদত্ত তথ্য যাচাই করুন।')
          );
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.warn('Backend order placement API warning, falling back to local creation:', err);
      }

      // Network/5xx Offline Fallback creation
      const localOrder = createOrder({
        customerName: customerName.trim(),
        customerPhone: fullPhone,
        customerEmail: customerEmail.trim() || undefined,
        deliveryAddress: fullAddress,
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        district: isDomestic ? currentDistrict.name : cityTown.trim(),
        upazila: isDomestic ? selectedUpazila : stateProvince.trim(),
        postalCode: isDomestic ? undefined : postalCode.trim(),
        stateProvince: isDomestic ? undefined : stateProvince.trim(),
        items: itemsToCheckout.map((c) => ({
          ...c.item,
          unitPrice: c.item.price,
          totalPrice: c.item.price * c.quantity,
          quantity: c.quantity,
        })),
        subtotal: checkoutSubtotal,
        deliveryCharge,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        total: grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : paymentTxnId ? 'paid' : 'pending',
        paymentTxnId: paymentTxnId || undefined,
        orderStatus: 'pending',
        customerNotes: customerNotes.trim(),
      });

      setCompletedOrder(localOrder);
      clearOrderedItems();
      setCreatedOrderId(localOrder.id);
      setIsSubmitting(false);
    };

    placeOrderBackend();
  };

  const handleDownloadInvoice = (orderToDownload: Order) => {
    try {
      const itemsHtml = (orderToDownload.items || [])
        .map(
          (it) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e7e5e4;">
            <div style="font-weight:bold;color:#1c1917;">${it.banglaName || it.productName}</div>
            ${it.variantSummary ? `<div style="font-size:11px;color:#78716c;">${it.variantSummary}</div>` : ''}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #e7e5e4;text-align:center;font-family:monospace;font-size:11px;">${it.sku || 'N/A'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e7e5e4;text-align:right;">৳${it.price || (it as any).unitPrice || 0}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e7e5e4;text-align:center;font-weight:bold;">${it.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e7e5e4;text-align:right;font-weight:bold;color:#1c1917;">৳${it.totalPrice || (it.price || 0) * it.quantity}</td>
        </tr>
      `
        )
        .join('');

      const invoiceHtml = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>Invoice-${orderToDownload.id} - BOSTROSHOILY</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #fff; color: #1c1917; padding: 24px; font-size: 13px; line-height: 1.5; }
    .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #e7e5e4; border-radius: 12px; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1c1917; padding-bottom: 20px; margin-bottom: 24px; }
    .brand-title { font-size: 22px; font-weight: 900; letter-spacing: 1px; color: #1c1917; }
    .brand-sub { font-size: 11px; font-weight: bold; color: #b45309; }
    .invoice-badge { background: #1c1917; color: #fff; font-family: monospace; font-size: 15px; font-weight: bold; padding: 6px 12px; border-radius: 6px; display: inline-block; margin-bottom: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e7e5e4; border-radius: 8px; overflow: hidden; }
    th { background: #1c1917; color: #fff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; }
    .totals { width: 280px; margin-left: auto; font-size: 12px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; color: #57534e; }
    .grand { border-top: 2px solid #1c1917; margin-top: 8px; padding-top: 8px; font-size: 16px; font-weight: 900; color: #1c1917; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">BOSTROSHOILY</div>
        <div class="brand-sub">বস্ত্র শৈলী • ঐতিহ্যবাহী তাঁত ও আধুনিক ফ্যাশন</div>
        <div style="font-size:11px;color:#78716c;margin-top:6px;">শাহজাদপুর, সিরাজগঞ্জ, বাংলাদেশ | হটলাইন: +880 1864-528488</div>
      </div>
      <div style="text-align:right;">
        <div class="invoice-badge">INVOICE #${orderToDownload.id}</div>
        <div style="font-size:12px;color:#78716c;">তারিখ: ${orderToDownload.orderDate || new Date().toLocaleDateString('bn-BD')}</div>
        <div style="font-size:11px;font-weight:bold;color:#047857;margin-top:4px;">পদ্ধতি: ${orderToDownload.paymentMethod.toUpperCase()} (${orderToDownload.paymentStatus.toUpperCase()})</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div style="font-size:10px;font-weight:bold;color:#78716c;text-transform:uppercase;">গ্রাহকের তথ্য (Bill To):</div>
        <div style="font-size:14px;font-weight:bold;color:#1c1917;margin-top:4px;">${orderToDownload.customerName}</div>
        <div style="font-size:12px;color:#44403c;margin-top:2px;">মোবাইল: ${orderToDownload.customerPhone}</div>
      </div>
      <div>
        <div style="font-size:10px;font-weight:bold;color:#78716c;text-transform:uppercase;">ডেলিভারি ঠিকানা:</div>
        <div style="font-size:12px;color:#1c1917;margin-top:4px;">${orderToDownload.deliveryAddress}</div>
        <div style="font-size:11px;color:#78716c;margin-top:2px;">জেলা: ${orderToDownload.district}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>আইটেম বিবরণ</th>
          <th style="text-align:center;">SKU</th>
          <th style="text-align:right;">দর (Rate)</th>
          <th style="text-align:center;">পরিমাণ</th>
          <th style="text-align:right;">মোট (Total)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>সাব-টোটাল:</span><span>৳${orderToDownload.subtotal}</span></div>
      <div class="totals-row"><span>ডেলিভারি চার্জ:</span><span>৳${orderToDownload.deliveryCharge}</span></div>
      ${orderToDownload.discount > 0 ? `<div class="totals-row" style="color:#047857;font-weight:bold;"><span>ছাড় (${orderToDownload.couponCode || 'Promo'}):</span><span>-৳${orderToDownload.discount}</span></div>` : ''}
      <div class="grand"><span>সর্বমোট প্রদেয়:</span><span>৳${orderToDownload.total}</span></div>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>
</body>
</html>
      `;

      const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${orderToDownload.id}-Bostroshoily.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
      }
      showToast('ইনভয়েস ডাউনলোড সম্পন্ন হয়েছে');
    } catch (e) {
      window.print();
    }
  };

  // SUCCESS CONFIRMATION VIEW (With full itemized receipt, print & download options)
  if (createdOrderId) {
    const activeOrderObj = completedOrder || {
      id: createdOrderId,
      customerName,
      customerPhone: `${selectedCountry.dialCode} ${customerPhone}`,
      customerEmail,
      deliveryAddress: isDomestic
        ? `${deliveryAreaDetails}, ${selectedUpazila}, ${currentDistrict.banglaName}`
        : `${internationalStreet}, ${cityTown}, ${postalCode}, ${selectedCountry.name}`,
      district: isDomestic ? currentDistrict.name : cityTown,
      items: [],
      subtotal: cartSubtotal,
      deliveryCharge,
      discount: discountAmount,
      total: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'pending',
      orderDate: new Date().toLocaleDateString('bn-BD'),
      timeline: [],
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-emerald-800 font-bold bg-emerald-100 px-3 py-1 rounded-full">
            {language === 'en' ? 'Order Confirmed Successfully' : 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {language === 'en' ? `Thank you, ${customerName}!` : `ধন্যবাদ, ${customerName}!`}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
            {language === 'en'
              ? 'Your order has been recorded. You can view, print, or download your official invoice below.'
              : 'আপনার অর্ডারটি সফলভাবে সংরক্ষিত হয়েছে। নিচে আপনার অর্ডারের পূর্ণ বিবরণ দেওয়া হলো। আপনি সরাসরি ইনভয়েস প্রিন্ট অথবা ডাউনলোড করতে পারেন।'}
          </p>
        </div>

        {/* Live Notification Status */}
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-center gap-2 text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            আপনার অর্ডারের পূর্ণ বিবরণ সহ ইনস্ট্যান্ট নোটিফিকেশন <strong>bostroshoily@gmail.com</strong> এবং হোয়াটসঅ্যাপ <strong>01864528488</strong> এ পাঠানো হয়েছে।
          </span>
        </div>

        {/* Order Details & Items Card */}
        <div className="p-5 sm:p-7 bg-white rounded-3xl border border-stone-200 text-left space-y-4 shadow-sm">
          <div className="flex flex-wrap justify-between items-center text-xs border-b border-stone-100 pb-3 gap-2">
            <div>
              <span className="text-stone-500 font-medium">অর্ডার আইডি: </span>
              <span className="font-mono font-black text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                #{createdOrderId}
              </span>
            </div>
            <div className="text-stone-600 text-xs">
              তারিখ: <span className="font-bold text-stone-900">{activeOrderObj.orderDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-stone-100 pb-3">
            <div>
              <span className="text-stone-500 block font-bold uppercase text-[10px]">গ্রাহক:</span>
              <span className="font-bold text-stone-900 text-sm">{activeOrderObj.customerName}</span>
              <span className="block text-stone-600 font-mono mt-0.5">{activeOrderObj.customerPhone}</span>
            </div>
            <div>
              <span className="text-stone-500 block font-bold uppercase text-[10px]">ডেলিভারি ঠিকানা:</span>
              <span className="text-stone-900 font-medium block">{activeOrderObj.deliveryAddress}</span>
              <span className="text-stone-600 text-[11px] block">পেমেন্ট: <strong className="uppercase">{activeOrderObj.paymentMethod}</strong> ({activeOrderObj.paymentStatus === 'paid' ? 'পরিশোধিত' : 'ক্যাশ অন ডেলিভারি'})</span>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div>
            <h4 className="font-bold text-xs uppercase text-stone-600 mb-2">
              অর্ডারকৃত পণ্যের তালিকা ({activeOrderObj.items.length} টি আইটেম):
            </h4>
            <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden bg-stone-50/50">
              {activeOrderObj.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-stone-50">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-11 h-11 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                    )}
                    <div>
                      <h5 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">
                        {item.banglaName || item.productName}
                      </h5>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {item.variantSummary || [item.color, item.size].filter(Boolean).join(' • ') || (item.sku ? `SKU: ${item.sku}` : '')}
                      </p>
                      <span className="text-[11px] text-stone-600">
                        ৳{item.price || item.unitPrice || 0} × {item.quantity} টি
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-stone-900 text-sm sm:text-base">
                      ৳{(item.price || item.unitPrice || 0) * item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="pt-2 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-stone-600">
              <span>সাব-টোটাল (পণ্য মূল্য):</span>
              <span className="font-semibold text-stone-900">৳{activeOrderObj.subtotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-semibold text-stone-900">৳{activeOrderObj.deliveryCharge}</span>
            </div>
            {activeOrderObj.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>ছাড় (ডিসকাউন্ট):</span>
                <span>-৳{activeOrderObj.discount}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm sm:text-base pt-2 border-t-2 border-stone-900 font-black">
              <span className="text-stone-900">সর্বমোট প্রদেয় টাকা:</span>
              <span className="text-amber-800 text-xl font-black">৳{activeOrderObj.total}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: WhatsApp Dispatch, View Invoice, Download PDF, Back to Home, Track */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={`https://wa.me/8801864528488?text=${encodeURIComponent(
              `🎉 আসসালামু আলাইকুম, আমি বস্ত্র শৈলী (BOSTROSHOILY)-তে একটি নতুন অর্ডার সম্পন্ন করেছি!\nঅর্ডার আইডি: #${createdOrderId}\nগ্রাহকের নাম: ${activeOrderObj.customerName}\nমোবাইল নম্বর: ${activeOrderObj.customerPhone}\nডেলিভারি ঠিকানা: ${activeOrderObj.deliveryAddress}\nসর্বমোট মূল্য: ৳${activeOrderObj.total}\nপেমেন্ট মেথড: ${activeOrderObj.paymentMethod.toUpperCase()}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none px-5 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপে পাঠান (01864528488)</span>
          </a>

          <button
            type="button"
            onClick={() => openInvoiceModal(activeOrderObj)}
            className="flex-1 sm:flex-none px-5 py-3 bg-stone-950 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>ইনভয়েস দেখুন / প্রিন্ট</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadInvoice(activeOrderObj)}
            className="flex-1 sm:flex-none px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>PDF ডাউনলোড</span>
          </button>

          <button
            type="button"
            onClick={() => {
              justPlacedOrderRef.current = false;
              setCreatedOrderId(null);
              setCompletedOrder(null);
              navigateToHome();
            }}
            className="flex-1 sm:flex-none px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs sm:text-sm font-bold transition-all border border-stone-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোম পেজে ফিরুন</span>
          </button>

          <button
            type="button"
            onClick={() => navigateToTracking(activeOrderObj?.id)}
            className="flex-1 sm:flex-none px-4 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Truck className="w-4 h-4" />
            <span>ট্র্যাক করুন</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold">
            {language === 'en' ? 'Fast & Secure Checkout' : 'নিরাপদ ও দ্রুত অর্ডার'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
            {language === 'en' ? 'Checkout & Place Order' : 'অর্ডার ও চেকআউট'}
          </h1>
        </div>
        <button
          type="button"
          onClick={navigateBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer border border-stone-200"
          title="পূর্বের পেজে ফিরে যান (Back)"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Go Back' : 'পেছনে যান'}</span>
        </button>
      </div>

      {/* TOP EXPANDABLE COUPON NOTICE BAR (As requested: "upore lekha thakbe apnar ki kono coupon code ache? Coupon code dite ekhane click korun.") */}
      <div className="mb-8 rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 transition-all shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-800">
            <Tag className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-medium">
              {language === 'en' ? 'Have a coupon code?' : 'আপনার কি কোনো কুপন কোড আছে?'}
            </span>
            <button
              type="button"
              onClick={() => setIsCouponBarOpen(!isCouponBarOpen)}
              className="font-bold text-amber-900 hover:text-amber-700 underline underline-offset-4 cursor-pointer transition-colors"
            >
              {language === 'en' ? 'Click here to enter your coupon code.' : 'কুপন কোড দিতে এখানে ক্লিক করুন।'}
            </button>
          </div>

          {appliedCoupon && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              কুপন সফল: {appliedCoupon.code} (-৳{appliedCoupon.discount})
            </span>
          )}
        </div>

        {/* Expandable coupon input */}
        {isCouponBarOpen && (
          <div className="mt-4 pt-3 border-t border-amber-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-xs text-stone-600 mb-2">
              {language === 'en'
                ? 'Enter your promotional or discount coupon code below to apply your discount:'
                : 'আপনার ছাড় বা প্রোমো কুপন কোডটি নিচের ঘরে লিখুন এবং "প্রয়োগ করুন" বাটনে চাপ দিন:'}
            </p>
            <div className="flex max-w-md gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="যেমন: BASTRA100 বা EID2026"
                className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm uppercase tracking-wider text-stone-900 focus:outline-hidden focus:border-amber-600 font-mono font-bold"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-5 py-2.5 bg-stone-950 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
              >
                {language === 'en' ? 'Apply Coupon' : 'কুপন প্রয়োগ করুন'}
              </button>
            </div>
            {couponError && <p className="mt-2 text-xs text-rose-600 font-medium">{couponError}</p>}
            {appliedCoupon && (
              <p className="mt-2 text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {appliedCoupon.message}
              </p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Customer Information & Delivery Address (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer Details & Delivery Address (Single Unified One-Page Form) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-sm">
                  ১
                </span>
                <h2 className="font-black text-stone-900 text-base sm:text-lg tracking-tight">
                  {language === 'en' ? 'Customer & Delivery Information' : 'গ্রাহক ও ডেলিভারি তথ্য'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Optional Country Switcher Toggle */}
                <button
                  type="button"
                  onClick={() => setSelectedCountryCode(selectedCountryCode === 'BD' ? 'US' : 'BD')}
                  className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1.5 cursor-pointer transition-colors bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{isDomestic ? 'আন্তর্জাতিক ডেলিভারি?' : 'বাংলাদেশ ডেলিভারি'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 1. Full Name (নাম) */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                  {language === 'en' ? 'Customer Full Name' : 'আপনার পূর্ণ নাম'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. Tanvir Hossain' : 'যেমন: তানভীর হোসেন'}
                  className="w-full bg-white border border-stone-300 rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs"
                />
              </div>

              {/* 2. Active Mobile Number (ফোন নম্বর) */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                  {language === 'en' ? 'Active Mobile Number' : 'সচল মোবাইল নম্বর'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-4 py-3 sm:py-3.5 rounded-l-2xl border border-r-0 border-stone-300 bg-stone-100 text-stone-800 text-sm font-mono font-bold shrink-0">
                    {selectedCountry.dialCode}
                  </span>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    onBlur={() => {
                      const fullPhone = isDomestic ? customerPhone.trim() : `${selectedCountry.dialCode} ${customerPhone.trim()}`;
                      if (customerPhone.trim().length >= 11) {
                        syncCustomerServerCart(fullPhone);
                      }
                    }}
                    placeholder={isDomestic ? '01XXXXXXXXX (১১ ডিজিটের মোবাইল নম্বর)' : 'Mobile number'}
                    className="w-full bg-white border border-stone-300 rounded-r-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* If International is selected, show country dropdown */}
              {!isDomestic && (
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                    {language === 'en' ? 'Country' : 'দেশ নির্বাচন করুন'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base text-stone-900 focus:outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs font-medium cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} - {c.banglaName} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* DOMESTIC BANGLADESH: 3. District & 4. Thana Dropdowns */}
              {isDomestic ? (
                <>
                  {/* 3. 64 Districts Dropdown (জেলা নির্বাচন) */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                      {language === 'en' ? 'District (64 Districts)' : 'জেলা নির্বাচন করুন (৬৪ জেলা)'}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base text-stone-900 focus:outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs font-medium cursor-pointer"
                    >
                      {BD_64_DISTRICTS.map((d) => {
                        const isSiraj = d.id === 'sirajganj' || d.id === 'sirajgonj';
                        const fee = isFreeDelivery
                          ? 'ফ্রি ডেলিভারি'
                          : isSiraj
                          ? `ডেলিভারি ৳${deliveryConfig.insideSirajganjCharge ?? 70}`
                          : `ডেলিভারি ৳${deliveryConfig.outsideSirajganjCharge ?? 130}`;
                        return (
                          <option key={d.id} value={d.id}>
                            {d.banglaName} - {d.name} ({fee})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* 4. Dependent Thana / Upazila Dropdown (থানা নির্বাচন) */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                      {language === 'en' ? 'Upazila / Thana' : 'থানা / উপজেলা নির্বাচন করুন'}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedUpazila}
                      onChange={(e) => setSelectedUpazila(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base text-stone-900 focus:outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs font-medium cursor-pointer"
                    >
                      {currentDistrict.upazilas.map((u, i) => (
                        <option key={i} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Detailed Area / Road / House (সম্পূর্ণ ঠিকানা) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5">
                      {language === 'en'
                        ? 'Detailed Delivery Area (House, Road, Area, Landmark)'
                        : 'সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা, রোড, এলাকা, চেনার উপায়)'}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={deliveryAreaDetails}
                      onChange={(e) => setDeliveryAreaDetails(e.target.value)}
                      placeholder={
                        language === 'en'
                          ? 'e.g. House 12, Road 4, Sector 7, Uttara'
                          : 'যেমন: বাড়ি #১২, রোড #৪, সেক্টর #৭, অথবা গ্রাম, ইউনিয়ন ও পোস্ট অফিস'
                      }
                      className="w-full bg-white border border-stone-300 rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs"
                    />
                  </div>
                </>
              ) : (
                /* INTERNATIONAL ADDRESS FIELDS */
                <div className="sm:col-span-2 space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <Globe className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        {selectedCountry.flag} {selectedCountry.name} - আন্তর্জাতিক ডেলিভারি
                      </span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        আন্তর্জাতিক এক্সপ্রেস কুরিয়ারে ৪ থেকে ৭ কর্মদিবসের মধ্যে পার্সেল পৌঁছাবে।
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {language === 'en' ? 'City / Town' : 'শহর (City / Town)'}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={cityTown}
                        onChange={(e) => setCityTown(e.target.value)}
                        placeholder="e.g. London / New York / Dubai"
                        className="w-full bg-stone-50/60 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {language === 'en' ? 'State / Province' : 'প্রদেশ / স্টেট (State / Province)'}
                      </label>
                      <input
                        type="text"
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        placeholder="e.g. England / NY / Ontario"
                        className="w-full bg-stone-50/60 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {language === 'en' ? 'Zip / Postal Code' : 'পোস্টাল কোড (Zip / Postal Code)'}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. SW1A 1AA / 10001"
                        className="w-full bg-stone-50/60 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {language === 'en' ? 'Street Address' : 'রাস্তার ঠিকানা / ফ্ল্যাট নম্বর'}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={internationalStreet}
                        onChange={(e) => setInternationalStreet(e.target.value)}
                        placeholder="e.g. 123 Oxford Street, Flat 4B"
                        className="w-full bg-stone-50/60 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Email (ঐচ্ছিক - Email Optional) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  {language === 'en' ? 'Email Address (Optional)' : 'ইমেইল ঠিকানা (ঐচ্ছিক)'}
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com (অর্ডারের ইনভয়েস ও রসিদ পেতে)"
                  className="w-full bg-stone-50/60 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-colors"
                />
              </div>

              {/* 7. Special Notes / Delivery Instructions (নোট - ঐচ্ছিক) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  {language === 'en'
                    ? 'Special Delivery Instructions / Note (Optional)'
                    : 'অর্ডার সংক্রান্ত বিশেষ নির্দেশিকা / নোট (ঐচ্ছিক)'}
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'e.g. Please call before delivery, deliver in afternoon'
                      : 'যেমন: ডেলিভারির আগে ফোন করবেন, বিকেলে ডেলিভারি দিন, সাইজ নিশ্চিত করে পাঠাবেন'
                  }
                  className="w-full bg-stone-50/60 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-sm">
                  ২
                </span>
                <h2 className="font-black text-stone-900 text-base sm:text-lg tracking-tight">
                  {language === 'en' ? 'Payment Method' : 'পেমেন্ট পদ্ধতি'}
                </h2>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ক্যাশ অন ডেলিভারি প্রযোজ্য
              </span>
            </div>

            {isDomestic ? (
              /* DOMESTIC BANGLADESH PAYMENT OPTIONS */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cash on Delivery */}
                {(paymentConfig.enableCod ?? (paymentConfig as any).isCodActive ?? true) && (
                  <label
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 text-amber-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">
                        ক্যাশ অন ডেলিভারি (COD)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন
                      </span>
                    </div>
                  </label>
                )}

                {/* bKash */}
                {Boolean(paymentConfig.enableBkash || (paymentConfig as any).isBkashActive) && (
                  <label
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-600 bg-pink-50/40 ring-1 ring-pink-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="mt-1 text-pink-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">
                        bKash (বিকাশ মার্চেন্ট/পার্সোনাল)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        নম্বর: {paymentConfig.bkashNumber || (paymentConfig as any).merchantNumber || '01864528488'}
                      </span>
                    </div>
                  </label>
                )}

                {/* Nagad */}
                {Boolean(paymentConfig.enableNagad || (paymentConfig as any).isNagadActive) && (
                  <label
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'nagad'
                        ? 'border-orange-600 bg-orange-50/40 ring-1 ring-orange-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="nagad"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="mt-1 text-orange-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">
                        Nagad (নগদ)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        নম্বর: {paymentConfig.nagadNumber || (paymentConfig as any).merchantNumber || '01864528488'}
                      </span>
                    </div>
                  </label>
                )}

                {/* Rocket */}
                {Boolean(paymentConfig.enableRocket || (paymentConfig as any).isRocketActive) && (
                  <label
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'rocket'
                        ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="rocket"
                      checked={paymentMethod === 'rocket'}
                      onChange={() => setPaymentMethod('rocket')}
                      className="mt-1 text-purple-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">
                        Rocket (রকেট)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        নম্বর: {paymentConfig.rocketNumber || '01712-345678-9'}
                      </span>
                    </div>
                  </label>
                )}

                {/* Upay */}
                {Boolean(paymentConfig.enableUpay || (paymentConfig as any).isUpayActive) && (
                  <label
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'upay'
                        ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="upay"
                      checked={paymentMethod === 'upay'}
                      onChange={() => setPaymentMethod('upay')}
                      className="mt-1 text-amber-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">
                        Upay (উপায়)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        নম্বর: {paymentConfig.upayNumber || '01712-345678'}
                      </span>
                    </div>
                  </label>
                )}

                {/* Card / Online */}
                <label
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-1 text-stone-900"
                  />
                  <div>
                    <span className="font-bold text-xs text-stone-900 block">
                      ভিসা / মাস্টারকার্ড / ডেবিট কার্ড
                    </span>
                    <span className="text-[11px] text-stone-500">
                      নিরাপদ অনলাইন কার্ড পেমেন্ট
                    </span>
                  </div>
                </label>
              </div>
            ) : (
              /* INTERNATIONAL PAYMENT OPTIONS */
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    {language === 'en'
                      ? 'Note: Cash on Delivery is not available for international destinations outside Bangladesh.'
                      : 'বিশেষ দ্রষ্টব্য: বাংলাদেশ ব্যতীত বহির্বিশ্বে ক্যাশ অন ডেলিভারি (COD) সুবিধা প্রযোজ্য নয়।'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* International Card */}
                  <label
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'international_card'
                        ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="international_card"
                      checked={paymentMethod === 'international_card'}
                      onChange={() => setPaymentMethod('international_card')}
                      className="mt-1 text-amber-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">
                        International Card (Visa / Master)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {language === 'en'
                          ? 'Global Credit / Debit Card & PayPal'
                          : 'আন্তর্জাতিক ক্রেডিট বা ডেবিট কার্ড'}
                      </span>
                    </div>
                  </label>

                  {/* Bank Transfer / Remittance */}
                  <label
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="mt-1 text-amber-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">
                        Bank Wire / Remittance (রেমিট্যান্স)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {language === 'en'
                          ? 'Direct bank transfer / Western Union / TapTap'
                          : 'প্রবাসী ব্যাংক ট্রান্সফার বা ওয়েস্টার্ন ইউনিয়ন'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Payment Instructions for bKash, Nagad, Rocket, Upay */}
            {paymentMethod === 'bkash' && paymentConfig.instructions?.bkash && (
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-800">
                <span className="font-bold block mb-0.5">বিকাশ পেমেন্ট নির্দেশিকা:</span>
                {paymentConfig.instructions.bkash}
              </div>
            )}
            {paymentMethod === 'nagad' && paymentConfig.instructions?.nagad && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800">
                <span className="font-bold block mb-0.5">নগদ পেমেন্ট নির্দেশিকা:</span>
                {paymentConfig.instructions.nagad}
              </div>
            )}
            {paymentMethod === 'rocket' && paymentConfig.instructions?.rocket && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
                <span className="font-bold block mb-0.5">রকেট পেমেন্ট নির্দেশিকা:</span>
                {paymentConfig.instructions.rocket}
              </div>
            )}
            {paymentMethod === 'upay' && paymentConfig.instructions?.upay && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <span className="font-bold block mb-0.5">উপায় পেমেন্ট নির্দেশিকা:</span>
                {paymentConfig.instructions.upay}
              </div>
            )}

            {/* Transaction ID if bKash / Nagad / Rocket / Upay / Bank */}
            {(paymentMethod === 'bkash' ||
              paymentMethod === 'nagad' ||
              paymentMethod === 'rocket' ||
              paymentMethod === 'upay' ||
              paymentMethod === 'bank_transfer') && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <label className="block text-xs font-bold text-stone-800">
                  {language === 'en'
                    ? 'Transaction ID / Reference Number (Optional)'
                    : 'ট্রানজেকশন আইডি / রেফারেন্স নম্বর (টাকা পাঠিয়ে থাকলে লিখুন)'}
                </label>
                <input
                  type="text"
                  value={paymentTxnId}
                  onChange={(e) => setPaymentTxnId(e.target.value)}
                  placeholder="যেমন: 9K72LM8Q"
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 uppercase"
                />
                <p className="text-[10px] text-stone-500">
                  {language === 'en'
                    ? 'You may also complete payment after placing the order via phone confirmation.'
                    : 'অর্ডার প্লেস করার পর আমাদের প্রতিনিধি ফোন করলেও আপনি পেমেন্ট নিশ্চিত করতে পারবেন।'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm space-y-6 sticky top-28">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h2 className="font-black text-stone-900 text-base sm:text-lg tracking-tight flex items-center gap-2.5">
                <ShoppingBasket className="w-5 h-5 text-amber-700" />
                <span>{language === 'en' ? 'Order Summary' : 'অর্ডার সারাংশ'}</span>
              </h2>
              <span className="text-xs bg-amber-50 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-200">
                {itemsToCheckout.length} {language === 'en' ? 'Items' : 'টি পোশাক'}
              </span>
            </div>

            {/* Cart Items List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 pr-1 space-y-3">
              {itemsToCheckout.length === 0 ? (
                <div className="py-6 text-center text-stone-500 space-y-2">
                  <p className="text-xs">{language === 'en' ? 'No items in order' : 'অর্ডারে কোনো পোশাক নেই'}</p>
                  <button
                    type="button"
                    onClick={navigateToHome}
                    className="text-xs text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    {language === 'en' ? 'Continue Shopping' : 'কেনাকাটা করতে ফিরে যান'}
                  </button>
                </div>
              ) : (
                itemsToCheckout.map((cartItem) => (
                  <div key={cartItem.item.sku || cartItem.item.productId} className="flex gap-3 pt-3 first:pt-0 group relative">
                    <img
                      src={cartItem.item.image}
                      alt={cartItem.item.productName}
                      className="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {cartItem.item.banglaName || cartItem.item.productName}
                      </p>
                      {cartItem.item.variantSummary && (
                        <p className="text-[11px] text-stone-500 truncate">{cartItem.item.variantSummary}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-1.5">
                        {/* Read-only Quantity Display (Phase 8.1) */}
                        <div className="flex items-center">
                          <span className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 rounded-lg">
                            পরিমাণ: <strong className="font-bold font-mono text-stone-900">{cartItem.quantity}</strong> টি
                          </span>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-stone-900 font-mono">
                            ৳{cartItem.item.price * cartItem.quantity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cross / Remove Button - Disabled for PDP direct buy item */}
                    {directBuyItem && directBuyItem.item.sku === cartItem.item.sku ? (
                      <span
                        className="absolute top-1 right-0 px-2 py-0.5 text-[10px] font-bold text-amber-900 bg-amber-100 rounded-md border border-amber-300 select-none"
                        title="প্রোডাক্ট পেজ থেকে অর্ডারকৃত মূল পোশাকটি রিমুভ করা যাবে না"
                      >
                        মূল পোশাক (লকড)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(cartItem.item.sku)}
                        className="absolute top-1 right-0 p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title={language === 'en' ? 'Remove item' : 'পণ্যটি বাদ দিন'}
                        aria-label="Remove item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-2 border-t border-stone-100">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={language === 'en' ? 'Coupon code' : 'কুপন কোড (যেমন: BASTRA100)'}
                  className="flex-1 bg-stone-50/60 border border-stone-300 rounded-xl px-3 py-2 text-xs uppercase tracking-wider text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Apply' : 'প্রয়োগ'}
                </button>
              </form>

              {appliedCoupon && (
                <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center justify-between">
                  <span className="font-medium">কুপন প্রয়োগ হয়েছে: {appliedCoupon.code}</span>
                  <span className="font-bold">-৳{appliedCoupon.discount}</span>
                </div>
              )}

              {couponError && <p className="mt-1 text-xs text-rose-500">{couponError}</p>}
            </div>

            {/* Clear Itemized Price Breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-stone-100 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{language === 'en' ? 'Items Price × Qty' : 'পোশাকের মোট মূল্য (Item Price × Qty)'}:</span>
                <span className="font-bold text-stone-900 font-mono">৳{checkoutSubtotal}</span>
              </div>

              {activeUpsellPrice > 0 && (
                <div className="flex justify-between text-amber-900 bg-amber-50/80 px-2 py-1.5 rounded-lg border border-amber-200">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span>🎁</span>
                    <span>{eligibleUpsell?.titleBn || 'উপহার বক্স / অ্যাড-অন'}:</span>
                  </span>
                  <span className="font-bold font-mono text-amber-800">+৳{activeUpsellPrice}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span className="flex items-center gap-1">
                  <span>{language === 'en' ? 'Delivery Charge' : 'ডেলিভারি চার্জ'}:</span>
                  <span className="text-[10px] text-stone-400">
                    ({!isDomestic ? 'আন্তর্জাতিক কুরিয়ার' : isSirajganj ? 'সিরাজগঞ্জের ভিতরে' : 'সিরাজগঞ্জের বাহিরে'})
                  </span>
                </span>
                <span className="font-bold text-stone-900 font-mono">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">ফ্রি (Free)</span>
                  ) : (
                    `৳${deliveryCharge}`
                  )}
                </span>
              </div>

              {comboDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-amber-900 bg-amber-50/90 px-2.5 py-1.5 rounded-lg border border-amber-200">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>🎁</span>
                    <span>{language === 'en' ? 'Combo Offer Discount' : 'কম্বো অফার বিশেষ ছাড়'}:</span>
                  </span>
                  <span className="font-bold font-mono text-amber-800">-৳{comboDiscountAmount}</span>
                </div>
              )}

              {couponDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/90 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <span className="font-bold">{language === 'en' ? 'Coupon Discount' : 'কুপন ছাড়'}:</span>
                  <span className="font-bold font-mono text-emerald-700">-৳{couponDiscountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base font-black text-stone-900 border-t border-stone-200 pt-3">
                <span>{language === 'en' ? 'Grand Total' : 'সর্বমোট প্রদেয়'}:</span>
                <span className="text-amber-800 text-xl font-black font-mono">৳{grandTotal}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-[11px] text-stone-600 border border-stone-200/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট গ্যারান্টি</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>পণ্য ডেলিভারির সময় দেখে নেওয়ার সুযোগ</span>
              </div>
            </div>

            {/* Terms and Conditions Agreement Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/90 cursor-pointer select-none text-xs text-stone-800 hover:bg-amber-100/60 transition-colors">
                <input
                  type="checkbox"
                  id="agree-to-terms-checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 cursor-pointer accent-amber-600 shrink-0"
                />
                <span className="leading-snug">
                  ◽ I have read and agree to the website{' '}
                  <span className="text-amber-800 font-bold underline">terms and conditions</span>
                </span>
              </label>
            </div>

            {/* Submit Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-60 text-white rounded-xl text-sm font-black tracking-wide uppercase transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>{language === 'en' ? 'Processing Order...' : 'অর্ডার প্রসেস হচ্ছে...'}</span>
              ) : (
                <>
                  <span>{language === 'en' ? 'Confirm Order Now' : 'অর্ডার সম্পন্ন করুন'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Real Online Payment Gateway Modal */}
      {activeGatewaySession && (
        <PaymentGatewayModal
          isOpen={true}
          orderId={activeGatewaySession.orderId}
          amount={activeGatewaySession.amount}
          gateway={activeGatewaySession.gateway}
          paymentId={activeGatewaySession.paymentId}
          onSuccess={(verifiedData) => {
            showToast('পেমেন্ট সফলভাবে গৃহীত হয়েছে!');
            clearCart();
            setCreatedOrderId(activeGatewaySession.orderId);
            setActiveGatewaySession(null);
          }}
          onCancel={() => {
            showToast('পেমেন্ট পেন্ডিং রাখা হয়েছে। আপনার অর্ডার ইতিমধ্যে সিস্টেমে সংরক্ষিত হয়েছে।');
            clearCart();
            setCreatedOrderId(activeGatewaySession.orderId);
            setActiveGatewaySession(null);
          }}
        />
      )}
    </div>
  );
};
