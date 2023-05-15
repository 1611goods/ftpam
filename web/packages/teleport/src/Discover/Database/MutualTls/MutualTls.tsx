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
import styled from 'styled-components';
import { Text, Box, Flex, Link } from 'design';
import { Danger } from 'design/Alert';
import { InfoFilled } from 'design/Icon';
import TextEditor from 'shared/components/TextEditor';

import useTeleport from 'teleport/useTeleport';
import { TextSelectCopyMulti } from 'teleport/components/TextSelectCopy';
import { Tabs } from 'teleport/components/Tabs';

import { HeaderSubtitle, ActionButtons, Mark, Header } from '../../Shared';
import { dbCU } from '../../yamlTemplates';
import { DatabaseEngine } from '../resources';

import { useMutualTls, State } from './useMutualTls';

import type { AgentStepProps } from '../../types';

export function MutualTls(props: AgentStepProps) {
  const ctx = useTeleport();
  const state = useMutualTls({ ctx, props });

  return <MutualTlsView {...state} />;
}

export function MutualTlsView({
  attempt,
  onNextStep,
  curlCmd,
  canUpdateDatabase,
  dbEngine,
}: State) {
  const [caCert, setCaCert] = useState('');

  return (
    <Box maxWidth="800px">
      <Header>配置双向TLS</Header>
      <HeaderSubtitle>
        Self-hosted管数据库必须使用Teleport的证书进行配置
        授权能够验证客户端证书。他们还需要
        Teleport可以验证的证书/密钥对。
      </HeaderSubtitle>
      {attempt.status === 'failed' && <Danger children={attempt.statusText} />}
      {!canUpdateDatabase && (
        <Box>
          <Text>
            您没有更新数据库的权限。
            <br />
            请要求您的Teleport管理员更新您的角色并添加
              <Mark>db</Mark> 角色:
          </Text>
          <Flex minHeight="195px" mt={3}>
            <TextEditor
              readOnly={true}
              data={[{ content: dbCU, type: 'yaml' }]}
            />
          </Flex>
        </Box>
      )}
      {canUpdateDatabase && (
        <>
          <Box mb={3}>
            <Text bold>
              运行以下命令下载Teleport的CA并生成
              证书/密钥对。
            </Text>
            <Box mt={2} mb={1}>
              <TextSelectCopyMulti lines={[{ text: curlCmd }]} />
            </Box>
          </Box>
          <StyledBox mb={6}>
            <Flex mb={2}>
              <InfoFilled fontSize={18} mr={1} mt="2px" />
              <Text bold>运行命令后</Text>
            </Flex>
            <DbEngineInstructions dbEngine={dbEngine} />
          </StyledBox>
          <Box mb={5}>
            <Text bold>添加CA证书的副本*</Text>
            <Text mb={2}>
              *仅当您的数据库配置有证书时才需要
              由第三方CA签名。添加副本允许Teleport信任
              它
            </Text>
            <Box
              mt={2}
              height="100px"
              width="800px"
              as="textarea"
              p={2}
              borderRadius={2}
              placeholder="复制并粘贴您的CA证书"
              value={caCert}
              onChange={e => setCaCert(e.target.value)}
              autoFocus
              style={{ outline: 'none' }}
            />
          </Box>
        </>
      )}
      <ActionButtons
        onProceed={() => onNextStep(caCert)}
        disableProceed={attempt.status === 'processing'}
      />
    </Box>
  );
}

function DbEngineInstructions({ dbEngine }: { dbEngine: DatabaseEngine }) {
  if (dbEngine === DatabaseEngine.PostgreSQL) {
    return (
      <Box>
        <Text mb={1}>
          将以下内容添加到PostgreSQL配置文件中{' '}
          <Mark>postgresql.conf</Mark>, 让您的服务器接受{' '}

            TLS 连接

          :
        </Text>
        <TextSelectCopyMulti
          bash={false}
          lines={[
            {
              text:
                `ssl = on\n` +
                `ssl_cert_file = '$PGDATA/server.crt'\n` +
                `ssl_key_file = '$PGDATA/server.key'\n` +
                `ssl_ca_file = '$PGDATA/server.cas'`,
            },
          ]}
        />
      </Box>
    );
  }

  if (dbEngine === DatabaseEngine.Mongo) {
    return (
      <Box>
        <Text mb={3}>
          使用生成的机密{' '}
          启用双向TLS
          在您的
          <Mark>mongod.conf</Mark>配置文件并重新启动数据库：
        </Text>
        <Tabs
          tabs={[
            {
              title: 'MongoDB 3.6 - 4.2',
              content: (
                <TextSelectCopyMulti
                  bash={false}
                  lines={[
                    {
                      text:
                        `net:\n` +
                        `  ssl:\n` +
                        `    mode: requireSSL\n` +
                        `    PEMKeyFile: /etc/certs/mongo.crt\n` +
                        `    CAFile: /etc/certs/mongo.cas`,
                    },
                  ]}
                />
              ),
            },
            {
              title: 'MongoDB 4.2+',
              content: (
                <TextSelectCopyMulti
                  bash={false}
                  lines={[
                    {
                      text:
                        `net:\n` +
                        `  tls:\n` +
                        `    mode: requireTLS\n` +
                        `    certificateKeyFile: /etc/certs/mongo.crt\n` +
                        `    CAFile: /etc/certs/mongo.cas`,
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Box>
    );
  }

  if (dbEngine === DatabaseEngine.MySQL) {
    return (
      <Box>
        <Text mb={3}>
          若要将此数据库配置为接受TLS连接，请添加
          根据您的配置文件，<Mark>mysql.cnf</Mark>:
        </Text>
        <Tabs
          tabs={[
            {
              title: 'MySQL',
              content: (
                <>
                  <TextSelectCopyMulti
                    bash={false}
                    lines={[
                      {
                        text:
                          `[mysqld]\n` +
                          `require_secure_transport=ON\n` +
                          `ssl-ca=/path/to/server.cas\n` +
                          `ssl-cert=/path/to/server.crt\n` +
                          `ssl-key=/path/to/server.key`,
                      },
                    ]}
                  />
                  <Text mt={2}>
                    看{' '}
                      配置MySQL以使用加密连接
                    了解更多详细信息。
                  </Text>
                </>
              ),
            },
            {
              title: 'MariaDB',
              content: (
                <>
                  <TextSelectCopyMulti
                    bash={false}
                    lines={[
                      {
                        text:
                          `[mariadb]\n` +
                          `require_secure_transport=ON\n` +
                          `ssl-ca=/path/to/server.cas\n` +
                          `ssl-cert=/path/to/server.crt\n` +
                          `ssl-key=/path/to/server.key`,
                      },
                    ]}
                  />
                  <Text mt={2}>
                    看{' '}
                      在MariaDB服务器上启用TLS
                    了解更多详细信息。
                  </Text>
                </>
              ),
            },
          ]}
        />
      </Box>
    );
  }
}

const StyledBox = styled(Box)`
  max-width: 800px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
`;
