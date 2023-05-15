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

import { Text, Box } from 'design';

import cfg from 'teleport/config';

import { ActionButtons, Header, Step } from 'teleport/Discover/Shared';
import { State } from 'teleport/Discover/useDiscover';
import { generateCommand } from 'teleport/Discover/Shared/generateCommand';

interface Step {
  title: string;
  command: string;
}

const installActiveDirectorySteps: Step[] = [
  {
    title: '安装活动目录',
    command: generateCommand(cfg.getInstallADDSPath()),
  },
  {
    title: '安装AD证书服务',
    command: generateCommand(cfg.getInstallADCSPath()),
  },
];

export function InstallActiveDirectory(props: State) {
  return (
    <Box>
      <Header>安装活动目录</Header>

      <Text mb={4}>
        如果尚未安装,请安装 Active Directory 和 AD 证书服务。
      </Text>

      {getSteps(installActiveDirectorySteps)}

      <ActionButtons onProceed={() => props.nextStep()} />
    </Box>
  );
}

function getSteps(steps: Step[]) {
  return steps.map((step, index) => (
    <Step
      key={index}
      stepNumber={index + 1}
      title={step.title}
      text={step.command}
    />
  ));
}
