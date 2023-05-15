/*
Copyright 2021-2022 Gravitational, Inc.

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

import React from 'react';
import { Indicator, Box, Card, Flex, Text } from 'design';

import useTeleport from 'teleport/useTeleport';
import {
  FeatureBox,
  FeatureHeader,
  FeatureHeaderTitle,
} from 'teleport/components/Layout';

import { useDesktops, State ,WindowsKind} from './useDesktops';
import { TabComponent } from 'design/SlideTabs/SlideTabs';


import AgentDesktops from 'teleport/Desktops/AgentDesktops';
import SlideTabs from 'design/SlideTabs';

import WindowsHostResource from 'teleport/WindowsHostResource';

interface Tab extends TabComponent {
  permissionsNeeded: boolean[];
  kind: WindowsKind;
}



export default function Container() {
  const ctx = useTeleport();
  const state = useDesktops(ctx);
  return <Desktops {...state} />;
}

export function Desktops(props: State) {

  const ctx = useTeleport();
  const userContext = ctx.storeUser.state;
  const { acl } = userContext;
  const {
    selectWindowsKind,
    onSelectWindowsKind,
  } = props

  const selectedTabIndex = WindowsKind.AgentWindows
  const tabs: Tab[] = [
    {
      name: 'Windows代理主机',
      kind: WindowsKind.AgentWindows,
      component: <TabItem  title="Windows代理主机" kind={WindowsKind.AgentWindows}  selectIndex={selectWindowsKind}/>,
      permissionsNeeded: [acl.nodes.list],
    },
    {
      name: 'Windows直连主机',
      kind: WindowsKind.DirectWindows,
      component: <TabItem  title="Windows直连主机"  kind={WindowsKind.DirectWindows}  selectIndex={selectWindowsKind}/>,
      permissionsNeeded: [acl.nodes.list],
    },
  ]



  return (
    <FeatureBox>
      <FeatureHeader alignItems="center" justifyContent="space-between">
        <FeatureHeaderTitle>Windows主机</FeatureHeaderTitle>
      </FeatureHeader>
      <Card bg="#ffffff" pl="4" pr="4" pt="2">
        <SlideTabs
          initialSelected={selectedTabIndex}
          tabs={tabs}
          onChange={index=>onSelectWindowsKind(tabs[index].kind)}
        />
        {selectWindowsKind === WindowsKind.AgentWindows && (
          <AgentDesktops />
        )}

        {selectWindowsKind === WindowsKind.DirectWindows && (
          <WindowsHostResource />
        )}
      </Card>
    </FeatureBox>
  );
}


const TabItem = ({  title,kind,selectIndex }: {  title: string,kind:WindowsKind,selectIndex:WindowsKind }) => (
  <Flex
    css={`
      align-items: center;
    `}
  >

    <Text  typography="h6" style={{color:kind==selectIndex?'#fff':'#333'}}>
      {title}
    </Text>
  </Flex>
);

