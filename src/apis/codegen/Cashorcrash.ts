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

import type {
  BetAbstractDetailPagedResult,
  BetDetailResponse,
  BetListRequest,
  CashorcrashOperatorBetdetailListParams,
  CashorcrashPlayerBetdetailListParams,
  CashOutRequest,
  CashOutResponse,
  GameInfoRequest,
  GameInfoResponse,
  GetBalanceResponse,
  PlaceOrderRequest,
  PlaceOrderResponse,
} from "./data-contracts";
import type { HttpClient, RequestParams } from "./http-client";
import { ContentType } from "./http-client";

export class Cashorcrash<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * No description
   *
   * @tags BetDetail
   * @name CashorcrashPlayerBetdetailList
   * @request GET:/api/cashorcrash/player/betdetail
   * @secure
   */
  playerBetdetailList = (
    query: CashorcrashPlayerBetdetailListParams,
    params: RequestParams = {},
  ) =>
    this.http.request<BetDetailResponse, any>({
      path: `/api/cashorcrash/player/betdetail`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags BetDetail
   * @name CashorcrashPlayerBetlistCreate
   * @request POST:/api/cashorcrash/player/betlist
   * @secure
   */
  playerBetlistCreate = (data: BetListRequest, params: RequestParams = {}) =>
    this.http.request<BetAbstractDetailPagedResult, any>({
      path: `/api/cashorcrash/player/betlist`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags BetDetail
   * @name CashorcrashOperatorBetdetailList
   * @request GET:/api/cashorcrash/operator/betdetail
   * @secure
   */
  operatorBetdetailList = (
    query: CashorcrashOperatorBetdetailListParams,
    params: RequestParams = {},
  ) =>
    this.http.request<BetDetailResponse, any>({
      path: `/api/cashorcrash/operator/betdetail`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags CashOut
   * @name CashorcrashCashOutCreate
   * @request POST:/api/cashorcrash/CashOut
   * @secure
   */
  cashOutCreate = (data: CashOutRequest, params: RequestParams = {}) =>
    this.http.request<CashOutResponse, any>({
      path: `/api/cashorcrash/CashOut`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Request body 請留空，無須帶入 tableLimitId
   *
   * @tags GameInfo
   * @name CashorcrashGameInfoCreate
   * @request POST:/api/cashorcrash/GameInfo
   * @secure
   */
  gameInfoCreate = (data: GameInfoRequest, params: RequestParams = {}) =>
    this.http.request<GameInfoResponse, any>({
      path: `/api/cashorcrash/GameInfo`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags GetBalance
   * @name CashorcrashGetBalanceList
   * @request GET:/api/cashorcrash/GetBalance
   * @secure
   */
  getBalanceList = (params: RequestParams = {}) =>
    this.http.request<GetBalanceResponse, any>({
      path: `/api/cashorcrash/GetBalance`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description betoption 請帶 'OnBoard'
   *
   * @tags PlaceOrder
   * @name CashorcrashPlaceOrderCreate
   * @request POST:/api/cashorcrash/PlaceOrder
   * @secure
   */
  placeOrderCreate = (data: PlaceOrderRequest, params: RequestParams = {}) =>
    this.http.request<PlaceOrderResponse, any>({
      path: `/api/cashorcrash/PlaceOrder`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
