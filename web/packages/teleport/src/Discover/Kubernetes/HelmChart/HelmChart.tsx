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
import styled from 'styled-components';
import { Box, ButtonSecondary, Link, Text } from 'design';
import * as Icons from 'design/Icon';
import FieldInput from 'shared/components/FieldInput';
import Validation, { Validator } from 'shared/components/Validation';
import { requiredField } from 'shared/components/Validation/rules';

import { TextSelectCopyMulti } from 'teleport/components/TextSelectCopy';
import { CatchError } from 'teleport/components/CatchError';
import {
  clearCachedJoinTokenResult,
  useJoinTokenSuspender,
} from 'teleport/Discover/Shared/useJoinTokenSuspender';
import useTeleport from 'teleport/useTeleport';
import { usePingTeleport } from 'teleport/Discover/Shared/PingTeleportContext';

import {
  HintBox,
  SuccessBox,
  WaitingInfo,
} from 'teleport/Discover/Shared/HintBox';

import { CommandBox } from 'teleport/Discover/Shared/CommandBox';

import {
  ActionButtons,
  Header,
  HeaderSubtitle,
  Mark,
  ResourceKind,
  TextIcon,
  useShowHint,
} from '../../Shared';

import type { AgentStepProps } from '../../types';
import type { JoinToken } from 'teleport/services/joinToken';
import type { AgentMeta, KubeMeta } from 'teleport/Discover/useDiscover';
import type { Kube } from 'teleport/services/kube';

export default function Container(props: AgentStepProps) {
  const [namespace, setNamespace] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [showHelmChart, setShowHelmChart] = useState(false);

  return (
    // This outer CatchError and Suspense handles
    // join token api fetch error and loading states.
    <CatchError
      onRetry={() => clearCachedJoinTokenResult(ResourceKind.Kubernetes)}
      fallbackFn={props => (
        <Box>
          <Heading />
          <StepOne />
          <StepTwo
            onEdit={() => setShowHelmChart(false)}
            error={props.error}
            namespace={namespace}
            setNamespace={setNamespace}
            clusterName={clusterName}
            setClusterName={setClusterName}
          />
          <ActionButtons onProceed={() => null} disableProceed={true} />
        </Box>
      )}
    >
      <Suspense
        fallback={
          <Box>
            <Heading />
            <StepOne />
            <StepTwo
              onEdit={() => setShowHelmChart(false)}
              namespace={namespace}
              setNamespace={setNamespace}
              clusterName={clusterName}
              setClusterName={setClusterName}
            />
            <ActionButtons onProceed={() => null} disableProceed={true} />
          </Box>
        }
      >
        {!showHelmChart && (
          <Box>
            <Heading />
            <StepOne />
            <StepTwo
              onEdit={() => setShowHelmChart(false)}
              generateScript={() => setShowHelmChart(true)}
              namespace={namespace}
              setNamespace={setNamespace}
              clusterName={clusterName}
              setClusterName={setClusterName}
            />
            <ActionButtons onProceed={() => null} disableProceed={true} />
          </Box>
        )}
        {showHelmChart && (
          <HelmChart
            {...props}
            onEdit={() => setShowHelmChart(false)}
            namespace={namespace}
            setNamespace={setNamespace}
            clusterName={clusterName}
            setClusterName={setClusterName}
          />
        )}
      </Suspense>
    </CatchError>
  );
}

export function HelmChart(
  props: AgentStepProps & {
    onEdit: () => void;
    namespace: string;
    setNamespace(n: string): void;
    clusterName: string;
    setClusterName(c: string): void;
  }
) {
  const { joinToken, reloadJoinToken } = useJoinTokenSuspender(
    ResourceKind.Kubernetes
  );

  return (
    <Box>
      <Heading />
      <StepOne />
      <StepTwo
        disabled={true}
        onEdit={() => props.onEdit()}
        generateScript={reloadJoinToken}
        namespace={props.namespace}
        setNamespace={props.setNamespace}
        clusterName={props.clusterName}
        setClusterName={props.setClusterName}
      />
      <InstallHelmChart
        namespace={props.namespace}
        clusterName={props.clusterName}
        joinToken={joinToken}
        nextStep={props.nextStep}
        updateAgentMeta={props.updateAgentMeta}
      />
    </Box>
  );
}

const Heading = () => {
  return (
    <>
      <Header>配置资源</Header>
      <HeaderSubtitle>
        通过 Helm 在您的集群中安装传送服务，以轻松地将您的 Kubernetes 集群与传送连接。

      </HeaderSubtitle>
    </>
  );
};

const StepOne = () => {
  return (
    <StyledBox mb={5}>
      <Text bold>步骤 1</Text>
      <Text typography="subtitle1" mb={3}>
        将传送代理图表添加到图表存储库
      </Text>
      <TextSelectCopyMulti
        lines={[
          {
            text: 'helm repo add teleport https://charts.releases.teleport.dev && helm repo update',
          },
        ]}
      />
    </StyledBox>
  );
};

const StepTwo = ({
  namespace,
  setNamespace,
  clusterName,
  setClusterName,
  error,
  generateScript,
  disabled,
  onEdit,
}: {
  error?: Error;
  generateScript?(): void;
  namespace: string;
  setNamespace(n: string): void;
  clusterName: string;
  setClusterName(c: string): void;
  disabled?: boolean;
  onEdit: () => void;
}) => {
  function handleSubmit(validator: Validator) {
    if (!validator.validate()) {
      return;
    }
    generateScript();
  }

  return (
    <StyledBox mb={5}>
      <Text bold>步骤 2</Text>
      <Text typography="subtitle1" mb={3}>
        生成一个命令以自动配置和安装
        传送代理命名空间
      </Text>
      <Validation>
        {({ validator }) => (
          <>
            <Box mb={4}>
              <FieldInput
                mb={3}
                disabled={disabled}
                rule={requiredField('命名空间是必需的')}
                label="Teleport 服务命名空间"
                autoFocus
                value={namespace}
                placeholder="teleport"
                width="100%"
                mr="3"
                onChange={e => setNamespace(e.target.value)}
              />
              <FieldInput
                disabled={disabled}
                rule={requiredField('KUBERNETES 集群名称为必填项')}
                label="KUBERNETES 集群名称"
                labelTip="向连接到集群的传送用户显示的名称"
                value={clusterName}
                placeholder="my-cluster"
                width="100%"
                mr="3"
                onChange={e => setClusterName(e.target.value)}
              />
            </Box>
            {disabled ? (
              <ButtonSecondary
                width="200px"
                type="submit"
                onClick={() => onEdit()}
              >
                编辑
              </ButtonSecondary>
            ) : (
              <ButtonSecondary
                width="200px"
                type="submit"
                onClick={() => handleSubmit(validator)}
              >
                下一个
              </ButtonSecondary>
            )}
          </>
        )}
      </Validation>
      {error && (
        <Box>
          <TextIcon mt={3}>
            <Icons.Warning ml={1} color="danger" />
            遇到错误: {error.message}
          </TextIcon>
        </Box>
      )}
    </StyledBox>
  );
};

const generateCmd = (data: {
  namespace: string;
  clusterName: string;
  proxyAddr: string;
  tokenId: string;
  clusterVersion: string;
  resourceId: string;
  isEnterprise: boolean;
  isCloud: boolean;
  automaticUpgradesEnabled: boolean;
}) => {
  let extraYAMLConfig = '';

  if (data.isEnterprise) {
    extraYAMLConfig += 'enterprise: true\n';
  }

  if (data.isCloud && data.automaticUpgradesEnabled) {
    extraYAMLConfig += 'updater:\n';
    extraYAMLConfig += '    enabled: true\n';
    extraYAMLConfig += '    releaseChannel: "stable/cloud"\n';
    extraYAMLConfig += 'highAvailability:\n';
    extraYAMLConfig += '    replicaCount: 2\n';
    extraYAMLConfig += '    podDisruptionBudget:\n';
    extraYAMLConfig += '        enabled: true\n';
    extraYAMLConfig += '        minAvailable: 1\n';
  }

  return `cat << EOF > prod-cluster-values.yaml
roles: kube
authToken: ${data.tokenId}
proxyAddr: ${data.proxyAddr}
kubeClusterName: ${data.clusterName}
labels:
    teleport.internal/resource-id: ${data.resourceId}
${extraYAMLConfig}EOF
 
helm install teleport-agent teleport/teleport-kube-agent -f prod-cluster-values.yaml --version ${data.clusterVersion} --create-namespace --namespace ${data.namespace}`;
};

const InstallHelmChart = ({
  namespace,
  clusterName,
  joinToken,
  nextStep,
  updateAgentMeta,
}: {
  namespace: string;
  clusterName: string;
  joinToken: JoinToken;
  nextStep(): void;
  updateAgentMeta(a: AgentMeta): void;
}) => {
  const ctx = useTeleport();

  const version = ctx.storeUser.state.cluster.authVersion;
  const { hostname, port } = window.document.location;
  const host = `${hostname}:${port || '443'}`;

  // Starts resource querying interval.
  const { result, active } = usePingTeleport<Kube>(joinToken);

  const showHint = useShowHint(active);

  let hint;
  if (showHint && !result) {
    hint = (
      <HintBox header="我们仍在寻找您的服务器">
        <Text mb={3}>
          我们之所以没能做到这一点，可能有几个原因
          检测您的 Kubernetes cluster.
        </Text>

        <Text mb={1}>
          - 该命令没有在您试图添加的服务器上运行。
        </Text>

        <Text mb={3}>
          - Teleport服务无法加入此Teleport cluster。检查通过运行记录错误
          <Mark>kubectl logs -l app=teleport-agent -n {namespace}</Mark>
        </Text>

        <Text>
          在您进行诊断的同时，我们将继续寻找您的Kubernetes cluster
          这个问题。
        </Text>
      </HintBox>
    );
  } else if (result) {
    hint = (
      <SuccessBox>
        成功检测到您的新 Kubernetes cluster.
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
        运行上述命令后,我们将自动检测您的新 Kubernetes 集群。
      </WaitingInfo>
    );
  }

  function handleOnProceed() {
    updateAgentMeta({
      kube: result,
      resourceName: result.name,
    } as KubeMeta);

    nextStep();
  }

  const command = generateCmd({
    namespace,
    clusterName,
    proxyAddr: host,
    tokenId: joinToken.id,
    clusterVersion: version,
    resourceId: joinToken.internalResourceId,
    isEnterprise: ctx.isEnterprise,
    isCloud: ctx.isCloud,
    automaticUpgradesEnabled: ctx.automaticUpgradesEnabled,
  });

  return (
    <>
      <CommandBox
        header={
          <>
            <Text bold>步骤 3</Text>
            <Text typography="subtitle1" mb={3}>
              在运行 Kubernetes 集群的服务器上运行以下命令。运行命令后，传送服务最多可能需要一分钟才能加入。
            </Text>
          </>
        }
      >
        <TextSelectCopyMulti lines={[{ text: command }]} />
      </CommandBox>
      {hint}
      <ActionButtons onProceed={handleOnProceed} disableProceed={!result} />
    </>
  );
};

const StyledBox = styled(Box)`
  max-width: 1000px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: ${props => `${props.theme.space[3]}px`};
  border-radius: ${props => `${props.theme.space[2]}px`};
  border: 2px solid #2f3659;
`;
