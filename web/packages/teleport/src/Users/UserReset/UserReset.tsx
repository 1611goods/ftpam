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

import React from 'react';
import { ButtonPrimary, ButtonSecondary, Text, Alert } from 'design';
import Dialog, {
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from 'design/Dialog';
import { useAttemptNext } from 'shared/hooks';

import { ResetToken } from 'teleport/services/user';

import UserTokenLink from './../UserTokenLink';

export default function Container(props: Props) {
  const dialog = useDialog(props);
  return <UserReset {...dialog} />;
}

export function UserReset({
  username,
  onReset,
  onClose,
  attempt,
  token,
}: ReturnType<typeof useDialog>) {
  if (attempt.status === 'success') {
    return <UserTokenLink onClose={onClose} token={token} asInvite={false} />;
  }

  return (
    <Dialog
      dialogCss={() => ({ maxWidth: '500px', width: '100%' })}
      disableEscapeKeyDown={false}
      onClose={close}
      open={true}
    >
      <DialogHeader>
        <DialogTitle>重置用户身份验证？</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {attempt.status === 'failed' && (
          <Alert kind="danger" children={attempt.statusText} />
        )}
        <Text mb={4} mt={1}>
          您将要重置用户
          <Text bold as="span">
            {` ${username} `}
          </Text>
          的身份验证。这将生成一个可用于设置新身份验证的临时 URL。
        </Text>
      </DialogContent>
      <DialogFooter>
        <ButtonPrimary
          mr="3"
          disabled={attempt.status === 'processing'}
          onClick={onReset}
        >
          生成重置网址
        </ButtonPrimary>
        <ButtonSecondary onClick={onClose}>取消</ButtonSecondary>
      </DialogFooter>
    </Dialog>
  );
}

function useDialog(props: Props) {
  const { attempt, run } = useAttemptNext();
  const [token, setToken] = React.useState<ResetToken>(null);

  function onReset() {
    run(() => props.onReset(props.username).then(setToken));
  }

  return {
    username: props.username,
    onClose: props.onClose,
    token,
    onReset,
    attempt,
  };
}

type Props = {
  username: string;
  onClose(): void;
  onReset(username: string): Promise<any>;
};
