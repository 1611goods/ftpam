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

import React, { KeyboardEvent } from 'react';
import {
  Link,
  Text,
  Flex,
  Alert,
  ButtonSecondary,
  ButtonPrimary,
} from 'design';
import { DialogContent, DialogFooter } from 'design/Dialog';
import Validation, { Validator } from 'shared/components/Validation';
import FieldInput from 'shared/components/FieldInput';
import { Attempt } from 'shared/hooks/useAttemptNext';

import cfg from 'teleport/config';
import TextSelectCopy from 'teleport/components/TextSelectCopy';

import { State } from '../useAddApp';

export default function Automatically(props: Props) {
  const { onClose, attempt, token } = props;

  const [name, setName] = React.useState('');
  const [uri, setUri] = React.useState('');
  const [cmd, setCmd] = React.useState('');

  React.useEffect(() => {
    if (name && uri) {
      const cmd = createAppBashCommand(token.id, name, uri);
      setCmd(cmd);
    }
  }, [token]);

  function handleRegenerate(validator: Validator) {
    if (!validator.validate()) {
      return;
    }

    props.onCreate(name, uri);
  }

  function handleGenerate(validator: Validator) {
    if (!validator.validate()) {
      return;
    }

    const cmd = createAppBashCommand(token.id, name, uri);
    setCmd(cmd);
  }

  function handleEnterPress(
    e: KeyboardEvent<HTMLInputElement>,
    validator: Validator
  ) {
    if (e.key === 'Enter') {
      if (cmd) {
        handleRegenerate(validator);
      } else {
        handleGenerate(validator);
      }
    }
  }

  return (
    <Validation>
      {({ validator }) => (
        <>
          <DialogContent minHeight="254px" flex="0 0 auto">
            <Flex alignItems="center" flexDirection="row">
              <FieldInput
                rule={requiredAppName}
                label="应用名称"
                autoFocus
                value={name}
                placeholder="jenkins"
                width="320px"
                mr="3"
                onKeyPress={e => handleEnterPress(e, validator)}
                onChange={e => setName(e.target.value.toLowerCase())}
              />
              <FieldInput
                rule={requiredAppUri}
                label="内部应用程序UR"
                width="100%"
                value={uri}
                placeholder="https://localhost:4000"
                onKeyPress={e => handleEnterPress(e, validator)}
                onChange={e => setUri(e.target.value)}
              />
            </Flex>
            {!cmd && (
              <Text mb="3">
                Ftsafe 可以自动设置应用程序访问。提供
                您的应用程序的名称和URL，以生成我们的
                自动安装程序脚本。
                <Text mt="2">
                  脚本将安装Ftsafe代理以提供安全
                  访问您的应用程序。
                </Text>
              </Text>
            )}
            {attempt.status === 'failed' && (
              <Alert kind="danger" children={attempt.statusText} />
            )}
            {cmd && (
              <>
                <Text mb="3">
                  使用下面的脚本将应用程序添加到集群中。{' '}
                  脚本将有效
                  <Text bold as="span">
                    {` ${token.expiryText}`}.
                  </Text>
                  {renderUrl(name)}
                </Text>
                <TextSelectCopy text={cmd} mb={2} />
              </>
            )}
          </DialogContent>
          <DialogFooter>
            {!cmd && (
              <ButtonPrimary
                mr="3"
                disabled={attempt.status === 'processing'}
                onClick={() => handleGenerate(validator)}
              >
                生成脚本
              </ButtonPrimary>
            )}
            {cmd && (
              <ButtonPrimary
                mr="3"
                disabled={attempt.status === 'processing'}
                onClick={() => handleRegenerate(validator)}
              >
                重新生成
              </ButtonPrimary>
            )}
            <ButtonSecondary
              disabled={attempt.status === 'processing'}
              onClick={onClose}
            >
              关闭
            </ButtonSecondary>
          </DialogFooter>
        </>
      )}
    </Validation>
  );
}

function renderUrl(name = '') {
  const url = `https://${name}.${window.location.host}`;
  return (
    <Text>
      This app will be available on {`  `}
      <Link target="_blank" href={url}>
        {`${url}`}
      </Link>
    </Text>
  );
}

// Validation logic matches backend checks for app URI
const ALLOWED_APPURI_REGEXP = /^[-\w/:. ]+$/;
const requiredAppUri = value => () => {
  if (!value) {
    return {
      valid: false,
      message: '必填',
    };
  }

  try {
    new URL(value);
  } catch {
    return {
      valid: false,
      message: 'URL 错误',
    };
  }

  const appUriMatch = value.match(ALLOWED_APPURI_REGEXP);
  if (!appUriMatch) {
    return {
      valid: false,
      message: '错误的 app URI',
    };
  }

  return {
    valid: true,
  };
};

/**
 * Conforms to rfc 1035 name syntax where:
 * - name should start with alphabets and end with alphanumerics
 * - interior characters are only alphanumerics and hyphens
 * - string must be 63 chars or less
 */
const REGEX_DNS1035LABEL = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
const DNS1035LABEL_MAXLENGTH = 63;
const requiredAppName = value => () => {
  if (!value || value.length === 0) {
    return {
      valid: false,
      message: '必填',
    };
  }

  if (value.length > DNS1035LABEL_MAXLENGTH) {
    return {
      valid: false,
      message: '必须小于等于63个字符',
    };
  }

  const match = value.match(REGEX_DNS1035LABEL);
  if (!match) {
    return {
      valid: false,
      message: '无效的DNS子域名',
    };
  }

  return {
    valid: true,
  };
};

export const createAppBashCommand = (
  tokenId: string,
  appName: string,
  appUri: string
): string => {
  // encode uri so it can be passed around as URL query parameter
  const encoded = encodeURIComponent(appUri)
    // encode single quotes so they do not break the curl parameters
    .replace(/'/g, '%27');
  const bashUrl =
    cfg.baseUrl +
    cfg.api.appNodeScriptPath
      .replace(':token', tokenId)
      .replace(':name', appName)
      .replace(':uri', encoded);

  return `sudo bash -c "$(curl -fsSL '${bashUrl}')"`;
};

type Props = {
  onClose(): void;
  onCreate(name: string, uri: string): Promise<any>;
  token: State['token'];
  attempt: Attempt;
};
