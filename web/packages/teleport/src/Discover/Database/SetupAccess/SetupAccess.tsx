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

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Box, Text, Flex, Link } from 'design';
import { InfoFilled } from 'design/Icon';

import {
  SelectCreatable,
  Option,
} from 'teleport/Discover/Shared/SelectCreatable';
import {
  useUserTraits,
  SetupAccessWrapper,
} from 'teleport/Discover/Shared/SetupAccess';
import { Mark } from 'teleport/Discover/Shared';
import { TextSelectCopyMulti } from 'teleport/components/TextSelectCopy';

import { DatabaseEngine, DatabaseLocation } from '../resources';

import type { AgentStepProps } from '../../types';
import type { State } from 'teleport/Discover/Shared/SetupAccess';
import type { Database } from '../resources';

export default function Container(props: AgentStepProps) {
  const state = useUserTraits(props);
  return <SetupAccess {...state} />;
}

export function SetupAccess(props: State) {
  const {
    onProceed,
    initSelectedOptions,
    getFixedOptions,
    getSelectableOptions,
    resourceState,
    ...restOfProps
  } = props;
  const [nameInputValue, setNameInputValue] = useState('');
  const [selectedNames, setSelectedNames] = useState<Option[]>([]);

  const [userInputValue, setUserInputValue] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Option[]>([]);

  useEffect(() => {
    if (props.attempt.status === 'success') {
      setSelectedNames(initSelectedOptions('databaseNames'));
      setSelectedUsers(initSelectedOptions('databaseUsers'));
    }
  }, [props.attempt.status, initSelectedOptions]);

  function handleNameKeyDown(event: React.KeyboardEvent) {
    if (!nameInputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setSelectedNames([
          ...selectedNames,
          { value: nameInputValue, label: nameInputValue },
        ]);
        setNameInputValue('');
        event.preventDefault();
    }
  }

  function handleUserKeyDown(event: React.KeyboardEvent) {
    if (!userInputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setSelectedUsers([
          ...selectedUsers,
          { value: userInputValue, label: userInputValue },
        ]);
        setUserInputValue('');
        event.preventDefault();
    }
  }

  function handleOnProceed() {
    onProceed({ databaseNames: selectedNames, databaseUsers: selectedUsers });
  }

  const { engine, location } = resourceState as Database;
  let hasTraits = selectedUsers.length > 0;
  // Postgres connection testing requires both db user and a db name.
  if (engine === DatabaseEngine.PostgreSQL) {
    hasTraits = hasTraits && selectedNames.length > 0;
  }

  const canAddTraits = !props.isSsoUser && props.canEditUser;
  const headerSubtitle =
    '允许您的数据库名称和用户访问，以便与您的数据库进行交互。';

  return (
    <SetupAccessWrapper
      {...restOfProps}
      headerSubtitle={headerSubtitle}
      traitKind="Database"
      traitDescription="名称和用户"
      hasTraits={hasTraits}
      onProceed={handleOnProceed}
      infoContent={<Info dbEngine={engine} dbLocation={location} />}
    >
      <Box mb={4}>
        数据库用户
        <SelectCreatable
          inputValue={userInputValue}
          isClearable={selectedUsers.some(v => !v.isFixed)}
          onInputChange={setUserInputValue}
          onKeyDown={handleUserKeyDown}
          placeholder="开始键入数据库用户并按enter键"
          value={selectedUsers}
          isDisabled={!canAddTraits}
          onChange={(value, action) => {
            if (action.action === 'clear') {
              setSelectedUsers(getFixedOptions('databaseUsers'));
            } else {
              setSelectedUsers(value || []);
            }
          }}
          options={getSelectableOptions('databaseUsers')}
          autoFocus
        />
      </Box>
      <Box mb={2}>
        数据库名称
        <SelectCreatable
          inputValue={nameInputValue}
          isClearable={selectedNames.some(v => !v.isFixed)}
          onInputChange={setNameInputValue}
          onKeyDown={handleNameKeyDown}
          placeholder="开始键入数据库用户并按enter键"
          value={selectedNames}
          isDisabled={!canAddTraits}
          onChange={(value, action) => {
            if (action.action === 'clear') {
              setSelectedNames(getFixedOptions('databaseNames'));
            } else {
              setSelectedNames(value || []);
            }
          }}
          options={getSelectableOptions('databaseNames')}
        />
      </Box>
    </SetupAccessWrapper>
  );
}

const Info = (props: {
  dbEngine: DatabaseEngine;
  dbLocation: DatabaseLocation;
}) => (
  <StyledBox mt={5}>
    <Flex mb={2}>
      <InfoFilled fontSize={18} mr={1} mt="2px" />
      <Text bold>允许使用数据库用户进行访问</Text>
    </Flex>
    <DbEngineInstructions {...props} />
    <Box>
      <Text bold>访问定义</Text>
      <ul
        css={`
          margin-bottom: 0;
        `}
      >
        <li>
          <Mark>数据库用户</Mark> 是允许的用户的名称
          连接到数据库。通配符允许任何用户使用。
        </li>
        <li>
          <Mark>数据库名称</Mark> 是逻辑数据库的名称（又名
          模式） <Mark>数据库用户</Mark> 将被允许连接
          到数据库服务器内。通配符允许使用任何数据库。
        </li>
      </ul>
    </Box>
  </StyledBox>
);

function DbEngineInstructions({
  dbEngine,
  dbLocation,
}: {
  dbEngine: DatabaseEngine;
  dbLocation: DatabaseLocation;
}) {
  switch (dbLocation) {
    case DatabaseLocation.AWS:
      if (dbEngine === DatabaseEngine.PostgreSQL) {
        return (
          <Box mb={3}>
            <Text mb={2}>
              数据库用户必须允许{' '}

                IAM身份验证

              以便与RDS的数据库访问一起使用。要启用，用户
              必须具有<Mark>rds_iam</Mark>角色:
            </Text>
            <TextSelectCopyMulti
              bash={false}
              lines={[
                {
                  text:
                    `CREATE USER YOUR_USERNAME;\n` +
                    `GRANT rds_iam TO YOUR_USERNAME;`,
                },
              ]}
            />
          </Box>
        );
      }
      if (dbEngine === DatabaseEngine.MySQL) {
        return (
          <Box mb={3}>
            <Box mb={2}>
              <Text mb={2}>
                数据库用户必须允许{' '}
                  IAM authentication
                以便与RDS的数据库访问一起使用。用户必须
                启用RDS身份验证插件
              </Text>
              <TextSelectCopyMulti
                bash={false}
                lines={[
                  {
                    text: "CREATE USER alice IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';",
                  },
                ]}
              />
            </Box>
            <Box>
              <Text>
                默认情况下，创建的用户可能无法访问任何内容，因此让我们
                授予它一些权限：
              </Text>
              <TextSelectCopyMulti
                bash={false}
                lines={[
                  {
                    text: "GRANT ALL ON `%`.* TO 'alice'@'%';",
                  },
                ]}
              />
            </Box>
          </Box>
        );
      }
      break;

    // self-hosted databases
    default:
      if (dbEngine === DatabaseEngine.PostgreSQL) {
        return (
          <Box mb={3}>
            <Text mb={2}>
              将以下条目添加到PostgreSQL的

              名为<Mark>pg_hba.conf</Mark>的文件，因此PostgreSQL需要

              通过TLS连接的客户端的客户端CA:
            </Text>
            <TextSelectCopyMulti
              bash={false}
              lines={[
                {
                  text:
                    `hostssl all             all             ::/0                    cert\n` +
                    `hostssl all             all             0.0.0.0/0               cert\n`,
                },
              ]}
            />
            <Text mt={2}>
              注意：请确保您没有更高优先级的md5身份验证
              将匹配的规则，否则PostgreSQL将首先提供它们，
              并且基于证书的Ftsafe登录将失败。
            </Text>
          </Box>
        );
      }

      if (dbEngine === DatabaseEngine.Mongo) {
        return (
          <Box mb={3}>
            <Text mb={2}>
              若要为此数据库创建用户，请使用连接到此数据库
              <Mark>mongosh</Mark>
              或<Mark>mongo</Mark>shell，然后运行以下命令：
            </Text>
            <TextSelectCopyMulti
              bash={false}
              lines={[
                {
                  text:
                    `db.getSiblingDB("$external").runCommand(\n` +
                    `  {\n` +
                    `    createUser: "CN=YOUR_USERNAME",\n` +
                    `    roles: [\n` +
                    `      { role: "readWriteAnyDatabase", db: "admin" }\n` +
                    `    ]\n` +
                    `  }\n` +
                    `)`,
                },
              ]}
            />
          </Box>
        );
      }

      if (dbEngine === DatabaseEngine.MySQL) {
        return (
          <Box mb={3}>
            <Text mb={2}>
              MySQL/MariaDB 数据库用户帐户必须配置为需要
              有效的客户端证书。
            </Text>
            <Box mb={2}>
              <Text bold>创建新用户:</Text>
              <TextSelectCopyMulti
                bash={false}
                lines={[
                  {
                    text: `CREATE USER 'YOUR_USERNAME'@'%' REQUIRE SUBJECT '/CN=YOUR_USERNAME';`,
                  },
                ]}
              />
            </Box>
            <Box mb={3}>
              <Text bold>更新现有用户:</Text>
              <TextSelectCopyMulti
                bash={false}
                lines={[
                  {
                    text: `ALTER USER 'YOUR_USERNAME'@'%' REQUIRE SUBJECT '/CN=YOUR_USERNAME';`,
                  },
                ]}
              />
            </Box>
            <Box>
              <Text>
                默认情况下，创建的用户可能无法访问任何内容，并且
                将无法连接，所以让我们授予它一些权限：
              </Text>
              <TextSelectCopyMulti
                bash={false}
                lines={[
                  {
                    text: "GRANT ALL ON ` % `.* TO 'YOUR_USERNAME'@'%';",
                  },
                ]}
              />
            </Box>
          </Box>
        );
      }
  }

  return null;
}

const StyledBox = styled(Box)`
  max-width: 800px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
`;
