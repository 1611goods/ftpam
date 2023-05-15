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

import AppList from './AppList';
import { useApps, State } from './useApps';

export default function Container() {
  const ctx = useTeleport();
  const state = useApps(ctx);
  return <Apps {...state} />;
}

export function Apps(props: State) {
  const {
    clusterId,
    isLeafCluster,
    canCreate,
    attempt,
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
    pageIndicators,
    onLabelClick,
  } = props;

  const hasNoApps =
    attempt.status === 'success' &&
    fetchedData.agents.length === 0 &&
    isSearchEmpty;

  return (
    <FeatureBox>
      <FeatureHeader alignItems="center" justifyContent="space-between">
        <FeatureHeaderTitle>应用</FeatureHeaderTitle>
        {attempt.status === 'success' && !hasNoApps && (
          <AgentButtonAdd
            agent="应用"
            beginsWithVowel={true}
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
      {attempt.status !== 'processing' && !hasNoApps && (
        <AppList
          apps={fetchedData.agents}
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
        />
      )}
      {attempt.status === 'success' && hasNoApps && (
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
  title: '将您的第一个应用程序添加到Ftsafe',
  byline:
    'Ftsafe应用程序访问提供对内部应用程序的安全访问',
  docsURL: '',
  resourceType: 'application',
  readOnly: {
    title: '没有发现应用',
    resource: 'applications',
  },
};
