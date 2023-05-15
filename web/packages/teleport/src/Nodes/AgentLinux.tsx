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

import React, { useEffect, useState } from 'react';
import { Indicator, Box, Flex } from 'design';

import {
  FeatureBox,
  FeatureHeader,

} from 'teleport/components/Layout';
import QuickLaunch from 'teleport/components/QuickLaunch';
import Empty, { EmptyStateInfo } from 'teleport/components/Empty';
import NodeList from 'teleport/components/NodeList';
import ErrorMessage from 'teleport/components/AgentErrorMessage';
import useTeleport from 'teleport/useTeleport';
import AgentButtonAdd from 'teleport/components/AgentButtonAdd';
import { useNodes, State } from './useNodes';
import cfg from 'teleport/config'
import api from 'teleport/services/api';
import type { ColumnsType } from 'antd/es/table'
import { Table, Tag } from 'antd'
import { renderLoginCell } from 'teleport/components/NodeList/NodeList'
import SerachForm from './searchfrom';
export default function Container() {
  const teleCtx = useTeleport();
  const state = useNodes(teleCtx);
  return <Agent {...state} />;
}


export function Agent(props: State) {
  const {
    fetchedData,
    getNodeLoginOptions,
    startSshSession,
    attempt,
    canCreate,
    isLeafCluster,
    clusterId,
    fetchNext,
    fetchPrev,
    params,
    pageSize,
    setParams,
    setSort,
    pathname,
    replaceHistory,
    fetchStatus,
    isSearchEmpty,
    pageIndicators,
    onLabelClick,
  } = props;

  function onLoginSelect(e: React.MouseEvent, login: string, serverId: string) {
    e.preventDefault();
    startSshSession(login, serverId);
  }
  const [obj, setobj] = useState({
    limit: 15,
    ...params,
  })
  const [datas, setdatas] = useState([])
  function getList(val?) {
    setobj({limit: 15, ...params, search: val?.search})
  }
  const { getClusterNodesUrl } = cfg
  useEffect(() => {
    api.get(getClusterNodesUrl(clusterId, obj)).then(res => {
      setdatas(res.items)
    })
  }, [obj])
  // function onSshEnter(login: string, serverId: string) {
  //   startSshSession(login, serverId);
  // }
  // const hasNoNodes =
  //   attempt.status === 'success' &&
  //   [fetchedData.agents].length === 0 &&
  //   isSearchEmpty;
  return (
    <FeatureBox>
      <FeatureHeader alignItems="center" justifyContent="end">
        {/* {attempt.status === 'success' && !hasNoNodes && (
          <Flex alignItems="center" justifyContent="end"> */
          // <QuickLaunch width="280px" onPress={onSshEnter} mr={3} />}
          // <QuickLaunch width="280px" mr={3} />
        }
        <AgentButtonAdd
          agent="Linux主机"
          beginsWithVowel={false}
          isLeafCluster={isLeafCluster}
          canCreate={canCreate}
        />
        {/* </Flex>
        )} */}
      </FeatureHeader>
      {/* {attempt.status === 'failed' && (
        <ErrorMessage message={attempt.statusText} />
      )} */}
      {/* {attempt.status === 'processing' && (
        <Box textAlign="center" m={10}>
          <Indicator />
        </Box>
      )} */}
      <Tbstable nodes={datas} getList={getList} onLoginSelect={onLoginSelect} onLoginMenuOpen={getNodeLoginOptions} />
      {/* {attempt.status !== 'processing' && !hasNoNodes && (

        <NodeList
          nodes={fetchedData.agents}
          onLoginMenuOpen={getNodeLoginOptions}
          onLoginSelect={onLoginSelect}
          fetchNext={fetchNext}
          fetchPrev={fetchPrev}
          fetchStatus={fetchStatus}
          pageSize={pageSize}
          pageIndicators={pageIndicators}
          params={params}
          setParams={setParams}
          setSort={setSort}
          pathname={pathname}
          replaceHistory={replaceHistory}
          onLabelClick={onLabelClick}
        />
      )} */}
      {/* {attempt.status === 'success' && hasNoNodes && (
        <Empty
          clusterId={clusterId}
          canCreate={canCreate && !isLeafCluster}
          emptyStateInfo={emptyStateInfo}
        />
      )} */}
    </FeatureBox>
  );
}



interface DataTypes {
  key: string;
  tags: { name: string, value: string }[];
  hostname: string;
  addr: string;
  id: string
}

function Tbstable(props) {
  const { nodes, onLoginSelect, onLoginMenuOpen, getList } = props

  const columns: ColumnsType<DataTypes> = [
    {
      title: '主机名',
      dataIndex: 'hostname',
      key: 'hostname',
    },
    {
      title: '地址',
      dataIndex: 'addr',
      key: 'addr',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (_, { tags }) => (
        <>
          {tags.map((item, index) => (
            <Tag key={index} style={{ cursor: 'pointer' }} color="#f50">{item.name}:{item.value} &nbsp;</Tag>
          ))}
        </>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, { id }) => renderLoginCell(id, onLoginSelect, onLoginMenuOpen)
    },
  ]
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <SerachForm getList={getList} />
      </div>
      <Table size="small" columns={columns} dataSource={nodes} rowKey='id' />
    </div>
  )
}






const emptyStateInfo: EmptyStateInfo = {
  title: '将您的第一台Linux主机添加到 Ftsafe',
  byline:
    'Ftsafe服务器访问整合了所有环境中的SSH访问。',
  docsURL: ' ',
  resourceType: 'server',
  readOnly: {
    title: '没有发现Linux主机',
    resource: 'servers',
  },
};
