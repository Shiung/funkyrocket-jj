import { ref, computed } from 'vue'
import { GameState, type CharacterType } from '../types'

export const useGameState = () => {
  // 遊戲狀態
  const currentState = ref<GameState>(GameState.IDLE)
  const countdown = ref(0)
  const isAnimating = ref(false)
  const hasPlayedLaunchPlayer = ref(false) // 記錄是否已播放過 launch_player
  const charactersOnBoard = ref<CharacterType[]>([]) // 火箭內的乘客

  // 狀態檢查的計算屬性
  const isIdle = computed(() => currentState.value === GameState.IDLE)
  const isBoarding = computed(() => currentState.value === GameState.BOARDING)
  const isCountdown = computed(() => currentState.value === GameState.COUNTDOWN)
  const isLaunching = computed(() => currentState.value === GameState.LAUNCHING)
  const isFlying = computed(() => currentState.value === GameState.FLYING)
  const isDisembarking = computed(() => currentState.value === GameState.DISEMBARKING)
  const isExploding = computed(() => currentState.value === GameState.EXPLODING)
  const isCompleted = computed(() => currentState.value === GameState.COMPLETED)

  // 角色管理相關的計算屬性
  const hasPlayerOnBoard = computed(() => charactersOnBoard.value.includes('player'))
  const hasStreamerOnBoard = computed(() => charactersOnBoard.value.includes('streamer'))
  const hasNpcOnBoard = computed(() => charactersOnBoard.value.includes('npc'))
  const boardedCharacterCount = computed(() => charactersOnBoard.value.length)

  // 狀態管理方法
  const setState = (newState: GameState): void => {
    currentState.value = newState
  }

  const setCountdown = (value: number): void => {
    countdown.value = value
  }

  const setAnimating = (value: boolean): void => {
    isAnimating.value = value
  }

  const setLaunchPlayerPlayed = (value: boolean): void => {
    hasPlayedLaunchPlayer.value = value
  }

  // 加入角色到火箭
  const addCharacterToBoard = (characterType: CharacterType): void => {
    if (!charactersOnBoard.value.includes(characterType)) {
      charactersOnBoard.value.push(characterType)
    }
  }

  // 從火箭中移除角色
  const removeCharacterFromBoard = (characterType: CharacterType): void => {
    const index = charactersOnBoard.value.indexOf(characterType)
    if (index > -1) {
      charactersOnBoard.value.splice(index, 1)
    }
  }

  // 清空所有角色
  const clearCharactersOnBoard = (): void => {
    charactersOnBoard.value = []
  }

  // 重置遊戲狀態
  const resetGameState = (): void => {
    currentState.value = GameState.IDLE
    countdown.value = 0
    isAnimating.value = false
    hasPlayedLaunchPlayer.value = false
    charactersOnBoard.value = []
  }

  return {
    // 狀態
    currentState,
    countdown,
    isAnimating,
    hasPlayedLaunchPlayer,
    charactersOnBoard,

    // 計算屬性
    isIdle,
    isBoarding,
    isCountdown,
    isLaunching,
    isFlying,
    isDisembarking,
    isExploding,
    isCompleted,
    hasPlayerOnBoard,
    hasStreamerOnBoard,
    hasNpcOnBoard,
    boardedCharacterCount,

    // 方法
    setState,
    setCountdown,
    setAnimating,
    setLaunchPlayerPlayed,
    addCharacterToBoard,
    removeCharacterFromBoard,
    clearCharactersOnBoard,
    resetGameState
  }
}
