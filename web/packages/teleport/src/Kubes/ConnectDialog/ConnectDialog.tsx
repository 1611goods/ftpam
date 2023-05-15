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
import Dialog, {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from 'design/Dialog';
import { Text, Box, ButtonSecondary } from 'design';

import TextSelectCopy from 'teleport/components/TextSelectCopy';
import { AuthType } from 'teleport/services/user';
import { generateTshLoginCommand } from 'teleport/lib/util';

function ConnectDialog(props: Props) {
  const {
    onClose,
    username,
    authType,
    kubeConnectName,
    clusterId,
    accessRequestId,
  } = props;

  return (
    <Dialog
      dialogCss={dialogCss}
      disableEscapeKeyDown={false}
      onClose={onClose}
      open={true}
    >
      <DialogHeader>
        <DialogTitle>连接 kubernetes 集群</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <Box mb={4}>
          <Text bold as="span">
            步骤 1
          </Text>
          {' - 登录 Ftsafe'}
          <TextSelectCopy
            mt="2"
            text={generateTshLoginCommand({
              authType,
              username,
              clusterId,
              accessRequestId,
            })}
          />
        </Box>
        <Box mb={4}>
          <Text bold as="span">
            任选的
          </Text>{' '}
          - 将kubectl配置写入一个单独的文件，而不是
          您的全局kubectl配置已修改，请运行以下命令：
          <TextSelectCopy
            mt="2"
            text="export KUBECONFIG=${HOME?}/teleport-kubeconfig.yaml"
          />
        </Box>
        <Box mb={4}>
          <Text bold as="span">
            步骤 2
          </Text>
          {' - 选择 Kubernetes 集群'}
          <TextSelectCopy mt="2" text={`tsh kube login ${kubeConnectName}`} />
        </Box>
        <Box mb={1}>
          <Text bold as="span">
            步骤 3
          </Text>
          {' - 连接 Kubernetes 集群'}
          <TextSelectCopy mt="2" text={`kubectl get pods`} />
        </Box>
        {accessRequestId && (
          <Box mb={1} mt={3}>
            <Text bold as="span">
              Step 4 (Optional)
            </Text>
            {' - 完成后，放弃承担的角色'}
            <TextSelectCopy mt="2" text={`tsh request drop`} />
          </Box>
        )}
      </DialogContent>
      <DialogFooter>
        <ButtonSecondary onClick={onClose}>关闭</ButtonSecondary>
      </DialogFooter>
    </Dialog>
  );
}

type Props = {
  onClose: () => void;
  username: string;
  authType: AuthType;
  kubeConnectName: string;
  clusterId: string;
  accessRequestId?: string;
};

const dialogCss = () => `
  min-height: 400px;
  max-width: 600px;
  width: 100%;
`;

export default ConnectDialog;
