import { ScrollView, StyleSheet } from 'react-native';
import { View, YStack, styled } from 'tamagui';

import { ChessButton } from '@/components/ui/ChessButton';
import { CadenceSection } from '@/components/local-game/config/CadenceSection';
import { SideSelectionSection } from '@/components/local-game/config/SideSelectionSection';
import { useLocalGameConfig } from '@/components/local-game/hooks/use-local-game-config';

const ScreenContent = styled(YStack, {
  width: '100%',
  maxWidth: 430,
  gap: '$5',
  paddingHorizontal: '$4',
  paddingBottom: '$7',
  paddingTop: '$4',
});

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
  },
});

export default function LocalGameConfigScreen() {
  const {
    activeCategory,
    selectedCadenceKey,
    selectedSide,
    customMinutesInput,
    customIncrementInput,
    isCustomCategoryActive,
    canLaunchGame,
    visibleCadences,
    tabIndicatorX,
    indicatorWidth,
    selectCategory,
    selectCadence,
    updateCustomMinutes,
    updateCustomIncrement,
    selectSide,
    setTabLayout,
    launchLocalGame,
  } = useLocalGameConfig();

  return (
    <View flex={1} backgroundColor="$light">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenContent flexGrow={1}>
          <CadenceSection
            activeCategory={activeCategory}
            selectedCadenceKey={selectedCadenceKey}
            visibleCadences={visibleCadences}
            customMinutesInput={customMinutesInput}
            customIncrementInput={customIncrementInput}
            isCustomCategoryActive={isCustomCategoryActive}
            indicatorWidth={indicatorWidth}
            tabIndicatorX={tabIndicatorX}
            onCategoryPress={selectCategory}
            onTabLayout={setTabLayout}
            onCadencePress={selectCadence}
            onCustomMinutesChange={updateCustomMinutes}
            onCustomIncrementChange={updateCustomIncrement}
          />

          <SideSelectionSection selectedSide={selectedSide} onSelectSide={selectSide} />

          <YStack gap="$2" flex={1} justifyContent="flex-end">
            <ChessButton
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canLaunchGame}
              onPress={launchLocalGame}
            >
              Lancer la partie
            </ChessButton>
          </YStack>
        </ScreenContent>
      </ScrollView>
    </View>
  );
}
