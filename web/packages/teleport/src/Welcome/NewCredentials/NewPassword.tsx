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
import { Box, ButtonPrimary, ButtonText, Text } from 'design';
import { Danger } from 'design/Alert';
import FieldInput from 'shared/components/FieldInput';
import Validation, { Validator } from 'shared/components/Validation';
import {
  requiredConfirmedPassword,
  requiredPassword,
} from 'shared/components/Validation/rules';
import { useRefAutoFocus } from 'shared/hooks';

import { Props as CredentialsProps, SliderProps } from './NewCredentials';

export function NewPassword(props: Props) {
  const {
    submitAttempt,
    resetToken,
    isPasswordlessEnabled,
    onSubmit,
    auth2faType,
    primaryAuthType,
    password,
    updatePassword,
    changeFlow,
    next,
    refCallback,
    hasTransitionEnded,
  } = props;
  const [passwordConfirmed, setPasswordConfirmed] = useState('');
  const mfaEnabled = auth2faType !== 'off';

  function handleOnSubmit(
    e: React.MouseEvent<HTMLButtonElement>,
    validator: Validator
  ) {
    e.preventDefault(); // prevent form submit default

    if (!validator.validate()) {
      return;
    }

    if (mfaEnabled) {
      next();
      return;
    }

    onSubmit(password);
  }

  const passwordInputRef = useRefAutoFocus<HTMLInputElement>({
    shouldFocus: hasTransitionEnded,
  });

  function switchToPasswordlessFlow(e, applyNextAnimation = false) {
    e.preventDefault();
    changeFlow({ flow: 'passwordless', applyNextAnimation });
  }

  return (
    <Validation>
      {({ validator }) => (
        <Box p={5} ref={refCallback} data-testid="password" style={{background:"#fff"}}>
          {mfaEnabled && <Text color="text.secondary">步骤 1 of 2</Text>}
          <Text typography="h4" bold mb={3} color="light">
            设置密码
          </Text>
          {submitAttempt.status === 'failed' && (
            <Danger children={submitAttempt.statusText} />
          )}
          <FieldInput
          
            label="用户名"
            value={resetToken.user}
            onChange={() => null}
            readonly
            background-color
          />
          <FieldInput
            rule={requiredPassword}
            ref={passwordInputRef}
            autoComplete="off"
            label="密码"
            value={password}
            onChange={e => updatePassword(e.target.value)}
            type="password"
            placeholder="密码"
          />
          <FieldInput
            rule={requiredConfirmedPassword(password)}
            autoComplete="off"
            label="确认密码"
            value={passwordConfirmed}
            onChange={e => setPasswordConfirmed(e.target.value)}
            type="password"
            placeholder="确认密码"
          />
          <ButtonPrimary
            width="100%"
            mt={3}
            size="large"
            style={{background:'#4459BB'}}
            onClick={e => handleOnSubmit(e, validator)}
            disabled={submitAttempt.status === 'processing'}
          >
            {mfaEnabled ? '下一步' : '提交'}
          </ButtonPrimary>
          {primaryAuthType !== 'passwordless' && isPasswordlessEnabled && (
            <Box mt={3} textAlign="center">
              <ButtonText
                onClick={e => switchToPasswordlessFlow(e)}
                disabled={submitAttempt.status === 'processing'}
              >
                进入无密码状态
              </ButtonText>
            </Box>
          )}
          {primaryAuthType === 'passwordless' && (
            <Box mt={3} textAlign="center">
              <ButtonText
                onClick={e => switchToPasswordlessFlow(e, true)}
                disabled={submitAttempt.status === 'processing'}
              >
                返回
              </ButtonText>
            </Box>
          )}
        </Box>
      )}
    </Validation>
  );
}

type Props = CredentialsProps &
  SliderProps & {
    password: string;
    updatePassword(pwd: string): void;
  };
