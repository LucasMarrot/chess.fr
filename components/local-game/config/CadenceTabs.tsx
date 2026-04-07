import { Clock3, Settings2, Timer, Zap } from 'lucide-react-native';
import { Animated, StyleSheet } from 'react-native';
import { Button, Text, XStack, YStack, styled } from 'tamagui';

import { type CadenceCategory } from '@/components/local-game/hooks/use-local-game-config';

type CadenceTabsProps = {
  activeCategory: CadenceCategory;
  indicatorWidth: number;
  tabIndicatorX: Animated.Value;
  activeColor: string;
  inactiveColor: string;
  onCategoryPress: (category: CadenceCategory) => void;
  onTabLayout: (category: CadenceCategory, layout: { x: number; width: number }) => void;
};

const CADENCE_CATEGORY_LABELS: Record<CadenceCategory, string> = {
  rapid: 'Rapide',
  blitz: 'Blitz',
  bullet: 'Bullet',
  custom: 'Perso',
};

const CADENCE_CATEGORY_ICONS: Record<CadenceCategory, typeof Zap> = {
  bullet: Zap,
  blitz: Timer,
  rapid: Clock3,
  custom: Settings2,
};

const CadenceTabsContainer = styled(XStack, {
  width: '100%',
  backgroundColor: '$transparent',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: '$3',
  paddingHorizontal: '$1',
  position: 'relative',
});

const CadenceTabButton = styled(Button, {
  chromeless: true,
  backgroundColor: 'transparent',
  borderWidth: 0,
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$1',
  paddingHorizontal: '$1',
  paddingVertical: '$1',
  variants: {
    active: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 0.7,
      },
    },
  } as const,
});

const CadenceTabLabel = styled(Text, {
  fontFamily: '$body',
  fontSize: '$3',
  fontWeight: '400',
  textAlign: 'center',
  variants: {
    active: {
      true: {
        color: '$dark',
      },
      false: {
        color: '$interactionGrey',
      },
    },
  } as const,
});

const styles = StyleSheet.create({
  tabIndicator: {
    height: 3,
    borderRadius: 2,
    position: 'absolute',
    top: 4,
    left: 0,
  },
});

export function CadenceTabs({
  activeCategory,
  indicatorWidth,
  tabIndicatorX,
  activeColor,
  inactiveColor,
  onCategoryPress,
  onTabLayout,
}: CadenceTabsProps) {
  return (
    <CadenceTabsContainer>
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            width: indicatorWidth,
            backgroundColor: activeColor,
            transform: [{ translateX: tabIndicatorX }],
          },
        ]}
      />

      {(Object.keys(CADENCE_CATEGORY_LABELS) as CadenceCategory[]).map((category) => {
        const CategoryIcon = CADENCE_CATEGORY_ICONS[category];
        const isSelectedCategory = activeCategory === category;

        return (
          <YStack
            key={category}
            flex={1}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout;
              onTabLayout(category, { x, width });
            }}
          >
            <CadenceTabButton active={isSelectedCategory} onPress={() => onCategoryPress(category)}>
              <CategoryIcon size={16} color={isSelectedCategory ? activeColor : inactiveColor} />
              <CadenceTabLabel active={isSelectedCategory} numberOfLines={1}>
                {CADENCE_CATEGORY_LABELS[category]}
              </CadenceTabLabel>
            </CadenceTabButton>
          </YStack>
        );
      })}
    </CadenceTabsContainer>
  );
}
