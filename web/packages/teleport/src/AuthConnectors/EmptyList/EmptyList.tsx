/*
Copyright 2020-2021 Gravitational, Inc.

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
import { Text, Box, Flex, ButtonPrimary, Card } from 'design';
import * as Icons from 'design/Icon';

import { State as ResourceState } from 'teleport/components/useResources';

export default function EmptyList({ onCreate }: Props) {
  return (
    <Card maxWidth="700px" p={6} as={Flex} alignItems="center" bg="#ffffff">
      <Icons.Github
        style={{ textAlign: 'center' }}
        fontSize="150px"
        color="primary.lighter"
        mr={5}
      />
      <Box>
        <Text typography="h6" mb={3} caps>
          创建您的第一个 GITHUB 连接器
        </Text>
        <Text typography="subtitle1" mb={3}>
          身份验证连接器允许Ftsafe通过外部身份源（如Okta，Active Directory，GitHub等）对用户进行身份验证。此身份验证方法通常称为单一登录 （SSO）。
        </Text>
        <Text typography="subtitle1">
          开源传送仅支持 GitHub 连接器。请{' '}

          如何配置GitHub 连接器的文档.
        </Text>
        <ButtonPrimary onClick={onCreate} mt={4} width="240px">
          新的 GITHUB 连接器
        </ButtonPrimary>
      </Box>
    </Card>
  );
}

type Props = {
  onCreate: ResourceState['create'];
};
