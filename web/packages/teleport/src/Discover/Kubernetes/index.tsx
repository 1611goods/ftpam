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

import { Kubernetes } from 'design/Icon';

import { Finished, ResourceKind } from 'teleport/Discover/Shared';
import { Resource } from 'teleport/Discover/flow';
import { DiscoverEvent } from 'teleport/services/userEvent';

import { KubeWrapper } from './KubeWrapper';
import { SetupAccess } from './SetupAccess';
import { HelmChart } from './HelmChart';
import { TestConnection } from './TestConnection';

export const KubernetesResource: Resource = {
  kind: ResourceKind.Kubernetes,
  icon: <Kubernetes />,
  wrapper: (component: React.ReactNode) => (
    <KubeWrapper>{component}</KubeWrapper>
  ),
  shouldPrompt(currentStep) {
    // do not prompt on exit if they're selecting a resource
    return currentStep !== 0;
  },
  views: [
    {
      title: '选择资源类型',
      eventName: DiscoverEvent.ResourceSelection,
    },
    {
      title: '配置资源',
      component: HelmChart,
      eventName: DiscoverEvent.DeployService,
    },
    {
      title: '设置访问权限',
      component: SetupAccess,
      eventName: DiscoverEvent.PrincipalsConfigure,
    },
    {
      title: ' 测试连接',
      component: TestConnection,
      eventName: DiscoverEvent.TestConnection,
      manuallyEmitSuccessEvent: true,
    },
    {
      title: 'Finished',
      component: Finished,
      hide: true,
      eventName: DiscoverEvent.Completed,
    },
  ],
};
