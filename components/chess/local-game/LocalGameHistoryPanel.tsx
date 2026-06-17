import { Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { localGameStyles } from './styles';
import type { HistoryRow, LocalGameTheme } from './types';

type LocalGameHistoryPanelProps = {
  rows: HistoryRow[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  theme: LocalGameTheme;
};

export const LocalGameHistoryPanel = ({
  rows,
  isCollapsed,
  onToggleCollapse,
  theme,
}: LocalGameHistoryPanelProps) => {
  return (
    <YStack
      style={localGameStyles.historyPanel}
      backgroundColor={theme.light}
      borderColor={theme.buttonPrimaryBorder}
    >
      <XStack
        style={localGameStyles.historyHeader}
        backgroundColor={theme.historyHeaderBackground}
        borderColor={theme.buttonPrimaryBorder}
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color={theme.dark} fontWeight="700" fontSize="$4">
          Historique ({rows.length} coups)
        </Text>

        <Pressable onPress={onToggleCollapse}>
          <Text color={theme.dark} fontSize="$6" fontWeight="700">
            {isCollapsed ? 'v' : '^'}
          </Text>
        </Pressable>
      </XStack>

      {!isCollapsed ? (
        <ScrollView style={{ maxHeight: 170 }} contentContainerStyle={{ paddingBottom: 4 }}>
          {rows.length === 0 ? (
            <YStack paddingHorizontal="$3" paddingVertical="$3">
              <Text color={theme.interactionGrey} fontSize="$3">
                Aucun coup pour le moment.
              </Text>
            </YStack>
          ) : (
            rows.map((row, index) => (
              <XStack
                key={`${row.moveNumber}-${row.white}-${row.black}-${index}`}
                style={localGameStyles.historyRow}
                borderColor={theme.buttonSecondaryHover}
                alignItems="center"
                justifyContent="space-between"
              >
                <Text color={theme.interactionGrey} width={38} fontSize="$3" fontWeight="600">
                  {row.moveNumber}.
                </Text>
                <Text color={theme.dark} flex={1} fontSize="$3" fontWeight="700">
                  {row.white}
                </Text>
                <Text color={theme.dark} flex={1} fontSize="$3" fontWeight="700">
                  {row.black}
                </Text>
              </XStack>
            ))
          )}
        </ScrollView>
      ) : null}
    </YStack>
  );
};
