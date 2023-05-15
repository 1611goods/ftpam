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
import { Indicator, Box, Card } from 'design';

import useTeleport from 'teleport/useTeleport';
import {
  FeatureBox,
  FeatureHeader,
  FeatureHeaderTitle,
} from 'teleport/components/Layout';
import Empty, { EmptyStateInfo } from 'teleport/components/Empty';
import ErrorMessage from 'teleport/components/AgentErrorMessage';

import AgentButtonAdd from 'teleport/components/AgentButtonAdd';

import DatabaseList from './DatabaseList';
import { useDatabases, State } from './useDatabases';

export default function Container() {
  const ctx = useTeleport();
  const state = useDatabases(ctx);
  return <Databases {...state} />;
}

export function Databases(props: State) {
  const {
    attempt,
    isLeafCluster,
    canCreate,
    username,
    clusterId,
    authType,
    fetchedData,
    fetchNext,
    fetchPrev,
    pageSize,
    params,
    setParams,
    setSort,
    pathname,
    replaceHistory,
    fetchStatus,
    isSearchEmpty,
    onLabelClick,
    accessRequestId,
    pageIndicators,
  } = props;

  const hasNoDatabases =
    attempt.status === 'success' &&
    fetchedData.agents.length === 0 &&
    isSearchEmpty;

  return (
    <FeatureBox>
      <FeatureHeader alignItems="center" justifyContent="space-between">
        <FeatureHeaderTitle>数据库</FeatureHeaderTitle>
        {attempt.status === 'success' && !hasNoDatabases && (
          <AgentButtonAdd
            agent="数据库"
            beginsWithVowel={false}
            isLeafCluster={isLeafCluster}
            canCreate={canCreate}
          />
        )}
      </FeatureHeader>
      <Card bg="#ffffff" pl="4" pr="4">
      {attempt.status === 'processing' && (
        <Box textAlign="center" m={10}>
          <Indicator />
        </Box>
      )}
      {attempt.status === 'failed' && (
        <ErrorMessage message={attempt.statusText} />
      )}
      {attempt.status !== 'processing' && !hasNoDatabases && (
        <DatabaseList
          databases={fetchedData.agents}
          username={username}
          clusterId={clusterId}
          authType={authType}
          fetchNext={fetchNext}
          fetchPrev={fetchPrev}
          fetchStatus={fetchStatus}
          pageIndicators={pageIndicators}
          pageSize={pageSize}
          params={params}
          setParams={setParams}
          setSort={setSort}
          pathname={pathname}
          replaceHistory={replaceHistory}
          onLabelClick={onLabelClick}
          accessRequestId={accessRequestId}
        />
      )}
      {attempt.status === 'success' && hasNoDatabases && (
        <Empty
          clusterId={clusterId}
          canCreate={canCreate && !isLeafCluster}
          emptyStateInfo={emptyStateInfo}
        />
      )}
      </Card>
    </FeatureBox>
  );
}

const emptyStateInfo: EmptyStateInfo = {
  title: '将您的第一个数据库添加到Ftsafe',
  byline:
    'Ftsafe数据库访问提供对PostgreSQL、MySQL、MariaDB、MongoDB、Redis和Microsoft SQL Server的安全访问.',
  docsURL: '',
  resourceType: 'database',
  readOnly: {
    title: '没有发现数据库',
    resource: 'databases',
  },
};
