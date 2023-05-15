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

import { InfoFilled } from 'design/Icon';

import {
  ActionButtons,
  TextBox,
  PermissionsErrorMessage,
} from 'teleport/Discover/Shared';

export function DesktopResource(props: DesktopResourceProps) {
  let content = (
    <TextBox>
      <Text typography="h5" bold mb="4px">
        <InfoFilled mr="8px" fontSize="14px" />
        注意
      </Text>
      <Text>
        Ftsafe Windows主机 Access目前仅支持由Active Directory（AD）管理的Windows桌面。

      </Text>
      <Text>我们正在努力添加对非 AD Windows主机的支持。</Text>
    </TextBox>
  );

  if (props.disabled) {
    content = (
      <PermissionsErrorMessage
        action="添加新windows主机"
        productName="windows主机访问"
      />
    );
  }

  return (
    <>
      {content}

      <ActionButtons
        hideExit={true}
        onProceed={() => props.onProceed()}
        disableProceed={props.disabled}
      />
    </>
  );
}

interface DesktopResourceProps {
  disabled: boolean;
  onProceed: () => void;
}
