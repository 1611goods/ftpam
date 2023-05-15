/*
Copyright 2022 Gravitational, Inc.

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
import { Link } from 'react-router-dom';
import { ButtonPrimary } from 'design';
import cfg from 'teleport/config';
export default function AgentButtonAdd(props: Props) {
  const { canCreate, isLeafCluster, onClick, agent, beginsWithVowel,isTit=true } = props;
  const disabled = isLeafCluster || !canCreate;
  let title = '';
  if (!canCreate) {
    title = `您没有添加权限 ${
      beginsWithVowel ? 'an' : 'a'
    } ${agent}`;
  }

  if (isLeafCluster) {
    title = `增加 ${
      beginsWithVowel ? 'an' : 'a'
    } ${agent} 不技持集群`;
  }

  return (
    <Link
      to={{
        pathname: isTit?`${cfg.routes.root}/discover`:'/web/LinuxHostsResource',
        state: { entity: agent },
      }}
      style={{ textDecoration: 'none',margin:'0 10px 0 0' }}
    >
      <ButtonPrimary
        title={title}
        disabled={disabled}
        width="240px"
        onClick={onClick}
      >
       {isTit?'添加':''} {agent}
      </ButtonPrimary>
    </Link>
  );
}

export type Props = {
  isLeafCluster: boolean;
  canCreate: boolean;
  onClick?: () => void;
  agent: string;
  beginsWithVowel: boolean;
  isTit?: Boolean;
};
