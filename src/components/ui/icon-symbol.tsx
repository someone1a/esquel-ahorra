// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'magnifyingglass': 'search',
  'line.3.horizontal.decrease.circle': 'tune',
  'qrcode': 'qr-code-scanner',
  'barcode.viewfinder': 'qr-code-scanner',
  'camera.fill': 'photo-camera',
  'xmark': 'close',
  'arrow.right': 'arrow-forward',
  'pencil': 'edit',
  'person.fill': 'person',
  'person.3.fill': 'groups',
  'person.badge.plus': 'person-add',
  'lock.shield.fill': 'admin-panel-settings',
  'shield.fill': 'shield',
  'checkmark.shield.fill': 'verified-user',
  'mappin.and.ellipse': 'place',
  'minus.circle': 'remove-circle',
  'plus.circle': 'add-circle-outline',
  'plus.circle.fill': 'add-circle',
  'trash': 'delete',
  'cart.fill': 'shopping-cart',
  'cart.badge.plus': 'add-shopping-cart',
  'cart.fill.badge.minus': 'remove-shopping-cart',
  'square.grid.2x2.fill': 'grid-view',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
