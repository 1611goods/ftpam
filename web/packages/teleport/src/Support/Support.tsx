/**
 * Copyright 2020 Gravitational, Inc.
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
import { Card, Box, Text, Flex } from 'design';
import * as Icons from 'design/Icon';

import styled from 'styled-components';

import { FeatureBox } from 'teleport/components/Layout';
import useTeleport from 'teleport/useTeleport';
import cfg from 'teleport/config';

export default function Container({
  children,
}: {
  children?: React.ReactNode;
}) {
  const ctx = useTeleport();
  const cluster = ctx.storeUser.state.cluster;

  return (
    <Support
      {...cluster}
      isEnterprise={cfg.isEnterprise}
      tunnelPublicAddress={cfg.tunnelPublicAddress}
      isCloud={cfg.isCloud}
      children={children}
    />
  );
}

export const Support = ({
  clusterId,
  authVersion,
  publicURL,
  isEnterprise,
  tunnelPublicAddress,
  isCloud,
  children,
}: Props) => {
  const docs = getDocUrls(authVersion, isEnterprise);

  return (
    <FeatureBox pt="4">
      <Card px={5} pt={1} pb={6}>
        <Flex justifyContent="space-between" flexWrap="wrap">
          <Box>
            <Header title="支持" icon={<Icons.LocalPlay />} />
            {isEnterprise && (
              <SupportLink
                title="创建支持票证"
                url="https://support.goteleport.com"
              />
            )}
            <SupportLink
              title="向社区提问"
              url="https://github.com/gravitational/teleport/discussions"
            />
            <SupportLink
              title="请求新功能"
              url="https://github.com/gravitational/teleport/issues/new/choose"
            />
            <SupportLink
              title="发送产品反馈"
              url="mailto:support@goteleport.com"
            />
          </Box>
          <Box>
            <Header title="资源" icon={<Icons.ListCheck />} />
            <SupportLink title="快速入门指南" url={docs.quickstart} />
            <SupportLink title="tsh用户指南" url={docs.userManual} />
            <SupportLink title="管理指南" url={docs.adminGuide} />
            <SupportLink
              title="下载页面"
              url={getDownloadLink(isCloud, isEnterprise)}
            />
            <SupportLink title="常问问题" url={docs.faq} />
          </Box>
          <Box>
            <Header title="故障排除" icon={<Icons.Graph />} />
            <SupportLink
              title="监控与调试"
              url={docs.troubleshooting}
            />
          </Box>
          <Box>
            <Header title="更新" icon={<Icons.NotificationsActive />} />
            <SupportLink
              title="产品变更日志"
              url="https://github.com/gravitational/teleport/blob/master/CHANGELOG.md"
            />
            <SupportLink
              title="Teleport 博客"
              url="https://goteleport.com/blog/"
            />
          </Box>
        </Flex>
      </Card>
      <DataContainer title="集群信息">
        <DataItem title="群集名称" data={clusterId} />
        <DataItem title="Teleport 版本" data={authVersion} />
        <DataItem title="公共地址" data={publicURL} />
        {tunnelPublicAddress && (
          <DataItem title="公共SSH隧道" data={tunnelPublicAddress} />
        )}
      </DataContainer>

      {children}
    </FeatureBox>
  );
};

export const DataContainer: React.FC<{ title: string }> = ({
  title,
  children,
}) => (
  <Box
    border="1px solid"
    borderColor="primary.light"
    mt={4}
    borderRadius={3}
    px={5}
    py={4}
  >
    <Text as="h5" mb={4} fontWeight="bold" caps>
      {title}
    </Text>
    {children}
  </Box>
);
/**
 * getDocUrls returns an object of URL's appended with
 * UTM, version, and type of teleport.
 *
 * @param version teleport version retrieved from cluster info.
 */
const getDocUrls = (version = '', isEnterprise: boolean) => {
  const verPrefix = isEnterprise ? 'e' : 'oss';

  /**
   * withUTM appends URL with UTM parameters.
   * anchor hashes must be appended at end of URL otherwise it is ignored.
   *
   * @param url the full link to the specific documentation.
   * @param anchorHash the hash in URL that predefines scroll location in the page.
   */
  const withUTM = (url = '', anchorHash = '') =>
    `${url}?product=teleport&version=${verPrefix}_${version}${anchorHash}`;

  return {
    quickstart: withUTM('https://goteleport.com/docs/getting-started'),
    userManual: withUTM('https://goteleport.com/docs/server-access/guides/tsh'),
    adminGuide: withUTM('https://goteleport.com/docs/setup/admin'),
    troubleshooting: withUTM(
      'https://goteleport.com/docs/setup/admin/troubleshooting'
    ),
    faq: withUTM('https://goteleport.com/docs/faq'),
  };
};

const getDownloadLink = (isCloud: boolean, isEnterprise: boolean) => {
  if (isCloud) {
    return 'https://goteleport.com/docs/cloud/downloads/';
  }

  if (isEnterprise) {
    return 'https://dashboard.gravitational.com/web/downloads';
  }

  return 'https://goteleport.com/download/';
};

const SupportLink = ({ title = '', url = '' }) => (
  <StyledSupportLink href={url} target="_blank">
    {title}
  </StyledSupportLink>
);

const StyledSupportLink = styled.a.attrs({
  rel: 'noreferrer',
})`
  display: block;
  color: ${props => props.theme.colors.light};
  border-radius: 4px;
  text-decoration: none;
  margin-bottom: 8px;
  padding: 4px 8px;
  transition: all 0.3s;
  ${props => props.theme.typography.body2}
  &:hover, &:focus {
    background: ${props => props.theme.colors.primary.lighter};
  }
`;

export const DataItem = ({ title = '', data = null }) => (
  <Flex mb={3}>
    <Text typography="body2" bold style={{ width: '130px' }}>
      {title}:
    </Text>
    <Text typography="body2">{data}</Text>
  </Flex>
);

const Header = ({ title = '', icon = null }) => (
  <Flex
    alignItems="center"
    borderBottom="1px solid"
    borderColor="primary.dark"
    mb={3}
    width={210}
    mt={4}
    pb={2}
  >
    <Text pr={2} fontSize={18}>
      {icon}
    </Text>
    <Text as="h5" caps>
      {title}
    </Text>
  </Flex>
);

export type Props = {
  clusterId: string;
  authVersion: string;
  publicURL: string;
  isEnterprise: boolean;
  isCloud: boolean;
  tunnelPublicAddress?: string;
  children?: React.ReactNode;
};
