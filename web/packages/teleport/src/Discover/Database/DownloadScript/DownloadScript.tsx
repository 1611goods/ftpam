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

import React, { Suspense, useState } from 'react';
import { Box, ButtonSecondary, Text } from 'design';
import * as Icons from 'design/Icon';
import Validation, { useRule, Validator } from 'shared/components/Validation';

import { CatchError } from 'teleport/components/CatchError';
import {
  clearCachedJoinTokenResult,
  useJoinTokenSuspender,
} from 'teleport/Discover/Shared/useJoinTokenSuspender';
import { usePingTeleport } from 'teleport/Discover/Shared/PingTeleportContext';
import { AgentLabel } from 'teleport/services/agents';
import cfg from 'teleport/config';
import { Database } from 'teleport/services/databases';

import { TextSelectCopyMulti } from 'teleport/components/TextSelectCopy';

import {
  HintBox,
  SuccessBox,
  WaitingInfo,
} from 'teleport/Discover/Shared/HintBox';

import { CommandBox } from 'teleport/Discover/Shared/CommandBox';

import {
  ActionButtons,
  DiscoverLabel,
  Header,
  HeaderSubtitle,
  LabelsCreater,
  Mark,
  ResourceKind,
  TextIcon,
  useShowHint,
} from '../../Shared';
import { makeLabelMaps, matchLabels } from '../util';

import type { AgentStepProps } from '../../types';

export default function Container(props: AgentStepProps) {
  const hasDbLabels = props.agentMeta?.agentMatcherLabels?.length;
  const dbLabels = hasDbLabels ? props.agentMeta.agentMatcherLabels : [];
  const [labels, setLabels] = useState<DiscoverLabel[]>(
    hasDbLabels
      ? dbLabels
      : // If user did not define any labels from previous step (create db)
        // then the only way the agent will know how to pick up the
        // new db is through asteriks.
        [{ name: '*', value: '*', isFixed: true }]
  );

  const [showScript, setShowScript] = useState(false);

  const labelProps = { labels, setLabels, dbLabels };

  return (
    <Validation>
      {({ validator }) => (
        <CatchError
          onRetry={() => clearCachedJoinTokenResult(ResourceKind.Database)}
          fallbackFn={fbProps => (
            <Box>
              <Heading />
              <Labels {...labelProps} />
              <Box>
                <TextIcon mt={3}>
                  <Icons.Warning ml={1} color="danger" />
                  遇到错误: {fbProps.error.message}
                </TextIcon>
              </Box>
              <ActionButtons onProceed={() => null} disableProceed={true} />
            </Box>
          )}
        >
          <Suspense
            fallback={
              <Box>
                <Heading />
                <Labels {...labelProps} disableBtns={true} />
                <ActionButtons onProceed={() => null} disableProceed={true} />
              </Box>
            }
          >
            {!showScript && (
              <Box>
                <Heading />
                <Labels {...labelProps} />
                <ButtonSecondary
                  width="200px"
                  onClick={() => setShowScript(true)}
                >
                  生成命令
                </ButtonSecondary>
                <ActionButtons onProceed={() => null} disableProceed={true} />
              </Box>
            )}
            {showScript && (
              <DownloadScript
                {...props}
                {...labelProps}
                validator={validator}
              />
            )}
          </Suspense>
        </CatchError>
      )}
    </Validation>
  );
}

export function DownloadScript(
  props: AgentStepProps & {
    labels: AgentLabel[];
    setLabels(l: AgentLabel[]): void;
    dbLabels: AgentLabel[];
    validator: Validator;
  }
) {
  // Fetches join token.
  const { joinToken } = useJoinTokenSuspender(
    ResourceKind.Database,
    props.labels
  );

  // Starts resource querying interval.
  const { active, result } = usePingTeleport<Database>(
    props.agentMeta.resourceName
  );

  const showHint = useShowHint(active);

  function handleNextStep() {
    props.updateAgentMeta({
      ...props.agentMeta,
      resourceName: result.name,
      db: result,
    });
    props.nextStep();
  }

  let hint;
  if (showHint && !result) {
    hint = (
      <HintBox header="我们仍在寻找您的数据库服务">
        <Text mb={3}>
          我们之所以没能做到这一点，可能有几个原因
          检测您的数据库服务。
        </Text>

        <Text mb={1}>
          - 该命令没有在您试图添加的服务器上运行。
        </Text>

        <Text mb={3}>
          - Teleport数据库服务无法加入此Teleport群集。
          通过运行检查日志中的错误{' '}
          <Mark>journalctl -fu teleport</Mark>.
        </Text>

        <Text>
          在您进行诊断时，我们将继续寻找数据库服务
          这个问题。
        </Text>
      </HintBox>
    );
  } else if (result) {
    hint = (
      <SuccessBox>
        成功检测到您的新Teleport数据库服务。
      </SuccessBox>
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
        运行上述命令后,我们将自动检测您的新
        Teleport数据库服务。
      </WaitingInfo>
    );
  }

  return (
    <Box>
      <Heading />
      <Labels
        labels={props.labels}
        setLabels={props.setLabels}
        disableBtns={true}
        dbLabels={props.dbLabels}
      />
      <Box mt={6}>
        <CommandBox>
          <TextSelectCopyMulti
            lines={[{ text: createBashCommand(joinToken.id) }]}
          />
        </CommandBox>
        {hint}
      </Box>
      <ActionButtons
        onProceed={handleNextStep}
        disableProceed={!result || props.labels.length === 0}
      />
    </Box>
  );
}

const Heading = () => {
  return (
    <>
      <Header>（可选）部署数据库服务</Header>
      <HeaderSubtitle>
        如果您已经拥有Teleport数据库服务，则此步骤是可选的运行
        <br />
        在将运行Teleport数据库服务的主机上，执行
        生成的命令，该命令将使用
        适当的配置。
      </HeaderSubtitle>
    </>
  );
};

export const Labels = ({
  labels,
  setLabels,
  disableBtns = false,
  dbLabels,
}: {
  labels: AgentLabel[];
  setLabels(l: AgentLabel[]): void;
  disableBtns?: boolean;
  dbLabels: AgentLabel[];
}) => {
  const { valid, message } = useRule(requireMatchingLabels(dbLabels, labels));
  const hasError = !valid;

  return (
    <Box mb={2}>
      <Text bold>标签</Text>
      <Text typography="subtitle1" mb={3}>
        至少需要一个标签来帮助此服务识别您的
        数据库
      </Text>
      <LabelsCreater
        labels={labels}
        setLabels={setLabels}
        disableBtns={disableBtns}
      />
      <Box mt={3}>
        {hasError && (
          <TextIcon mt={3}>
            <Icons.Warning ml={1} color="danger" />
            {message}
          </TextIcon>
        )}
      </Box>
    </Box>
  );
};

function createBashCommand(tokenId: string) {
  return `sudo bash -c "$(curl -fsSL ${cfg.getDbScriptUrl(tokenId)})"`;
}

const requireMatchingLabels =
  (dbLabels: AgentLabel[], agentLabels: AgentLabel[]) => () => {
    if (!hasMatchingLabels(dbLabels, agentLabels)) {
      return {
        valid: false,
        message: `标签必须与为数据库资源定义的标签匹配。
为了匹配任何键和/或任何值，可以使用星号。`,
      };
    }
    return { valid: true };
  };

// hasMatchingLabels will go through each 'agentLabels' and find matches from
// 'dbLabels'. The 'agentLabels' must have same amount of matching labels
// with 'dbLabels' either with asteriks (match all) or by exact match.
//
// `agentLabels` have OR comparison eg:
//  - If agent labels was defined like this [`fruit: apple`, `fruit: banana`]
//    it's translated as `fruit: [apple OR banana]`.
//
// Asteriks can be used for keys, values, or both key and value eg:
//  - `fruit: *` match by key `fruit` with any value
//  - `*: apple` match by value `apple` with any key
//  - `*: *` match by any key and any value
export function hasMatchingLabels(
  dbLabels: AgentLabel[],
  agentLabels: AgentLabel[]
) {
  // Convert agentLabels into a map of key of value arrays.
  const matcherLabels: Record<string, string[]> = {};
  agentLabels.forEach(l => {
    if (!matcherLabels[l.name]) {
      matcherLabels[l.name] = [];
    }
    matcherLabels[l.name] = [...matcherLabels[l.name], l.value];
  });

  // Create maps for easy lookup and matching.
  const { labelKeysToMatchMap, labelValsToMatchMap, labelToMatchSeenMap } =
    makeLabelMaps(dbLabels);

  return matchLabels({
    hasLabelsToMatch: dbLabels.length > 0,
    labelKeysToMatchMap,
    labelValsToMatchMap,
    labelToMatchSeenMap,
    matcherLabels,
  });
}
