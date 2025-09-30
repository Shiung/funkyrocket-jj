/** interface expand types */
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export enum ActionType {
  /**
   * @switchTo IDLE
   * @action
   * @description 新的一局遊戲開啟。
  */
  JOIN_GAME = 0,
  /** @deprecated 已棄用 */
  UPDATE_PLAYER_COUNT = 1,
  /**
   * @switchTo BOARDING
   * @action
   * @description 新的一局開始
   * @param countDown 該局開始倒數的秒數
  */
  OPEN_BET = 2,
  /**
   * @switchTo LAUNCHING
   * @action
   * @description 停止收注
  */
  CLOSE_BET = 3,
  /**
   * @switchTo EXPLODING
   * @action
   * @description 火箭爆炸，爆炸時的秒數及結果
  */
  GAME_RESULT = 4,
  /**
   * @switchTo COMPLETED
   * @action
   * @description 後端結算
  */
  BET_RESULT = 5,
  /**
   * @switchTo BOARDING | COUNTDOWN（剩五秒才切到COUNTDOWN）
   * @action
   * @description
   * @param countDown 現在秒數值，每秒更新，第一個訊息與 OPEN_BET 同時
  */
  SYNC_TIMER = 8,
  /**
   * @switchTo
   * @action 給遊戲端資料
   * @description 過去 30 局結果，最高長度為 30，新紀錄會出現在陣列前面，超過 30 局會 pop 掉舊的資料
  */
  GET_HISTORY = 10,
  /**
   * @switchTo
   * @action BOARDING時用遊戲端給的帳號判斷NPC或主播上船，更新右上角資訊
   * @param onBoards 目前上船人數
   * @param othersPlayers 最新上船玩家列表，最高長度為 12，新上船的玩家會出現在陣列前面，超過 12 人會 pop 掉舊的資料
   * 
  */
  UPDATE_OTHER_CHIPS = 11,
  /**
   * @switchTo
   * @action EXPLODING或COMPLETED時通知遊戲端要更新餘額
   * @description 提醒前端發送 get balance 請求
  */
  GET_BALANCE = 12,
  /**
   * @switchTo DISEMBARKING
   * @action 更新左上跟中上資訊
   * @description 火箭進度
   * @param currentSecond 當前經過的秒數
   * @param odds 當前賠率
  */
  DRAWING = 14,
  /**
   * @switchTo
   * @action DISEMBARKING時跳船，遊戲端會給主播帳號，要判斷主播或NPC跳船
   * @description 在 DRAWING 階段時會不定時發送
   * @param onBoards 目前仍在船上人數，
   * @param othersCashOut 最近 12 個 cashout 的玩家，最高長度為 12，
   * @param oddsCount 與上次收到該訊息時的資料相比，新跳出的玩家賠率及人數統計
  */
  CASH_OUT = 15,
}

interface CommonMessage<T> {
  action: T
  liveGameId: number
}

interface JoinGameMessage extends CommonMessage<ActionType.JOIN_GAME> {
  createdGameTime: string
}

interface OpenBetMessage extends CommonMessage<ActionType.OPEN_BET> {
  countDown: number
}

type CloseBetMessage = CommonMessage<ActionType.CLOSE_BET>

interface GameResultMessage extends CommonMessage<ActionType.GAME_RESULT> {
  currentSecond: number
  odds: number
}

type BetResultMessage = CommonMessage<ActionType.BET_RESULT>

interface SyncTimerMessage extends CommonMessage<ActionType.SYNC_TIMER> {
  countDown: number
}

interface GetHistoryMessage extends CommonMessage<ActionType.GET_HISTORY> {
  gameHistory: Array<number>
}

interface UpdateOtherChipsMessage extends CommonMessage<ActionType.UPDATE_OTHER_CHIPS> {
  onBoards: number
  othersPlayers: Array<{
    playerName: string
    playerId: string
  }>
}

type GetBalanceMessage = CommonMessage<ActionType.GET_BALANCE>

interface DrawingMessage extends CommonMessage<ActionType.DRAWING> {
  currentSecond: number
  odds: number
}

interface CashOutMessage extends CommonMessage<ActionType.CASH_OUT> {
  onBoards: number
  othersCashOut: Array<{
    playerName: string
    playerId: string
    odds: number
  }>
  oddsCount: Array<{
    odds: number
    count: number
  }>
}

export type MessageMap = {
  [ActionType.JOIN_GAME]: Expand<JoinGameMessage>
  [ActionType.OPEN_BET]: Expand<OpenBetMessage>
  [ActionType.CLOSE_BET]: Expand<CloseBetMessage>
  [ActionType.GAME_RESULT]: Expand<GameResultMessage>
  [ActionType.BET_RESULT]: Expand<BetResultMessage>
  [ActionType.SYNC_TIMER]: Expand<SyncTimerMessage>
  [ActionType.GET_HISTORY]: Expand<GetHistoryMessage>
  [ActionType.UPDATE_OTHER_CHIPS]: Expand<UpdateOtherChipsMessage>
  [ActionType.GET_BALANCE]: Expand<GetBalanceMessage>
  [ActionType.DRAWING]: Expand<DrawingMessage>
  [ActionType.CASH_OUT]: Expand<CashOutMessage>
}
