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
import { ButtonPrimary, Text, Flex, ButtonSecondary, Image } from 'design';

import cfg from 'teleport/config';
import history from 'teleport/services/history';

import celebratePamPng from './celebrate-pam.png';

import type { AgentStepProps } from '../../types';

export function Finished(props: AgentStepProps) {
  let resourceText;
  if (props.agentMeta && props.agentMeta.resourceName) {
    resourceText = `资源 [${props.agentMeta.resourceName}]已成功添加到
这个Ftsafe端口群集.`;
  }

  return (
    <Flex
      width="600px"
      flexDirection="column"
      alignItems="center"
      css={`
        margin: 0 auto;
        text-align: center;
      `}
    >
      <Image width="120px" height="120px" src={celebratePamPng} />
      <Text mt={3} mb={2} typography="h4" bold>
        已成功添加资源
      </Text>
      <Text mb={3}>
        {resourceText} 您可以立即开始访问此资源，也可以添加

        另一种资源。
      </Text>
      <Flex>
        <ButtonPrimary
          width="270px"
          size="large"
          onClick={() => history.push(cfg.routes.root, true)}
          mr={3}
        >
          浏览现有资源
        </ButtonPrimary>
        <ButtonSecondary
          width="270px"
          size="large"
          onClick={() => history.reload()}
        >
          添加另一个资源
        </ButtonSecondary>
      </Flex>
    </Flex>
  );
}
