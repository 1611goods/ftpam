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

import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import { Box, ButtonPrimary, Text } from 'design';

import { DesktopItem } from 'teleport/Discover/Desktop/DiscoverDesktops/DesktopItem';
import { useDiscover } from 'teleport/Discover/useDiscover';
import {
  Header,
  Mark,
  ResourceKind,
  useShowHint,
} from 'teleport/Discover/Shared';
import { ProxyDesktopServiceDiagram } from 'teleport/Discover/Desktop/DiscoverDesktops/ProxyDesktopServiceDiagram';
import { usePoll } from 'teleport/Discover/Shared/usePoll';
import { useTeleport } from 'teleport';
import useStickyClusterId from 'teleport/useStickyClusterId';
import { usePingTeleport } from 'teleport/Discover/Shared/PingTeleportContext';
import cfg from 'teleport/config';
import { NavLink } from 'teleport/components/Router';
import { DiscoverEventStatus } from 'teleport/services/userEvent';

import { HintBox } from 'teleport/Discover/Shared/HintBox';

import { useJoinTokenSuspender } from 'teleport/Discover/Shared/useJoinTokenSuspender';

import type { WindowsDesktopService } from 'teleport/services/desktops';

const Desktops = styled.div`
  margin-top: 120px;
  margin-left: -40px;
  display: flex;
`;

const FoundDesktops = styled.div`
  position: relative;
  margin-left: 125px;
  margin-top: -43px;
`;

const MAX_COUNT = 14;
const POLL_INTERVAL = 1000 * 3; // 3 seconds

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ContentBox = styled.div`
  box-sizing: border-box;
  color: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.5);
  background: white;
  position: relative;
  animation: ${fadeIn} 0.9s ease-in 1s forwards;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 10px 10px 15px;
  opacity: 0;
  width: 240px;
`;

const ViewLink = styled(NavLink)`
  background: #0091ea;
  color: white;
  border-radius: 5px;
  margin-top: 10px;
  text-decoration: none;
  padding: 3px 10px;
  text-align: center;
  cursor: pointer;

  &:hover {
    background: #4db2f0;
  }
`;

export function DiscoverDesktops() {
  const ctx = useTeleport();
  const { emitEvent, nextStep } = useDiscover();

  const { joinToken } = useJoinTokenSuspender(ResourceKind.Desktop);
  const { result: desktopService, active } =
    usePingTeleport<WindowsDesktopService>(joinToken);

  const showHint = useShowHint(active);

  const [enabled, setEnabled] = useState(true);
  const { clusterId } = useStickyClusterId();

  const result = usePoll(
    signal =>
      ctx.desktopService.fetchDesktops(clusterId, { limit: MAX_COUNT }, signal),
    enabled,
    POLL_INTERVAL
  );

  const desktopServiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (enabled && result && result.agents.length === MAX_COUNT) {
      setEnabled(false);
    }
  }, [enabled, result]);

  const ref = useRef<HTMLDivElement>();

  const desktops = [];

  if (result && result.agents) {
    const foundDesktops = result.agents.filter(
      desktop => desktop.host_id === desktopService.name
    );

    if (foundDesktops.length) {
      for (const desktop of foundDesktops.values()) {
        const os =
          desktop.labels.find(label => label.name === 'teleport.dev/os')
            ?.value || '未知 os';
        const osVersion =
          desktop.labels.find(label => label.name === 'teleport.dev/os_version')
            ?.value || '未知 version';

        desktops.push({
          os,
          osVersion,
          computerName: desktop.name,
          address: desktop.addr,
        });
      }
    }
  }

  function handleNextStep() {
    emitEvent(
      { stepStatus: DiscoverEventStatus.Success },
      { autoDiscoverResourcesCount: desktops.length }
    );
    nextStep();
  }

  const items = desktops
    .slice(0, 3)
    .map((desktop, index) => (
      <DesktopItem
        key={index}
        index={index}
        os={desktop.os}
        osVersion={desktop.osVersion}
        computerName={desktop.computerName}
        address={desktop.address}
        desktopServiceElement={desktopServiceRef.current}
        containerElement={ref.current}
      />
    ));

  // We show 3 desktops maximum, and fetch 14 in order to be able to
  // display the message "We've found 10+ more desktops".
  //
  // This gives the user a better idea that a lot of desktops have been
  // discovered, without us having to fetch all of them to get an actual count.
  const extraDesktopCount = desktops.length - 3;

  let viewMore;
  if (extraDesktopCount > 0) {
    let amount = '1';
    let word = 'Desktops';
    if (extraDesktopCount === 1) {
      word = 'Desktop';
    } else {
      if (extraDesktopCount > 11) {
        amount = '10+';
      } else {
        amount = `${extraDesktopCount}`;
      }
    }

    viewMore = (
      <ContentBox key="view-more">
        我们发现 {amount} more {word}.{' '}
        <ViewLink to={cfg.getDesktopsRoute(clusterId)}>
          在此处查看所有内容
        </ViewLink>
      </ContentBox>
    );
  }

  let content;
  if (desktops.length > 0) {
    content = (
      <>
        {items}
        {viewMore}
      </>
    );
  }

  let hint;
  if (showHint && desktops.length === 0) {
    hint = (
      <Box mt={5}>
        <HintBox header="我们仍在努力探索台式机">
          <Text mb={3}>
            我们没能做到这一点可能有几个原因
            以检测您的服务器。
          </Text>

          <Text mb={1}>
            - 没有任何桌面连接到Active Directory
          </Text>

          <Text mb={3}>
            - 桌面可能在加入Teleport桌面时出现问题
            服务通过运行检查日志中的错误{' '}
            <Mark>journalctl -fu teleport</Mark> 在您的桌面服务上。
          </Text>

          <Text>
            在您诊断的同时，我们将继续尝试发现台式机
            问题，但您可以安全地离开此页面。
          </Text>
        </HintBox>
      </Box>
    );
  }

  return (
    <Box>
      <Header>发现Windows主机</Header>
      <Text>
        我们正在发现已连接到您的Active的桌面
        目录
      </Text>

      <Desktops ref={ref}>
        <ProxyDesktopServiceDiagram
          result={desktopService}
          desktopServiceRef={desktopServiceRef}
        />

        <FoundDesktops>{content}</FoundDesktops>
      </Desktops>

      {hint}

      <Box mt={5}>
        <ButtonPrimary width="165px" mr={3} onClick={handleNextStep}>
          完成
        </ButtonPrimary>
      </Box>
    </Box>
  );
}
