/*
Copyright 2019-2022 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { useEffect, } from 'react';
import { Indicator, Box, Flex, Image, Text, Card } from 'design';
import { useLocation,useHistory } from 'react-router';

import {
  FeatureBox,

} from 'teleport/components/Layout';

import useTeleport from 'teleport/useTeleport';
import useStickyClusterId from 'teleport/useStickyClusterId';
import AgentLinux from 'teleport/Nodes/AgentLinux';
import LinuxHostsResource from 'teleport/LinuxHostsResource';
import { useNodes, State, LinuxKind } from './useNodes';
import SlideTabs from 'design/SlideTabs';
import { TabComponent } from 'design/SlideTabs/SlideTabs';
export default function Container() {
  const teleCtx = useTeleport();
  const state = useNodes(teleCtx);
  useEffect(() => {
    return () => {};
  }, []);
  return <Nodes {...state} />;
}


interface Tab extends TabComponent {
  permissionsNeeded: boolean[];
  kind: LinuxKind;
}


export function Nodes(props: State) {
  const ctx = useTeleport();
  const userContext = ctx.storeUser.state;
  const { acl } = userContext;
  const {
    onSelectLinuxKind,
    selectLinuxKind,
  } = props
  const history = useHistory();
  const location = useLocation<any>()
  const { clusterId } = useStickyClusterId();
  let selectedTabIndex = location.state ? location.state.index : LinuxKind.AgentLinux;
  const tabs: Tab[] = [
    {
      name: 'Linux代理主机',
      kind: LinuxKind.AgentLinux,
      component: <TabItem title="Linux代理主机" kind={LinuxKind.AgentLinux} selectIndex={selectLinuxKind} />,
      permissionsNeeded: [acl.nodes.list],
    },
    {
      name: 'Linux直连主机',
      kind: LinuxKind.DirectLinux,
      component: <TabItem title="Linux直连主机" kind={LinuxKind.DirectLinux} selectIndex={selectLinuxKind} />,
      permissionsNeeded: [acl.nodes.list],
    },
  ]

  return (
    <>
      <FeatureBox>
        <Card bg="#ffffff" pl="4" pr="4" mt="4" pt="2">
          <SlideTabs
            initialSelected={selectedTabIndex}
            tabs={tabs}
            onChange={index => {
              history.replace({ pathname:`/web/cluster/${clusterId}/nodes`, state: { index: index } })
              onSelectLinuxKind(tabs[index].kind)
            }}
          />
          {selectedTabIndex === LinuxKind.AgentLinux && (
            <AgentLinux />
          )}

          {selectedTabIndex === LinuxKind.DirectLinux && (
            <LinuxHostsResource />
          )}
        </Card>
      </FeatureBox>
    </>

  );
}

const TabItem = ({ title, kind, selectIndex }: { title: string, kind: LinuxKind, selectIndex: LinuxKind }) => (
  <Flex
    css={`
      align-items: center;
    `}
  >

    <Text typography="h6" style={{ color: kind == selectIndex ? '#fff' : '#333' }}>
      {title}
    </Text>
  </Flex>
);
