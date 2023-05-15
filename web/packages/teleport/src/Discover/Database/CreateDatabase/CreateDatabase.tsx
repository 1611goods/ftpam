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
import {
  Text,
  Box,
  Flex,
  AnimatedProgressBar,
  ButtonPrimary,
  ButtonSecondary,
} from 'design';

import Dialog, { DialogContent } from 'design/DialogConfirmation';
import * as Icons from 'design/Icon';
import Validation, { Validator } from 'shared/components/Validation';
import FieldInput from 'shared/components/FieldInput';
import { requiredField } from 'shared/components/Validation/rules';
import TextEditor from 'shared/components/TextEditor';

import { Timeout } from 'teleport/Discover/Shared/Timeout';

import {
  ActionButtons,
  HeaderSubtitle,
  Header,
  LabelsCreater,
  Mark,
  TextIcon,
} from '../../Shared';
import { dbCU } from '../../yamlTemplates';
import {
  DatabaseLocation,
  getDatabaseProtocol,
  getDefaultDatabasePort,
} from '../resources';

import { useCreateDatabase, State } from './useCreateDatabase';

import type { AgentStepProps } from '../../types';
import type { AgentLabel } from 'teleport/services/agents';
import type { Attempt } from 'shared/hooks/useAttemptNext';
import type { AwsRds } from 'teleport/services/databases';

export function CreateDatabase(props: AgentStepProps) {
  const state = useCreateDatabase(props);
  return <CreateDatabaseView {...state} />;
}

export function CreateDatabaseView({
  attempt,
  clearAttempt,
  registerDatabase,
  canCreateDatabase,
  pollTimeout,
  dbEngine,
  dbLocation,
  isDbCreateErr,
}: State) {
  const [dbName, setDbName] = useState('');
  const [dbUri, setDbUri] = useState('');
  const [labels, setLabels] = useState<AgentLabel[]>([]);
  const [dbPort, setDbPort] = useState(getDefaultDatabasePort(dbEngine));

  // TODO(lisa): refactor using ryan's example (reusable).
  const [awsAccountId, setAwsAccountId] = useState('');
  const [awsResourceId, setAwsResourceId] = useState('');

  const [finishedFirstStep, setFinishedFirstStep] = useState(false);

  useEffect(() => {
    // If error resulted from creating a db, reset the view
    // to the beginning as the error could be from duplicate
    // db name.
    if (isDbCreateErr) {
      setFinishedFirstStep(false);
    }
  }, [isDbCreateErr]);

  function handleOnProceed(validator: Validator, retry = false) {
    if (!validator.validate()) {
      return;
    }

    if (!retry && !finishedFirstStep) {
      setFinishedFirstStep(true);
      validator.reset();
      return;
    }

    let awsRds: AwsRds;
    if (dbLocation === DatabaseLocation.AWS) {
      awsRds = {
        accountId: awsAccountId,
        resourceId: awsResourceId,
      };
    }

    registerDatabase({
      labels,
      name: dbName,
      uri: `${dbUri}:${dbPort}`,
      protocol: getDatabaseProtocol(dbEngine),
      awsRds,
    });
  }

  const isAws = dbLocation === DatabaseLocation.AWS;
  return (
    <Validation>
      {({ validator }) => (
        <Box maxWidth="800px">
          <Header>注册数据库</Header>
          <HeaderSubtitle>
            为数据库服务器创建新的数据库资源。
          </HeaderSubtitle>
          {!canCreateDatabase && (
            <Box>
              <Text>
                您没有注册数据库的权限。
                <br />
                请要求您的Teleport管理员更新您的角色并
                添加 <Mark>db</Mark> 角色:
              </Text>
              <Flex minHeight="195px" mt={3}>
                <TextEditor
                  readOnly={true}
                  data={[{ content: dbCU, type: 'yaml' }]}
                />
              </Flex>
            </Box>
          )}
          {canCreateDatabase && (
            <>
              {!finishedFirstStep && (
                <Box width="500px">
                  <FieldInput
                    label="数据库名称"
                    rule={requiredField('数据库名称为必填项')}
                    autoFocus
                    value={dbName}
                    placeholder="输入数据库名称"
                    onChange={e => setDbName(e.target.value)}
                    toolTipContent="An identifier name for this new database for Teleport."
                  />
                </Box>
              )}
              {finishedFirstStep && (
                <>
                  <Flex width="500px">
                    <FieldInput
                      autoFocus
                      label="数据库连接终结点"
                      rule={
                        isAws
                          ? requireAwsEndpoint
                          : requiredField('连接终结点是必填项')
                      }
                      value={dbUri}
                      placeholder={
                        isAws
                          ? 'db.example.us-west-1.rds.amazonaws.com'
                          : 'db.example.com'
                      }
                      onChange={e => setDbUri(e.target.value)}
                      width="70%"
                      mr={2}
                      toolTipContent={
                        isAws ? (
                          <Text>
                            数据库位置和连接信息。通常采用以下格式:{' '}
                            <Mark
                              light
                            >{`<your-db-identifier>.<random-id>.<your-region>.rds.amazonaws.com`}</Mark>
                          </Text>
                        ) : (
                          '数据库位置和连接信息'
                        )
                      }
                    />
                    <FieldInput
                      label="端点端口"
                      rule={requirePort}
                      value={dbPort}
                      placeholder="5432"
                      onChange={e => setDbPort(e.target.value)}
                      width="30%"
                    />
                  </Flex>
                  {dbLocation === DatabaseLocation.AWS && (
                    <>
                      <Box width="500px">
                        <FieldInput
                          label="AWS 账户 ID"
                          rule={requiredAwsAccountId}
                          value={awsAccountId}
                          placeholder="123456789012"
                          onChange={e => setAwsAccountId(e.target.value)}
                          toolTipContent="AWS 账户 ID 必须为 12 位数字"
                        />
                      </Box>
                      <Box width="500px" mb={6}>
                        <FieldInput
                          label="数据库资源 ID "
                          value={awsResourceId}
                          rule={requiredField(
                            '数据库资源 ID 是必需的'
                          )}
                          placeholder="db-ABCDE1234567..."
                          onChange={e => setAwsResourceId(e.target.value)}
                          toolTipContent={
                            <Text>
                              资源的唯一标识符。可能有前缀<Mark light>db-</Mark>然后跟字母数字
                            </Text>
                          }
                        />
                      </Box>
                    </>
                  )}
                  <Box mt={3}>
                    <Text bold>标签（可选）</Text>
                    <Text mb={2}>
                      标签使数据库服务可以发现此新数据库。 <br />
                      不定义标签等效于 asteriks（任何数据库服务都可以发现此数据库）。
                    </Text>
                    <LabelsCreater
                      labels={labels}
                      setLabels={setLabels}
                      isLabelOptional={true}
                      disableBtns={attempt.status === 'processing'}
                      noDuplicateKey={true}
                    />
                  </Box>
                </>
              )}
            </>
          )}
          <ActionButtons
            onProceed={() => handleOnProceed(validator)}
            // On failure, allow user to attempt again.
            disableProceed={
              attempt.status === 'processing' || !canCreateDatabase
            }
          />
          {(attempt.status === 'processing' || attempt.status === 'failed') && (
            <CreateDatabaseDialog
              pollTimeout={pollTimeout}
              attempt={attempt}
              retry={() => handleOnProceed(validator, true /* retry */)}
              close={clearAttempt}
            />
          )}
        </Box>
      )}
    </Validation>
  );
}

const CreateDatabaseDialog = ({
  pollTimeout,
  attempt,
  retry,
  close,
}: {
  pollTimeout: number;
  attempt: Attempt;
  retry(): void;
  close(): void;
}) => {
  return (
    <Dialog disableEscapeKeyDown={false} open={true}>
      <DialogContent
        width="400px"
        alignItems="center"
        mb={0}
        textAlign="center"
      >
        {attempt.status !== 'failed' ? (
          <>
            {' '}
            <Text bold caps mb={4}>
              正在注册数据库
            </Text>
            <AnimatedProgressBar />
            <TextIcon
              css={`
                white-space: pre;
              `}
            >
              <Icons.Restore fontSize={4} />
              <Timeout
                timeout={pollTimeout}
                message=""
                tailMessage={' seconds left'}
              />
            </TextIcon>
          </>
        ) : (
          <Box width="100%">
            <Text bold caps mb={3}>
              数据库注册失败
            </Text>
            <Text mb={5}>
              <Icons.Warning ml={1} mr={2} color="danger" />
              错误: {attempt.statusText}
            </Text>
            <Flex>
              <ButtonPrimary mr={2} width="50%" onClick={retry}>
                复审
              </ButtonPrimary>
              <ButtonSecondary width="50%" onClick={close}>
                关闭
              </ButtonSecondary>
            </Flex>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Only allows digits with valid port range 1-65535.
const requirePort = (value: string) => () => {
  const numberValue = parseInt(value);
  const isValidPort =
    Number.isInteger(numberValue) && numberValue >= 1 && numberValue <= 65535;
  if (!isValidPort) {
    return {
      valid: false,
      message: '无效端口 (1-65535)',
    };
  }
  return {
    valid: true,
  };
};

// AWS_ACC_ID_REGEX only allows digits with length 12.
export const AWS_ACC_ID_REGEX = /^\d{12}$/;
const requiredAwsAccountId = value => () => {
  const isValidId = value.match(AWS_ACC_ID_REGEX);
  if (!isValidId) {
    return {
      valid: false,
      message: 'AWS 账户 ID 必须为 12 位数字',
    };
  }
  return {
    valid: true,
  };
};

const requireAwsEndpoint = value => () => {
  const parts = value.split('.');
  // Following possible format (bare mininum len has to be 6):
  // (len 6) test.abcd.us-west-2.rds.amazonaws.com
  // (len 7) test.abcd.suffix.us-west-2.rds.amazonaws.com
  // (len 8) test.abcd.suffix.us-west-2.rds.amazonaws.com.cn
  const hasCorrectLen = parts.length >= 6; // loosely match
  if (!hasCorrectLen || !value.includes('.rds.amazonaws.com')) {
    return {
      valid: false,
      message: '无效的连接端点格式',
    };
  }

  return {
    valid: true,
  };
};

// TODO(lisa): this check and the backend check does not match
// re-visit and let backend do the checking for now.
//
// // AWS_POLICY_NAME_REGEX only allows alphanumeric including the
// // following common characters: plus (+), equal (=), comma (,),
// // period (.), at (@), underscore (_), and hyphen (-).
// // As defined in: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html
// export const AWS_POLICY_NAME_REGEX = /^[\w@+=,.:/-]+$/;
// const conformNameWithAWSPolicyNameReq = value => () => {
//   const isValid = value.match(AWS_POLICY_NAME_REGEX);
//   if (!isValid) {
//     return {
//       valid: false,
//       message:
//         'name must be alphanumerics, including characters such as _ @ = , . + -',
//     };
//   }
//   return {
//     valid: true,
//   };
// };
