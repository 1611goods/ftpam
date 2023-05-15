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

import React from 'react';
import styled from 'styled-components';
import { Card, Text } from 'design';

export function Expired({ resetMode = false }) {
  const titleCodeTxt = resetMode ? '重置' : '邀请';
  const paraCodeTxt = resetMode ? '重置' : '邀请';

  return (
    <Card width="540px" color="text.onLight" p={6} bg="light" mt={6} mx="auto">
      <Text typography="h1" textAlign="center" fontSize={8} color="text" mb={3}>
        {titleCodeTxt} 代码已过期
      </Text>
      <Text typography="paragraph" mb="2">
        看来你的 {paraCodeTxt} 代码不再有效。请
        请与您的帐户管理员联系并请求另一个 {paraCodeTxt}{' '}
        链接.
      </Text>

    </Card>
  );
}


