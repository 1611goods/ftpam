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

import React, { useState } from 'react';
import SlideTabs from 'design/SlideTabs';
import { Box, Flex, Image, Text } from 'design';

import AddApp from 'teleport/Apps/AddApp';
import AddDatabase from 'teleport/Discover/Database/AddDatabaseModal';
import useTeleport from 'teleport/useTeleport';

import { Acl } from 'teleport/services/user';

import { ResourceKind, Header, HeaderSubtitle } from 'teleport/Discover/Shared';
import {
  DiscoverEvent,
  DiscoverEventStatus,
} from 'teleport/services/userEvent';

import { ApplicationResource } from '../Application/ApplicationResource';
import { DatabaseResource } from '../Database/DatabaseResource';
import { DesktopResource } from '../Desktop/DesktopResource';
import { KubernetesResource } from '../Kubernetes/KubernetesResource';
import { ServerResource } from '../Server/ServerResource';
import { DatabaseEngine, DatabaseLocation } from '../Database/resources';
import { useDiscover } from '../useDiscover';

import k8sIcon from './assets/kubernetes.png';
import serverIcon from './assets/server.png';
import databaseIcon from './assets/database.png';
import applicationIcon from './assets/application.png';

import type { TabComponent } from 'design/SlideTabs/SlideTabs';
import type { Database } from '../Database/resources';

function checkPermissions(acl: Acl, tab: Tab) {
  const basePermissionsNeeded = [acl.tokens.create];

  const permissionsNeeded = [
    ...basePermissionsNeeded,
    ...tab.permissionsNeeded,
  ];

  // if some (1+) are false, we do not have enough permissions
  return permissionsNeeded.some(value => !value);
}

interface Tab extends TabComponent {
  permissionsNeeded: boolean[];
  kind: ResourceKind;
}

interface SelectResourceProps<T = any> {
  onSelect: (kind: ResourceKind) => void;
  onNext: () => void;
  selectedResourceKind: ResourceKind;
  resourceState: T;
}

export function SelectResource(props: SelectResourceProps) {
  const ctx = useTeleport();
  const { emitEvent } = useDiscover();

  const userContext = ctx.storeUser.state;
  const { acl } = userContext;

  const [showAddApp, setShowAddApp] = useState(false);
  const [showAddDB, setShowAddDB] = useState(false);

  const tabs: Tab[] = [
    {
      name: 'Linux主机',
      kind: ResourceKind.Server,
      component: <TabItem iconSrc={serverIcon} title="Linux主机" kind={ ResourceKind.Server}  selectIdnex={props.selectedResourceKind}/>,
      permissionsNeeded: [acl.nodes.list],
    },
    {
      name: 'Windows主机',
      kind: ResourceKind.Desktop,
      component: <TabItem iconSrc={serverIcon} title="Windows主机"  kind={ ResourceKind.Desktop}  selectIdnex={props.selectedResourceKind}/>,
      permissionsNeeded: [acl.desktops.read, acl.desktops.list],
    },

    {
      name: '数据库',
      kind: ResourceKind.Database,
      component: <TabItem iconSrc={databaseIcon} title="数据库"  kind={ ResourceKind.Database}  selectIdnex={props.selectedResourceKind} />,
      permissionsNeeded: [acl.dbServers.read, acl.dbServers.list],
    },

    {
      name: 'Kubernetes',
      kind: ResourceKind.Kubernetes,
      component: <TabItem iconSrc={k8sIcon} title="Kubernetes"  kind={ ResourceKind.Kubernetes}   selectIdnex={props.selectedResourceKind}/>,
      permissionsNeeded: [acl.kubeServers.read, acl.kubeServers.list],
    },

    {
      name: '应用',
      kind: ResourceKind.Application,
      component: <TabItem iconSrc={applicationIcon} title="应用"  kind={ ResourceKind.Application}   selectIdnex={props.selectedResourceKind}/>,
      permissionsNeeded: [acl.appServers.read, acl.appServers.list],
    },

  ];

  const index = tabs.findIndex(
    component => component.kind === props.selectedResourceKind
  );
  const selectedTabIndex = Math.max(0, index);

  const disabled = checkPermissions(acl, tabs[selectedTabIndex]);

  return (
    <Box>
      <Header>选择资源类型</Header>
      <HeaderSubtitle>
        用户可以通过传送添加和访问许多不同类型的资源。首先选择要添加的资源类型。
      </HeaderSubtitle>
      <SlideTabs
        initialSelected={selectedTabIndex}
        tabs={tabs}
        onChange={index => props.onSelect(tabs[index].kind)}
      />
      {props.selectedResourceKind === ResourceKind.Database && (
        <DatabaseResource
          disabled={disabled}
          onProceed={() => {
            const state = props.resourceState as Database;
            if (state.location === DatabaseLocation.SelfHosted) {
              if (
                state.engine === DatabaseEngine.PostgreSQL ||
                state.engine === DatabaseEngine.MySQL
              ) {
                props.onNext();
                return;
              }
            }

            if (state.location === DatabaseLocation.AWS) {
              if (
                state.engine === DatabaseEngine.PostgreSQL ||
                state.engine === DatabaseEngine.MySQL
              ) {
                props.onNext();
                return;
              }
            }

            // Unsupported databases will default to the modal popup.
            emitEvent({ stepStatus: DiscoverEventStatus.Success });
            return setShowAddDB(true);
          }}
        />
      )}
      {props.selectedResourceKind === ResourceKind.Application && (
        <ApplicationResource
          disabled={disabled}
          onProceed={() => {
            setShowAddApp(true);
            emitEvent(
              { stepStatus: DiscoverEventStatus.Success },
              { eventName: DiscoverEvent.ResourceSelection }
            );
          }}
        />
      )}
      {props.selectedResourceKind === ResourceKind.Desktop && (
        <DesktopResource disabled={disabled} onProceed={() => props.onNext()} />
      )}
      {props.selectedResourceKind === ResourceKind.Kubernetes && (
        <KubernetesResource
          disabled={disabled}
          onProceed={() => props.onNext()}
        />
      )}
      {props.selectedResourceKind === ResourceKind.Server && (
        <ServerResource disabled={disabled} onProceed={() => props.onNext()} />
      )}
      {showAddApp && <AddApp onClose={() => setShowAddApp(false)} />}
      {showAddDB && (
        <AddDatabase
          isEnterprise={ctx.isEnterprise}
          username={userContext.username}
          version={userContext.cluster.authVersion}
          authType={userContext.authType}
          onClose={() => setShowAddDB(false)}
          selectedDb={props.resourceState}
        />
      )}
    </Box>
  );
}

const TabItem = ({ iconSrc, title ,kind,selectIdnex}: { iconSrc: string; title: string  ,kind:ResourceKind,selectIdnex:ResourceKind}) => (
  <Flex
    css={`
      align-items: center;
    `}
  >
    <Image src={iconSrc} width="32px" mr={2} />
    <Text bold typography="h5" style={{color:selectIdnex == kind?'#ffffff':'#333'}}>
      {title}
    </Text>
  </Flex>
);
