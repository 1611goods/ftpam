/**
 * Copyright 2023 Gravitational, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import styled from 'styled-components';

import logoSrc from 'design/assets/images/teleport-medallion.svg';

import { Box, Text } from 'design';

import { ButtonPrimary } from 'design/Button';

import {
  StepContent,
  StepInstructions,
  StepTitle,
  StepTitleIcon,
} from 'teleport/Discover/Desktop/ConnectTeleport/Step';

import { usePingTeleport } from 'teleport/Discover/Shared/PingTeleportContext';
import { HintBox } from 'teleport/Discover/Shared/HintBox';
import { Mark, ResourceKind, useShowHint } from 'teleport/Discover/Shared';
import { useJoinTokenSuspender } from 'teleport/Discover/Shared/useJoinTokenSuspender';

interface StartTeleportProps {
  onNext: () => void;
}

interface StepWrapperProps {
  children?: React.ReactNode;
}

function StepWrapper(props: StepWrapperProps) {
  return (
    <StepContent>
      <StepTitle>
        <StepTitleIcon>
          <TeleportIcon />
        </StepTitleIcon>
        4. 开始 Teleport
      </StepTitle>

      {props.children}
    </StepContent>
  );
}

export function StartTeleport(
  props: React.PropsWithChildren<StartTeleportProps>
) {
  const { joinToken } = useJoinTokenSuspender(ResourceKind.Desktop);
  const { active, result } = usePingTeleport(joinToken);

  const showHint = useShowHint(active);

  if (result) {
    return (
      <StepWrapper>
        <StepInstructions>
          <Text mb={4}>
            成功我们检测到您配置的新Teleport节点.
          </Text>

          <ButtonPrimary onClick={() => props.onNext()}>下一步</ButtonPrimary>
        </StepInstructions>
      </StepWrapper>
    );
  }

  let hint;
  if (showHint) {
    hint = (
      <Box mb={3}>
        <HintBox header="我们仍在寻找您的Windows桌面服务">
          <Text mb={3}>
            我们无法检测到您的服务器的原因可能有几个。
          </Text>

          <Text mb={1}>
            - 该命令没有在您试图添加的服务器上运行。
          </Text>

          <Text mb={3}>
            - 远程端口桌面服务无法加入此远程端口群集。
            通过运行{' '}
            <Mark>journalctl -fu teleport</Mark>.
            来检查日志中的错误。
          </Text>

          <Text>
            在您诊断问题时，我们将继续查找Windows桌面服务。
          </Text>
        </HintBox>
      </Box>
    );
  }

  return (
    <StepWrapper>
      <StepInstructions>
        <Text mb={4}>一旦你启动Teleport，我们就会在这里检测到它。</Text>

        {hint}

        <ButtonPrimary disabled={!result} onClick={() => props.onNext()}>
          下一步
        </ButtonPrimary>
      </StepInstructions>
    </StepWrapper>
  );
}

const TeleportIcon = styled.div`
  width: 30px;
  height: 30px;
  background: url(${logoSrc}) no-repeat;
  background-size: contain;
  top: 1px;
  position: relative;
`;
