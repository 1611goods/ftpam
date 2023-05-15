
import React from 'react';
import { Text, Box } from 'design';
import PasswordForm from 'shared/components/FormPassword';

import useChangePassword, { State } from './useChangePassword';

export default function Container() {
  const state = useChangePassword();
  return <ChangePassword {...state} />;
}

export function ChangePassword({
  changePassword,
  changePasswordWithWebauthn,
  preferredMfaType,
  auth2faType,
}: State) {
  return (
    <Box mt={3}>
      <Text typography="h3" mb={3}>
        更改密码
      </Text>
      <PasswordForm
        auth2faType={auth2faType}
        preferredMfaType={preferredMfaType}
        onChangePass={changePassword}
        onChangePassWithWebauthn={changePasswordWithWebauthn}
      />
    </Box>
  );
}
