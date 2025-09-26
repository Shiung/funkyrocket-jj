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

import type { CommonConsumeplayerCreatePayload } from "./data-contracts";
import type { HttpClient, RequestParams } from "./http-client";
import { ContentType } from "./http-client";

export class Common<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description Call external backend to consume player session using a session token.
   *
   * @tags ConsumePlayer
   * @name CommonConsumeplayerCreate
   * @summary Consume player session
   * @request POST:/api/common/consumeplayer
   * @secure
   */
  consumeplayerCreate = (
    data: CommonConsumeplayerCreatePayload,
    params: RequestParams = {},
  ) =>
    this.http.request<
      {
        /** @format int32 */
        returnCode?: number;
        message?: string;
        authToken?: string;
      },
      void
    >({
      path: `/api/common/consumeplayer`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
}
