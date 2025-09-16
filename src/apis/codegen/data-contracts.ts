/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ApiGameInfo {
  /** @format int32 */
  bettingCountDown?: number;
  /** @format int64 */
  liveGameId?: number;
  gameStatus?: string | null;
  /** @format int32 */
  nextRoundTime?: number;
  socketUrl?: string | null;
  socketToken?: string | null;
  gameManagerId?: string | null;
}

export interface BetAbstractDetail {
  /** @format date-time */
  orderTime?: string;
  /** @format int64 */
  refNo?: number;
  /** @format double */
  winLose?: number;
  /** @format double */
  payout?: number;
  /** @format double */
  stake?: number;
}

export interface BetAbstractDetailPagedResult {
  /** @format int32 */
  currentPage?: number;
  /** @format int32 */
  pageCount?: number;
  /** @format int32 */
  pageSize?: number;
  /** @format int32 */
  betCount?: number;
  /** @format double */
  totalStake?: number;
  /** @format double */
  totalPayout?: number;
  /** @format double */
  totalWinlose?: number;
  betList?: BetAbstractDetail[] | null;
}

export interface BetDetailResponse {
  /** @format int64 */
  refNo?: number;
  /** @format double */
  stake?: number;
  /** @format double */
  winLose?: number;
  /** @format double */
  payout?: number;
  winningOptions?: CashOrCrashOddsDetail[] | null;
  orderDetail?: CashOrCrashPlaceOrderDetail[] | null;
}

export interface BetListRequest {
  /** @format date-time */
  startTime: string;
  /** @format date-time */
  endTime: string;
  /** @format int32 */
  pageSize?: number;
  /** @format int32 */
  currentPage?: number;
}

export interface CashOrCrashOddsDetail {
  betOption?: string | null;
  /** @format double */
  odds?: number;
}

export interface CashOrCrashPlaceOrderDetail {
  betOption?: string | null;
  /** @format double */
  odds?: number;
  /** @format double */
  stake?: number;
}

export interface CashOutRequest {
  /** @format int64 */
  liveGameId?: number;
  refNo?: string | null;
}

export interface CashOutResponse {
  refNo?: string | null;
  /** @format double */
  odds?: number;
}

export interface GameInfoGameDetail {
  currentGame?: ApiGameInfo;
  gameHistory?: number[] | null;
}

export interface GameInfoPlayerDetail {
  language?: string | null;
  currency?: string | null;
  loginName?: string | null;
  playerId?: string | null;
  chips?: number[] | null;
  tableLimit?: PresentBetOptionTableLimitDetail[] | null;
  /** @format int32 */
  defaultChip?: number;
  /** @format double */
  maxBet?: number;
  /** @format double */
  minBet?: number;
  /** @format double */
  balance?: number;
  voucherInfo?: VoucherSummary;
}

export interface GameInfoRequest {
  /** @format int32 */
  tableLimitId?: number | null;
}

export interface GameInfoResponse {
  playerInfo?: GameInfoPlayerDetail;
  gameInfo?: GameInfoGameDetail;
}

export interface GetBalanceResponse {
  /** @format double */
  balance?: number;
}

export interface PlaceOrderRequest {
  betOptions: PresentPlaceOrderDetail[];
  /** @format int64 */
  liveGameId: number;
  voucherId?: string | null;
}

export interface PlaceOrderResponse {
  refNo?: string | null;
  /** @format double */
  balance?: number;
  voucherInfo?: VoucherSummary;
}

export interface PresentBetOptionTableLimitDetail {
  betOption?: string | null;
  /** @format double */
  betOptionMin?: number;
  /** @format double */
  betOptionMax?: number;
}

export interface PresentPlaceOrderDetail {
  /** @minLength 1 */
  betOption: string;
  /** @format int64 */
  stake: number;
}

export interface VoucherSummary {
  voucherId?: string | null;
  /** @format double */
  amount?: number;
  /** @format double */
  fixedStake?: number;
  /** @format date-time */
  expireDate?: string;
}

export interface CashorcrashPlayerBetdetailListParams {
  /** @format int64 */
  refNo?: number;
}

export interface CashorcrashOperatorBetdetailListParams {
  payload?: string;
  /** @format int32 */
  gameFrom?: number;
  time?: string;
}

export interface GameChannelsListParams {
  /** Bearer token for WebSocket authentication, you can get it from the game info api. */
  wsToken: any;
}

export interface CommonConsumeplayerCreatePayload {
  sessionToken: string;
}
