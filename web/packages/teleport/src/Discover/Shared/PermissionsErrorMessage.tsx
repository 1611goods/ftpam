/**
 * Copyright 2022 Gravitational, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';

import { Text } from 'design';

import { TextBox } from 'teleport/Discover/Shared';

export function PermissionsErrorMessage(props: PermissionsErrorMessageProps) {
  return (
    <TextBox>
      <Text typography="h5">
        你不能 {props.action}. 有两个可能的原因
        这个：
      </Text>
      <ul style={{ paddingLeft: 28 }}>
        <li>
          您的Ftsafe 企业许可证不包括{props.productName}.
          联系您的Ftsafe 管理员以启用{props.productName}
          .
        </li>
        <li>
          您没有足够的权限 {props.action}。 联系
          您的Ftsafe管理员请求其他权限。
        </li>
      </ul>
    </TextBox>
  );
}

interface PermissionsErrorMessageProps {
  action: string;
  productName: string;
}
