/**
 * Copyright 2021 Gravitational, Inc.
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
import Dialog, {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'design/Dialog';
import {
  Box,
  ButtonLink,
  ButtonSecondary,
  Indicator,
  Link,
  Text,
} from 'design';

import { AuthType } from 'teleport/services/user';
import TextSelectCopy from 'teleport/components/TextSelectCopy';
import DownloadLinks from 'teleport/components/DownloadLinks';
import useTeleport from 'teleport/useTeleport';
import {
  Database,
  DatabaseEngine,
  DatabaseLocation,
  getDatabaseProtocol,
} from 'teleport/Discover/Database/resources';

import { generateTshLoginCommand } from 'teleport/lib/util';

import useAddDatabase, { State } from './useAddDatabase';

export default function Container(props: Props) {
  const ctx = useTeleport();
  const state = useAddDatabase(ctx);
  return <AddDatabase {...state} {...props} />;
}

export function AddDatabase({
  createJoinToken,
  attempt,
  token,
  authType,
  username,
  onClose,
  isEnterprise,
  version,
  selectedDb,
}: Props & State) {
  const { hostname, port } = window.document.location;
  const host = `${hostname}:${port || '443'}`;

  return (
    <Dialog
      dialogCss={() => ({
        maxWidth: '600px',
        width: '100%',
      })}
      disableEscapeKeyDown={false}
      onClose={onClose}
      open={true}
    >
      <DialogHeader mb={4}>
        <DialogTitle>添加 {selectedDb.name}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {attempt.status === 'processing' && (
          <Box textAlign="center">
            <Indicator />
          </Box>
        )}
        {attempt.status === 'failed' && (
          <StepsWithoutToken
            loginCommand={generateTshLoginCommand({
              authType,
              username,
            })}
            addCommand={generateDbStartCmd(selectedDb, host, '')}
            isEnterprise={isEnterprise}
            version={version}
          />
        )}
        {attempt.status === 'success' && (
          <StepsWithToken
            command={generateDbStartCmd(selectedDb, host, token.id)}
            expiry={token.expiryText}
            onRegenerateToken={createJoinToken}
            isEnterprise={isEnterprise}
            version={version}
          />
        )}
      </DialogContent>
      {attempt.status !== 'processing' && (
        <DialogFooter>
          <ButtonSecondary onClick={onClose}>关闭</ButtonSecondary>
        </DialogFooter>
      )}
    </Dialog>
  );
}

type StepsWithTokenProps = {
  command: string;
  expiry: string;
  onRegenerateToken: () => Promise<boolean>;
  isEnterprise: boolean;
  version: string;
};

const StepsWithToken = ({
  expiry,
  command,
  onRegenerateToken,
  isEnterprise,
  version,
}: StepsWithTokenProps) => (
  <>
    <Box mb={4}  color="#333">
      <Text bold as="span" color="#333">
        步骤 1
      </Text>
      {' - 将传送包下载到您的计算机 '}
      <DownloadLinks isEnterprise={isEnterprise} version={version} />
    </Box>
    <Box mb={2}  color="#333">
      <Text bold as="span">
        步骤 2
      </Text>
      {' - 生成Teleport配置文件'}
      <Text mt="1">
        令牌有效期为{' '}
        <Text bold as={'span'}>
          {expiry}.
        </Text>
      </Text>
      <TextSelectCopy mt="2" text={command} color="#fff" />
      <ButtonLink onClick={onRegenerateToken}>重新生成令牌</ButtonLink>
    </Box>
    <Box mb={4}  color="#333">
      <Text bold as="span">
        步骤 3
      </Text>
      {' - 使用以下参数启动Ftsafe代理'}
      <TextSelectCopy mt="2" text="Ftsafe 开始" color="#fff" />
    </Box>

  </>
);

type StepsWithoutTokenProps = {
  isEnterprise: boolean;
  version: string;
  loginCommand: string;
  addCommand: string;
};

const StepsWithoutToken = ({
  loginCommand,
  addCommand,
  isEnterprise,
  version,
}: StepsWithoutTokenProps) => (
  <>
    <Box mb={4} color="#333">
      <Text bold as="span">
        步骤 1
      </Text>
      {' - 将传送包下载到您的计算机 '}
      <DownloadLinks isEnterprise={isEnterprise} version={version} />
    </Box>
    <Box mb={4} color="#333">
      <Text bold as="span">
        步骤 2
      </Text>
      {' - 登录Ftsafe '}
      <TextSelectCopy mt="2" color="#fff" text={loginCommand} />
    </Box>
    <Box mb={4} color="#333">
      <Text bold as="span">
        步骤 3
      </Text>
      {' - 生成加入令牌'}
      <TextSelectCopy mt="2" text="tctl tokens add --type=db" color="#fff" />
    </Box>
    <Box mb={4} color="#333">
      <Text bold as="span">
        步骤4
      </Text>
      {' - 生成Ftsafe配置文件'}
      <TextSelectCopy mt="2" text={addCommand}  color="#fff"/>
    </Box>
    <Box mb={4} color="#333">
      <Text bold as="span">
        步骤 5
      </Text>
      {' - 使用以下参数启动Ftsafe代理'}
      <TextSelectCopy mt="2" text="Ftsafe 开始"  color="#fff" />
    </Box>

  </>
);

const generateDbStartCmd = (db: Database, host: string, token: string) => {
  const protocol = getDatabaseProtocol(db.engine);
  let baseCommand = `teleport db configure create --token=${
    token || '[generated-join-token]'
  } --proxy=${host} --name=[db-name] --protocol=${protocol} --uri=[uri] -o file`;

  if (protocol === 'sqlserver') {
    baseCommand =
      `${baseCommand} --ad-keytab-file=/path/to/teleport.keytab ` +
      `--ad-domain=EXAMPLE.COM ` +
      `--ad-spn=MSSQLSvc/sqlserver.example.com:1433`;
  }

  switch (db.location) {
    case DatabaseLocation.SelfHosted:
      return baseCommand;
    case DatabaseLocation.AWS:
      if (db.engine === DatabaseEngine.RedShift) {
        return `${baseCommand} --aws-region=[region] --aws-redshift-cluster-id=[cluster-id]`;
      }
      return `${baseCommand} --aws-region=[region]`;
    case DatabaseLocation.GCP:
      return `${baseCommand} --ca-cert-file=[instance-ca-filepath] --gcp-project-id=[project-id] --gcp-instance-id=[instance-id]`;
    default:
      return 'unknown type and protocol';
  }
};

export type Props = {
  isEnterprise: boolean;
  onClose(): void;
  username: string;
  version: string;
  authType: AuthType;
  selectedDb: Database;
};
