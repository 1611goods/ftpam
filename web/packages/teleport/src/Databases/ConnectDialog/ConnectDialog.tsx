/*
Copyright 2021 Gravitational, Inc.

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
import { Text, Box, ButtonSecondary, Link } from 'design';
import Dialog, {
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from 'design/Dialog';
import { DbProtocol } from 'shared/services/databases';

import { AuthType } from 'teleport/services/user';
import TextSelectCopy from 'teleport/components/TextSelectCopy';
import { generateTshLoginCommand } from 'teleport/lib/util';

export default function ConnectDialog({
  username,
  clusterId,
  dbName,
  onClose,
  authType,
  accessRequestId,
}: Props) {
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
        <DialogTitle>连接到数据库</DialogTitle>
      </DialogHeader>
      <DialogContent minHeight="240px" flex="0 0 auto">
        <Box mb={4}>
          <Text bold as="span">
            步骤 1
          </Text>
          {' - 登录 Ftsafe'}
          <TextSelectCopy
            mt="2"
            text={generateTshLoginCommand({
              authType,
              clusterId,
              username,
              accessRequestId,
            })}
          />
        </Box>
        <Box mb={4}>
          <Text bold as="span">
            步骤 2
          </Text>
          {' - 检索数据库的凭据'}
          <TextSelectCopy
            mt="2"
            text={`tsh db login [--db-user=<user>] [--db-name=<name>] ${dbName}`}
          />
        </Box>
        <Box mb={4}>
          <Text bold as="span">
            步骤 3
          </Text>
          {' - 连接到数据库'}
          <TextSelectCopy
            mt="2"
            text={`tsh db connect [--db-user=<user>] [--db-name=<name>] ${dbName}`}
          />
        </Box>
        {accessRequestId && (
          <Box mb={4}>
            <Text bold as="span">
              步骤 4 (任选)
            </Text>
            {' - 完成后，放弃承担的角色'}
            <TextSelectCopy mt="2" text={`移除请求`} />
          </Box>
        )}

      </DialogContent>
      <DialogFooter>
        <ButtonSecondary onClick={onClose}>关闭</ButtonSecondary>
      </DialogFooter>
    </Dialog>
  );
}

export type Props = {
  dbName: string;
  dbProtocol: DbProtocol;
  onClose: () => void;
  username: string;
  clusterId: string;
  authType: AuthType;
  accessRequestId?: string;
};
