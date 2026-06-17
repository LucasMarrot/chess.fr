import { router, Tabs } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { Home, User } from 'lucide-react-native';
import { Button, Text, View, XStack, YStack, styled, useTheme } from 'tamagui';
import QuickPlayBar from '@/components/QuickPlayBar';

type TabKey = 'jouer' | 'profil';

const Container = styled(XStack, {
  width: '100%',
  backgroundColor: '$light',
  height: 80,
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$15',
  paddingVertical: '$3',
  paddingTop: '$4',
  overflow: 'visible',
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: -2 },
  elevation: 2,
});

const TabButton = styled(Button, {
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$1',
  width: 'fit-content',
  backgroundColor: 'transparent',
  borderWidth: 0,
  paddingVertical: 0,
  paddingHorizontal: 0,
  position: 'relative',
  paddingTop: '$2',
  paddingBottom: '$2',
  variants: {
    active: {
      true: {
        scale: 1,
        opacity: 1,
      },
      false: {
        scale: 0.95,
        opacity: 0.7,
      },
    },
  } as const,
});

const Label = styled(Text, {
  fontFamily: '$body',
  textTransform: 'uppercase',
  letterSpacing: 2,
  fontSize: '$2',
  color: '$interactionGrey',
  variants: {
    active: {
      true: {
        color: '$dark',
        opacity: 1,
      },
      false: {
        color: '$interactionGrey',
        opacity: 0.7,
      },
    },
  } as const,
});

const IconWrapper = styled(View, {
  width: 32,
  height: 32,
  alignItems: 'center',
  justifyContent: 'center',
});

function HomeIcon({ active }: { active: boolean }) {
  const theme = useTheme();
  const color = active ? theme.dark.val : theme.interactionGrey.val;

  return (
    <IconWrapper>
      <Home size={30} strokeWidth={1.7} color={color} />
    </IconWrapper>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const theme = useTheme();
  const color = active ? theme.dark.val : theme.interactionGrey.val;

  return (
    <IconWrapper>
      <User size={30} strokeWidth={1.7} color={color} />
    </IconWrapper>
  );
}

function TabsBar({
  activeTab,
  onPressHome,
  onPressProfil,
}: {
  activeTab: TabKey;
  onPressHome: () => void;
  onPressProfil: () => void;
}) {
  const theme = useTheme();
  const indicatorWidth = 56;
  const indicatorX = useRef(new Animated.Value(-indicatorWidth - 24)).current;

  const [tabLayouts, setTabLayouts] = useState<Record<TabKey, { x: number; width: number } | null>>(
    { jouer: null, profil: null },
  );

  const handlePlayOnline = () => {
    router.push({
      pathname: '/local-game/config',
      params: {
        mode: 'online',
      },
    });
  };

  useEffect(() => {
    const activeLayout = tabLayouts[activeTab];
    if (!activeLayout) return;

    // Calcul : coordonnée X du conteneur + (largeur du conteneur - largeur de la barre) / 2
    const target = activeLayout.x + (activeLayout.width - indicatorWidth) / 2;

    Animated.timing(indicatorX, {
      toValue: target,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabLayouts, indicatorWidth, indicatorX]);

  return (
    <YStack>
      {activeTab === 'jouer' ? (
        <QuickPlayBar
          onPlayOnline={handlePlayOnline}
          onPlayLocal={() => router.push('/local-game/config')}
        />
      ) : null}
      <Container style={{ position: 'relative' }}>
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: theme.dark.val,
              transform: [{ translateX: indicatorX }],
            },
          ]}
        />

        <View
          onLayout={(e) => {
            const layout = e.nativeEvent.layout;
            setTabLayouts((prev) => ({ ...prev, jouer: layout }));
          }}
        >
          <TabButton onPress={onPressHome} chromeless active={activeTab === 'jouer'}>
            <HomeIcon active={activeTab === 'jouer'} />
            <Label active={activeTab === 'jouer'}>HOME</Label>
          </TabButton>
        </View>

        <View
          onLayout={(e) => {
            const layout = e.nativeEvent.layout;
            setTabLayouts((prev) => ({ ...prev, profil: layout }));
          }}
        >
          <TabButton onPress={onPressProfil} chromeless active={activeTab === 'profil'}>
            <ProfileIcon active={activeTab === 'profil'} />
            <Label active={activeTab === 'profil'}>PROFIL</Label>
          </TabButton>
        </View>
      </Container>
    </YStack>
  );
}

const styles = StyleSheet.create({
  indicator: {
    height: 3,
    width: 56,
    borderRadius: 2,
    position: 'absolute',
    top: 4,
    left: 0,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        const activeRoute = props.state.routes[props.state.index]?.name;
        const activeTab = activeRoute === 'index' ? 'jouer' : 'profil';

        return (
          <TabsBar
            activeTab={activeTab}
            onPressHome={() => props.navigation.navigate('index')}
            onPressProfil={() => props.navigation.navigate('profile')}
          />
        );
      }}
    />
  );
}
