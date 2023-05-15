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

import React, { Suspense, useEffect, useState } from 'react';

import { Box, Indicator, Text } from 'design';
import * as Icons from 'design/Icon';

import cfg from 'teleport/config';
import { CatchError } from 'teleport/components/CatchError';
import {
  clearCachedJoinTokenResult,
  useJoinTokenSuspender,
} from 'teleport/Discover/Shared/useJoinTokenSuspender';
import { usePingTeleport } from 'teleport/Discover/Shared/PingTeleportContext';
import { JoinToken } from 'teleport/services/joinToken';

import { TextSelectCopyMulti } from 'teleport/components/TextSelectCopy';

import { CommandBox } from 'teleport/Discover/Shared/CommandBox';

import {
  HintBox,
  SuccessBox,
  WaitingInfo,
} from 'teleport/Discover/Shared/HintBox';

import { AgentStepProps } from '../../types';

import {
  ActionButtons,
  Header,
  HeaderSubtitle,
  Mark,
  ResourceKind,
  TextIcon,
} from '../../Shared';

import type { Node } from 'teleport/services/nodes';

const SHOW_HINT_TIMEOUT = 1000 * 60 * 5; // 5 minutes

export default function Container(props: AgentStepProps) {
  return (
    <CatchError
      onRetry={() => clearCachedJoinTokenResult(ResourceKind.Server)}
      fallbackFn={props => (
        <Template nextStep={() => null}>
          <TextIcon mt={2} mb={3}>
            <Icons.Warning ml={1} color="danger" />
            Encountered Error: {props.error.message}
          </TextIcon>
        </Template>
      )}
    >
      <Suspense
        fallback={
          <Box height="144px">
            <Template nextStep={() => null}>
              <Box textAlign="center" height="108px">
                <Indicator delay="none" />
              </Box>
            </Template>
          </Box>
        }
      >
        <DownloadScript {...props} />
      </Suspense>
    </CatchError>
  );
}

export function DownloadScript(props: AgentStepProps) {
  // Fetches join token.
  const { joinToken } = useJoinTokenSuspender(ResourceKind.Server);
  // Starts resource querying interval.
  const { result, active } = usePingTeleport<Node>(joinToken);

  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (active) {
      const id = window.setTimeout(() => setShowHint(true), SHOW_HINT_TIMEOUT);

      return () => window.clearTimeout(id);
    }
  }, [active]);

  function handleNextStep() {
    props.updateAgentMeta({
      ...props.agentMeta,
      // Node is an oddity in that the hostname is the more
      // user identifiable resource name and what user expects
      // as the resource name.
      resourceName: result.hostname,
      node: result,
    });
    props.nextStep();
  }

  let hint;
  if (showHint && !result) {
    hint = (
      <HintBox header="我们仍在寻找您的服务器">
        <Text mb={3}>
          我们之所以没能做到这一点，可能有几个原因
          检测您的服务器。
        </Text>

        <Text mb={1}>
          - 该命令没有在您试图添加的服务器上运行。
        </Text>

        <Text mb={3}>
          - Teleport SSH服务无法加入此Teleport群集。检查
          运行的错误日志<Mark>journalctl -fu teleport</Mark>.
        </Text>

        <Text>
          在您诊断问题时，我们将继续查找服务器。
        </Text>
      </HintBox>
    );
  } else if (result) {
    hint = (
      <SuccessBox>已成功检测到您的新Teleport实例。</SuccessBox>
    );
  } else {
    hint = (
      <WaitingInfo>
        <TextIcon
          css={`
            white-space: pre;
          `}
        >
          <Icons.Restore fontSize={4} />
        </TextIcon>
        运行上述命令后，我们将自动检测您的新传送实例。
      </WaitingInfo>
    );
  }

  return (
    <>
      <Header>配置资源</Header>
      <HeaderSubtitle>
        安装和配置传送SSH服务。
        <br />
        在要添加的服务器上运行以下命令。
      </HeaderSubtitle>
      <CommandBox>
        <TextSelectCopyMulti
          lines={[{ text: createBashCommand(joinToken.id) }]}
        />
      </CommandBox>
      {hint}
      <ActionButtons onProceed={handleNextStep} disableProceed={!result} />
    </>
  );
}

const Template = ({
  nextStep,
  children,
}: {
  nextStep(): void;
  children: React.ReactNode;
}) => {
  return (
    <>
      <Header>配置资源</Header>
      <HeaderSubtitle>
        安装和配置传送SSH服务。
        <br />
        在要添加的服务器上运行以下命令。
      </HeaderSubtitle>
      <CommandBox>{children}</CommandBox>
      <ActionButtons onProceed={nextStep} disableProceed={true} />
    </>
  );
};

function createBashCommand(tokenId: string) {
  return `sudo bash -c "$(curl -fsSL ${cfg.getNodeScriptUrl(tokenId)})"`;
}

export type State = {
  joinToken: JoinToken;
  nextStep(): void;
  regenerateScriptAndRepoll(): void;
};
