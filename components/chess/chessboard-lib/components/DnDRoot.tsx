import React, { createContext, useState, useContext, useRef } from 'react';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { DndProvider, ItemOptions, UniqueIdentifier } from '@mgcrea/react-native-dnd';
import type { LayoutRectangle } from 'react-native';
import { View } from 'react-native';
import type {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { ChessboardDnDProviderProps } from '../types';

type DragState = {
  isDragging: boolean | null;
  activeId: UniqueIdentifier | null;
  activeLayout: LayoutRectangle | null;
  droppableActiveId: UniqueIdentifier | null;
};

type DropState = {
  droppedId: UniqueIdentifier | null;
  droppedTargetSquare: UniqueIdentifier | null;
};

type LastDrop = {
  activeId: UniqueIdentifier;
  targetSquare: UniqueIdentifier;
  activeLayout: LayoutRectangle;
} | null;

type ChessboardDnDContextType = {
  isCustomDndProviderSet: boolean;
  dragState: DragState;
  setDragState: Dispatch<SetStateAction<DragState>>;
  dropState: DropState;
  setDropState: Dispatch<SetStateAction<DropState>>;
  clearDropState: () => void;
  dragCenterOffset: SharedValue<{ x: number; y: number }>;
  lastDrop: LastDrop;
  clearLastDrop: () => void;
};

export const ChessboardDnDContext = createContext<ChessboardDnDContextType>({
  isCustomDndProviderSet: false,
  dragState: {
    isDragging: false,
    activeId: null,
    activeLayout: null,
    droppableActiveId: null,
  },
  dropState: {
    droppedId: null,
    droppedTargetSquare: null,
  },
  setDragState: () => {},
  setDropState: () => {},
  clearDropState: () => {},
  dragCenterOffset: { value: { x: 0, y: 0 } } as SharedValue<{ x: number; y: number }>,
  lastDrop: null,
  clearLastDrop: () => {},
});

const EmptyProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return <View style={{ flex: 1 }}>{children}</View>;
};

type ChessboardDnDRootProps = {
  children: ReactNode;
};

export const ChessboardDnDProvider: FC<ChessboardDnDProviderProps & ChessboardDnDRootProps> = ({
  children,
}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: null,
    activeId: null,
    activeLayout: null,
    droppableActiveId: null,
  });

  const [dropState, setDropState] = useState<DropState>({
    droppedId: null,
    droppedTargetSquare: null,
  });
  const [lastDrop, setLastDrop] = useState<LastDrop>(null);
  const dragCenterOffset = useSharedValue({ x: 0, y: 0 });
  const lastActiveLayoutRef = useRef<LayoutRectangle | null>(null);

  const clearLastDrop = () => {
    setLastDrop(null);
  };

  const handleBegin = (
    e: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    info: {
      activeId: UniqueIdentifier;
      activeLayout: LayoutRectangle;
    },
  ) => {
    setDragState({
      isDragging: false,
      activeId: info.activeId,
      activeLayout: info.activeLayout,
      droppableActiveId: null,
    });
  };

  const handleUpdate = (
    e: GestureUpdateEvent<PanGestureHandlerEventPayload>,
    meta: {
      activeId: UniqueIdentifier;
      activeLayout: LayoutRectangle;
      droppableActiveId: UniqueIdentifier | null;
    },
  ) => {
    lastActiveLayoutRef.current = meta.activeLayout;
    // Update drag state with the active droppable
    setDragState((prev) => {
      if (prev.droppableActiveId === meta.droppableActiveId && prev.isDragging) {
        return prev;
      }

      return {
        ...prev,
        isDragging: true,
        droppableActiveId: meta.droppableActiveId,
      };
    });
  };

  const handleDragEnd = (e: { active: ItemOptions; over: ItemOptions | null }) => {
    if (e.over) {
      const activeLayout = lastActiveLayoutRef.current;
      if (activeLayout) {
        setLastDrop({
          activeId: e.active.id as UniqueIdentifier,
          targetSquare: e.over.id as UniqueIdentifier,
          activeLayout,
        });
      } else {
        setLastDrop(null);
      }
    } else {
      clearLastDrop();
      dragCenterOffset.value = { x: 0, y: 0 };
    }
    setDropState({
      droppedId: e.active.id as UniqueIdentifier | null,
      droppedTargetSquare: (e.over?.id ?? null) as UniqueIdentifier | null,
    });
    setDragState((prev) => ({
      ...prev,
      isDragging: false,
    }));
  };

  const clearDropState = () => {
    setDropState({
      droppedId: null,
      droppedTargetSquare: null,
    });
  };

  return (
    <ChessboardDnDContext.Provider
      value={{
        isCustomDndProviderSet: true,
        dragState,
        dropState,
        setDragState,
        setDropState,
        clearDropState,
        dragCenterOffset,
        lastDrop,
        clearLastDrop,
      }}
    >
      <DndProvider
        minDistance={5}
        springConfig={{
          damping: 60,
          stiffness: 800,
          mass: 1,
          overshootClamping: true,
        }}
        shouldDropWorklet={(
          activeRect: { x: number; y: number; width: number; height: number },
          droppableRect: { x: number; y: number; width: number; height: number },
        ) => {
          'worklet';
          const { x: offsetX, y: offsetY } = dragCenterOffset.value;
          const pointerX = activeRect.x + activeRect.width / 2 + offsetX;
          const pointerY = activeRect.y + activeRect.height / 2 + offsetY;

          return (
            pointerX >= droppableRect.x &&
            pointerX <= droppableRect.x + droppableRect.width &&
            pointerY >= droppableRect.y &&
            pointerY <= droppableRect.y + droppableRect.height
          );
        }}
        onBegin={(
          e: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
          info: { activeId: UniqueIdentifier; activeLayout: LayoutRectangle },
        ) => {
          'worklet';
          const { x, y } = e;
          const { activeLayout } = info;
          if (activeLayout) {
            dragCenterOffset.value = {
              x: x - (activeLayout.x + activeLayout.width / 2),
              y: y - (activeLayout.y + activeLayout.height / 2),
            };
          } else {
            dragCenterOffset.value = { x: 0, y: 0 };
          }
          scheduleOnRN(handleBegin, e, info);
        }}
        onUpdate={(
          e: GestureUpdateEvent<PanGestureHandlerEventPayload>,
          meta: {
            activeId: UniqueIdentifier;
            activeLayout: LayoutRectangle;
            droppableActiveId: UniqueIdentifier | null;
          },
        ) => {
          'worklet';
          scheduleOnRN(handleUpdate, e, meta);
        }}
        onDragEnd={(e: { active: ItemOptions; over: ItemOptions | null }) => {
          'worklet';
          scheduleOnRN(handleDragEnd, e);
        }}
      >
        {children}
      </DndProvider>
    </ChessboardDnDContext.Provider>
  );
};

export const ChessboardDnDRoot: FC<ChessboardDnDRootProps> = ({ children }) => {
  const { isCustomDndProviderSet } = useContext(ChessboardDnDContext);

  if (isCustomDndProviderSet) {
    return <EmptyProvider>{children}</EmptyProvider>;
  }

  return <DndProvider>{children}</DndProvider>;
};
