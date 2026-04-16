import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import { useAuth } from '../../providers/AuthProvider';
import { useCart, type CartItem } from '../../providers/CartProvider';
import { readErrorMessage } from '../../services/backend';
import { goBackOrReplace } from '../../services/navigation';
import { openRazorpayCheckout } from '../../services/razorpayCheckout';
import {
  createStoreAddress,
  createStoreOrder,
  createStorePaymentSession,
  deleteStoreAddress,
  getStoreAddresses,
  setDefaultStoreAddress,
  updateStoreAddress,
  validateStoreCoupon,
  type CouponValidation,
  type StoreAddress,
  type StoreAddressInput,
} from '../../services/storeApi';

const EMPTY_ADDRESS_FORM: StoreAddressInput = {
  label: 'Home',
  recipientName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  latitude: null,
  longitude: null,
  isDefault: false,
};

function formatPaise(amountPaise: number) {
  return `Rs ${(amountPaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getFriendlyError(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'description' in error &&
    typeof error.description === 'string'
  ) {
    return error.description;
  }

  return readErrorMessage(error) ?? fallback;
}

function addressToForm(address: StoreAddress): StoreAddressInput {
  return {
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    isDefault: address.isDefault,
  };
}

function readLocationValue(
  address: Record<string, unknown>,
  keys: string[]
) {
  for (const key of keys) {
    const value = address[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function compactUnique(values: string[]) {
  const seenValues = new Set<string>();

  return values.filter(value => {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return false;
    }

    const key = normalizedValue.toLowerCase();

    if (seenValues.has(key)) {
      return false;
    }

    seenValues.add(key);
    return true;
  });
}

function mapLocationAddressToForm(
  address: Record<string, unknown>,
  currentForm: StoreAddressInput
): StoreAddressInput {
  const city = readLocationValue(address, ['city', 'subregion', 'district']);
  const state = readLocationValue(address, ['region']);
  const postalCode = readLocationValue(address, ['postalCode']);
  const country = readLocationValue(address, ['country']) || 'India';
  const streetLine = compactUnique([
    readLocationValue(address, ['name']),
    readLocationValue(address, ['streetNumber']),
    readLocationValue(address, ['street']),
    readLocationValue(address, ['district']),
  ]).join(', ');
  const fallbackLine = readLocationValue(address, ['formattedAddress']);

  return {
    ...currentForm,
    line1: streetLine || fallbackLine || currentForm.line1,
    city: city || currentForm.city,
    state: state || currentForm.state,
    postalCode: postalCode || currentForm.postalCode,
    country,
  };
}

export default function BoosterCheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const {
    clearCart,
    itemCount,
    items,
    totalAmount,
  } = useCart();
  const [addresses, setAddresses] = useState<StoreAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] =
    useState<StoreAddressInput>(EMPTY_ADDRESS_FORM);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(
    null
  );
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [locatingAddress, setLocatingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const checkoutItems = useMemo(
    () =>
      items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    [items]
  );
  const cartSignature = useMemo(
    () =>
      checkoutItems
        .map(item => `${item.productId}:${item.quantity}`)
        .sort()
        .join('|'),
    [checkoutItems]
  );
  const subtotalPaise = Math.round(totalAmount * 100);
  const discountPaise = appliedCoupon?.discountPaise ?? 0;
  const payablePaise = Math.max(0, subtotalPaise - discountPaise);
  const selectedAddress =
    addresses.find(address => address.id === selectedAddressId) ?? null;

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    setAddressError(null);

    try {
      const nextAddresses = await getStoreAddresses();
      setAddresses(nextAddresses);
      setSelectedAddressId(currentAddressId => {
        if (currentAddressId && nextAddresses.some(item => item.id === currentAddressId)) {
          return currentAddressId;
        }

        return (
          nextAddresses.find(address => address.isDefault)?.id ??
          nextAddresses[0]?.id ??
          null
        );
      });
    } catch (error) {
      setAddressError(
        getFriendlyError(error, 'Could not load your delivery addresses.')
      );
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  useEffect(() => {
    setAppliedCoupon(null);
    setCouponMessage(null);
  }, [cartSignature]);

  function updateAddressField<Field extends keyof StoreAddressInput>(
    field: Field,
    value: StoreAddressInput[Field]
  ) {
    setAddressForm(currentForm => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function startNewAddress() {
    setEditingAddressId(null);
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      recipientName: profile?.name ?? '',
    });
    setShowAddressForm(true);
  }

  function startEditAddress(address: StoreAddress) {
    setEditingAddressId(address.id);
    setAddressForm(addressToForm(address));
    setShowAddressForm(true);
  }

  function resetAddressForm() {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setShowAddressForm(false);
  }

  function validateAddressForm() {
    const requiredFields: (keyof StoreAddressInput)[] = [
      'label',
      'recipientName',
      'phone',
      'line1',
      'city',
      'state',
      'postalCode',
      'country',
    ];
    const missingField = requiredFields.find(
      field => !String(addressForm[field] ?? '').trim()
    );

    if (missingField) {
      Alert.alert('Address incomplete', 'Fill all required address fields.');
      return false;
    }

    return true;
  }

  async function fillAddressFromLocation() {
    if (locatingAddress) {
      return;
    }

    setShowAddressForm(true);
    setLocatingAddress(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          'Location permission needed',
          'Allow location access to fill your delivery address from current location.'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [locationAddress] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (!locationAddress) {
        Alert.alert(
          'Address not found',
          'Could not read address details from your current location. Fill the address manually.'
        );
        return;
      }

      setAddressForm(currentForm => {
        const nextForm = mapLocationAddressToForm(
          locationAddress as Record<string, unknown>,
          currentForm
        );

        return {
          ...nextForm,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
      });
    } catch (error) {
      Alert.alert(
        'Location failed',
        getFriendlyError(error, 'Could not detect your current location.')
      );
    } finally {
      setLocatingAddress(false);
    }
  }

  async function saveAddress() {
    if (!validateAddressForm()) {
      return;
    }

    setAddressSaving(true);

    try {
      const savedAddress = editingAddressId
        ? await updateStoreAddress(editingAddressId, addressForm)
        : await createStoreAddress(addressForm);

      await loadAddresses();
      setSelectedAddressId(savedAddress.id);
      resetAddressForm();
    } catch (error) {
      Alert.alert(
        'Address not saved',
        getFriendlyError(error, 'Could not save this address.')
      );
    } finally {
      setAddressSaving(false);
    }
  }

  async function markDefaultAddress(addressId: string) {
    try {
      const address = await setDefaultStoreAddress(addressId);
      setAddresses(currentAddresses =>
        currentAddresses.map(item => ({
          ...item,
          isDefault: item.id === address.id,
        }))
      );
      setSelectedAddressId(address.id);
    } catch (error) {
      Alert.alert(
        'Default address not updated',
        getFriendlyError(error, 'Could not update your default address.')
      );
    }
  }

  function confirmDeleteAddress(address: StoreAddress) {
    Alert.alert('Delete address', `Remove ${address.label} from delivery addresses?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteStoreAddress(address.id);
            await loadAddresses();
          } catch (error) {
            Alert.alert(
              'Address not deleted',
              getFriendlyError(error, 'Could not delete this address.')
            );
          }
        },
      },
    ]);
  }

  async function applyCoupon() {
    const code = couponCode.trim();

    if (!code) {
      setAppliedCoupon(null);
      setCouponMessage('Enter a coupon code.');
      return;
    }

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const validation = await validateStoreCoupon(code, checkoutItems);
      setAppliedCoupon(validation);
      setCouponCode(validation.code);
      setCouponMessage('Coupon applied successfully.');
    } catch (error) {
      setAppliedCoupon(null);
      setCouponMessage(getFriendlyError(error, 'Coupon could not be applied.'));
    } finally {
      setCouponLoading(false);
    }
  }

  async function confirmPayment() {
    if (items.length === 0) {
      Alert.alert('Cart empty', 'Add products before checkout.');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Address required', 'Select or add a delivery address.');
      return;
    }

    setPlacingOrder(true);

    try {
      const paymentSession = await createStorePaymentSession({
        addressId: selectedAddress.id,
        couponCode: appliedCoupon?.code ?? null,
        items: checkoutItems,
      });
      const paymentResult = await openRazorpayCheckout({
        key: paymentSession.razorpay.keyId,
        amount: paymentSession.razorpay.amountPaise,
        currency: paymentSession.razorpay.currency,
        name: 'Medha Clinic',
        description: 'Natural Immunotherapy Boosters',
        order_id: paymentSession.razorpay.orderId,
        prefill: {
          name: selectedAddress.recipientName || profile?.name,
          email: profile?.email,
          contact: selectedAddress.phone,
        },
        theme: {
          color: '#138A07',
        },
      });
      const order = await createStoreOrder({
        addressId: selectedAddress.id,
        couponCode: appliedCoupon?.code ?? null,
        items: checkoutItems,
        razorpayOrderId: paymentResult.razorpay_order_id,
        razorpayPaymentId: paymentResult.razorpay_payment_id,
        razorpaySignature: paymentResult.razorpay_signature,
      });

      clearCart();
      router.replace(
        `/boosterdiet/confirmation?orderId=${encodeURIComponent(order.id)}`
      );
    } catch (error) {
      Alert.alert(
        'Checkout failed',
        getFriendlyError(error, 'Payment could not be completed.')
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScreenNav
          onBackPress={() => goBackOrReplace('/boosterdiet/cart')}
          subtitle={`${itemCount} item${itemCount === 1 ? '' : 's'}`}
          title="Checkout"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP,
              paddingBottom: insets.bottom + 36,
            },
          ]}
        >
          {items.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons color="#138A07" name="cart-outline" size={32} />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.replace('/boosterdiet/store')}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Browse Store</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CheckoutContent
              addressError={addressError}
              addressForm={addressForm}
              addressSaving={addressSaving}
              addresses={addresses}
              appliedCoupon={appliedCoupon}
              applyCoupon={applyCoupon}
              checkoutItemsReady={checkoutItems.length > 0}
              confirmDeleteAddress={confirmDeleteAddress}
              confirmPayment={confirmPayment}
              couponCode={couponCode}
              couponLoading={couponLoading}
              couponMessage={couponMessage}
              discountPaise={discountPaise}
              editingAddressId={editingAddressId}
              items={items}
              loadAddresses={loadAddresses}
              loadingAddresses={loadingAddresses}
              locatingAddress={locatingAddress}
              markDefaultAddress={markDefaultAddress}
              payablePaise={payablePaise}
              placingOrder={placingOrder}
              resetAddressForm={resetAddressForm}
              selectedAddressId={selectedAddressId}
              setCouponCode={setCouponCode}
              setCouponMessage={setCouponMessage}
              setAppliedCoupon={setAppliedCoupon}
              setSelectedAddressId={setSelectedAddressId}
              showAddressForm={showAddressForm}
              startEditAddress={startEditAddress}
              startNewAddress={startNewAddress}
              subtotalPaise={subtotalPaise}
              updateAddressField={updateAddressField}
              fillAddressFromLocation={fillAddressFromLocation}
              saveAddress={saveAddress}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type CheckoutContentProps = {
  addressError: string | null;
  addressForm: StoreAddressInput;
  addressSaving: boolean;
  addresses: StoreAddress[];
  appliedCoupon: CouponValidation | null;
  applyCoupon: () => Promise<void>;
  checkoutItemsReady: boolean;
  confirmDeleteAddress: (address: StoreAddress) => void;
  confirmPayment: () => Promise<void>;
  couponCode: string;
  couponLoading: boolean;
  couponMessage: string | null;
  discountPaise: number;
  editingAddressId: string | null;
  items: CartItem[];
  fillAddressFromLocation: () => Promise<void>;
  loadAddresses: () => Promise<void>;
  loadingAddresses: boolean;
  locatingAddress: boolean;
  markDefaultAddress: (addressId: string) => Promise<void>;
  payablePaise: number;
  placingOrder: boolean;
  resetAddressForm: () => void;
  saveAddress: () => Promise<void>;
  selectedAddressId: string | null;
  setAppliedCoupon: (coupon: CouponValidation | null) => void;
  setCouponCode: (code: string) => void;
  setCouponMessage: (message: string | null) => void;
  setSelectedAddressId: (addressId: string) => void;
  showAddressForm: boolean;
  startEditAddress: (address: StoreAddress) => void;
  startNewAddress: () => void;
  subtotalPaise: number;
  updateAddressField: <Field extends keyof StoreAddressInput>(
    field: Field,
    value: StoreAddressInput[Field]
  ) => void;
};

function CheckoutContent({
  addressError,
  addressForm,
  addressSaving,
  addresses,
  appliedCoupon,
  applyCoupon,
  checkoutItemsReady,
  confirmDeleteAddress,
  confirmPayment,
  couponCode,
  couponLoading,
  couponMessage,
  discountPaise,
  editingAddressId,
  fillAddressFromLocation,
  items,
  loadAddresses,
  loadingAddresses,
  locatingAddress,
  markDefaultAddress,
  payablePaise,
  placingOrder,
  resetAddressForm,
  saveAddress,
  selectedAddressId,
  setAppliedCoupon,
  setCouponCode,
  setCouponMessage,
  setSelectedAddressId,
  showAddressForm,
  startEditAddress,
  startNewAddress,
  subtotalPaise,
  updateAddressField,
}: CheckoutContentProps) {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Items</Text>
        {items.map(item => (
          <View key={item.product.id} style={styles.itemRow}>
            <View style={styles.itemCopy}>
              <Text style={styles.itemTitle}>{item.product.title}</Text>
              <Text style={styles.itemMeta}>
                {item.product.capacity} x {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemAmount}>
              {formatPaise(item.product.price * item.quantity * 100)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <View style={styles.sectionActions}>
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={locatingAddress}
              onPress={() => void fillAddressFromLocation()}
              style={styles.locationHeaderButton}
            >
              <Ionicons color="#138A07" name="locate-outline" size={15} />
              <Text style={styles.locationHeaderText}>
                {locatingAddress ? 'Detecting' : 'Use Location'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} onPress={startNewAddress}>
              <Text style={styles.linkText}>Add New</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loadingAddresses ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#138A07" />
            <Text style={styles.loadingText}>Loading addresses</Text>
          </View>
        ) : null}

        {addressError ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => void loadAddresses()}
            style={styles.errorBox}
          >
            <Text style={styles.errorText}>{addressError}</Text>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        {!loadingAddresses && addresses.length === 0 && !showAddressForm ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={startNewAddress}
            style={styles.addAddressCard}
          >
            <Ionicons color="#138A07" name="add-circle-outline" size={22} />
            <Text style={styles.addAddressText}>Add delivery address</Text>
          </TouchableOpacity>
        ) : null}

        {addresses.map(address => {
          const selected = address.id === selectedAddressId;

          return (
            <TouchableOpacity
              key={address.id}
              activeOpacity={0.9}
              onPress={() => setSelectedAddressId(address.id)}
              style={[
                styles.addressCard,
                selected && styles.addressCardSelected,
              ]}
            >
              <View style={styles.addressTopRow}>
                <View style={styles.addressTitleRow}>
                  <Ionicons
                    color={selected ? '#138A07' : '#64748B'}
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                  />
                  <Text style={styles.addressLabel}>{address.label}</Text>
                  {address.isDefault ? (
                    <Text style={styles.defaultBadge}>Default</Text>
                  ) : null}
                </View>
                <View style={styles.addressActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.86}
                    onPress={() => startEditAddress(address)}
                  >
                    <Text style={styles.smallLink}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.86}
                    onPress={() => confirmDeleteAddress(address)}
                  >
                    <Text style={styles.deleteLink}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.addressName}>{address.recipientName}</Text>
              <Text style={styles.addressText}>
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''}
              </Text>
              <Text style={styles.addressText}>
                {address.city}, {address.state} - {address.postalCode}
              </Text>
              <Text style={styles.addressText}>{address.phone}</Text>
              {!address.isDefault ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => void markDefaultAddress(address.id)}
                  style={styles.defaultButton}
                >
                  <Text style={styles.defaultButtonText}>Set Default</Text>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          );
        })}

        {showAddressForm ? (
          <View style={styles.addressForm}>
            <Text style={styles.formTitle}>
              {editingAddressId ? 'Edit Address' : 'New Address'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={locatingAddress}
              onPress={() => void fillAddressFromLocation()}
              style={styles.locationButton}
            >
              {locatingAddress ? (
                <ActivityIndicator color="#138A07" />
              ) : (
                <Ionicons color="#138A07" name="locate-outline" size={20} />
              )}
              <Text style={styles.locationButtonText}>
                {locatingAddress
                  ? 'Detecting current location'
                  : 'Use Current Location'}
              </Text>
            </TouchableOpacity>
            <TextInput
              onChangeText={value => updateAddressField('label', value)}
              placeholder="Label"
              placeholderTextColor="#8A94A6"
              style={styles.input}
              value={addressForm.label}
            />
            <TextInput
              onChangeText={value =>
                updateAddressField('recipientName', value)
              }
              placeholder="Recipient name"
              placeholderTextColor="#8A94A6"
              style={styles.input}
              value={addressForm.recipientName}
            />
            <TextInput
              keyboardType="phone-pad"
              onChangeText={value => updateAddressField('phone', value)}
              placeholder="Phone"
              placeholderTextColor="#8A94A6"
              style={styles.input}
              value={addressForm.phone}
            />
            <TextInput
              onChangeText={value => updateAddressField('line1', value)}
              placeholder="Address line 1"
              placeholderTextColor="#8A94A6"
              style={styles.input}
              value={addressForm.line1}
            />
            <TextInput
              onChangeText={value => updateAddressField('line2', value)}
              placeholder="Address line 2"
              placeholderTextColor="#8A94A6"
              style={styles.input}
              value={addressForm.line2 ?? ''}
            />
            <View style={styles.twoColumnRow}>
              <TextInput
                onChangeText={value => updateAddressField('city', value)}
                placeholder="City"
                placeholderTextColor="#8A94A6"
                style={[styles.input, styles.halfInput]}
                value={addressForm.city}
              />
              <TextInput
                onChangeText={value => updateAddressField('state', value)}
                placeholder="State"
                placeholderTextColor="#8A94A6"
                style={[styles.input, styles.halfInput]}
                value={addressForm.state}
              />
            </View>
            <View style={styles.twoColumnRow}>
              <TextInput
                keyboardType="number-pad"
                onChangeText={value => updateAddressField('postalCode', value)}
                placeholder="PIN code"
                placeholderTextColor="#8A94A6"
                style={[styles.input, styles.halfInput]}
                value={addressForm.postalCode}
              />
              <TextInput
                onChangeText={value => updateAddressField('country', value)}
                placeholder="Country"
                placeholderTextColor="#8A94A6"
                style={[styles.input, styles.halfInput]}
                value={addressForm.country}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                updateAddressField('isDefault', !addressForm.isDefault)
              }
              style={styles.checkboxRow}
            >
              <Ionicons
                color="#138A07"
                name={addressForm.isDefault ? 'checkbox' : 'square-outline'}
                size={22}
              />
              <Text style={styles.checkboxText}>Make default address</Text>
            </TouchableOpacity>
            <View style={styles.formActionRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={resetAddressForm}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={addressSaving}
                onPress={() => void saveAddress()}
                style={[
                  styles.primaryButton,
                  styles.formSaveButton,
                  addressSaving && styles.disabledButton,
                ]}
              >
                {addressSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coupon Code</Text>
        <View style={styles.couponRow}>
          <TextInput
            autoCapitalize="characters"
            onChangeText={value => {
              setCouponCode(value);
              setAppliedCoupon(null);
              setCouponMessage(null);
            }}
            placeholder="Enter coupon"
            placeholderTextColor="#8A94A6"
            style={styles.couponInput}
            value={couponCode}
          />
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={couponLoading || !checkoutItemsReady}
            onPress={() => void applyCoupon()}
            style={[
              styles.applyButton,
              (couponLoading || !checkoutItemsReady) && styles.disabledButton,
            ]}
          >
            {couponLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.applyButtonText}>Apply</Text>
            )}
          </TouchableOpacity>
        </View>
        {couponMessage ? (
          <Text
            style={[
              styles.couponMessage,
              appliedCoupon ? styles.successText : styles.errorText,
            ]}
          >
            {couponMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPaise(subtotalPaise)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <Text style={styles.discountValue}>- {formatPaise(discountPaise)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.payableLabel}>Payable Amount</Text>
          <Text style={styles.payableValue}>{formatPaise(payablePaise)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          disabled={placingOrder}
          onPress={() => void confirmPayment()}
          style={[
            styles.confirmButton,
            placingOrder && styles.disabledButton,
          ]}
        >
          {placingOrder ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FBF7',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyCard: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    color: '#123E16',
    fontSize: 20,
    fontWeight: '800',
  },
  cardTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemCopy: {
    flex: 1,
    paddingRight: 12,
  },
  itemTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  itemMeta: {
    marginTop: 3,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  itemAmount: {
    color: '#138A07',
    fontSize: 15,
    fontWeight: '800',
  },
  linkText: {
    color: '#138A07',
    fontSize: 14,
    fontWeight: '800',
  },
  locationHeaderButton: {
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
  },
  locationHeaderText: {
    color: '#138A07',
    fontSize: 12,
    fontWeight: '800',
  },
  loadingRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 10,
    color: '#5B6670',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBox: {
    marginTop: 14,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
  },
  errorText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
  },
  retryText: {
    marginTop: 4,
    color: '#7F1D1D',
    fontSize: 12,
    fontWeight: '700',
  },
  addAddressCard: {
    marginTop: 14,
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressText: {
    marginLeft: 8,
    color: '#138A07',
    fontSize: 15,
    fontWeight: '800',
  },
  addressCard: {
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  addressCardSelected: {
    borderColor: '#138A07',
    backgroundColor: '#F0FDF4',
  },
  addressTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  addressTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  addressLabel: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  defaultBadge: {
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: '#166534',
    fontSize: 11,
    fontWeight: '800',
  },
  addressActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smallLink: {
    color: '#138A07',
    fontSize: 12,
    fontWeight: '800',
  },
  deleteLink: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },
  addressName: {
    marginTop: 10,
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  addressText: {
    marginTop: 4,
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 18,
  },
  defaultButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#138A07',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  defaultButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  addressForm: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  formTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  locationButton: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  locationButtonText: {
    color: '#138A07',
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    marginTop: 10,
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    color: '#111827',
    fontSize: 15,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  checkboxRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    marginLeft: 8,
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  formActionRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  formSaveButton: {
    flex: 1,
    marginTop: 0,
  },
  couponRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  applyButton: {
    minWidth: 86,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  couponMessage: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
  },
  successText: {
    color: '#138A07',
  },
  summaryCard: {
    borderRadius: 8,
    backgroundColor: '#103012',
    padding: 18,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  summaryRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#DDEEDD',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  discountValue: {
    color: '#86EFAC',
    fontSize: 15,
    fontWeight: '800',
  },
  divider: {
    marginTop: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  payableLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  payableValue: {
    color: '#24CF16',
    fontSize: 22,
    fontWeight: '900',
  },
  confirmButton: {
    marginTop: 20,
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.65,
  },
});
