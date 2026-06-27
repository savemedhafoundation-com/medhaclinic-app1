import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const resolvedColor = type === 'link' ? '#0a7ea4' : color;
  const typeClassName =
    type === 'title'
      ? 'text-[32px] leading-[32px] font-bold'
      : type === 'defaultSemiBold'
        ? 'text-base leading-6 font-semibold'
        : type === 'subtitle'
          ? 'text-[20px] font-bold'
          : type === 'link'
            ? 'text-base leading-[30px] text-[#0a7ea4]'
            : 'text-base leading-6';

  return (
    <Text
      className={[typeClassName, className].filter(Boolean).join(' ')}
      style={[{ color: resolvedColor }, style]}
      {...rest}
    />
  );
}
