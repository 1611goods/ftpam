
import React from 'react';
import { Card, ButtonPrimary, Flex, Box } from 'design';
import * as Alerts from 'design/Alert';
import useAttempt from 'shared/hooks/useAttempt';
import createMfaOptions, { MfaOption } from 'shared/utils/createMfaOptions';
import { Auth2faType, PreferredMfaType } from 'shared/services';
import FieldInput from '../FieldInput';
import FieldSelect from '../FieldSelect';
import Validation, { Validator } from '../Validation';
import {
  requiredToken,
  requiredPassword,
  requiredField,
  requiredConfirmedPassword,
} from '../Validation/rules';

import { Button, Form, Input, } from 'antd';

function FormPassword(props: Props) {
  const {
    onChangePassWithWebauthn,
    onChangePass,
    auth2faType = 'off',
    preferredMfaType,
  } = props;
  const mfaEnabled = auth2faType !== 'off';
  const [form] = Form.useForm();
  const [attempt, attemptActions] = useAttempt({});
  const [token, setToken] = React.useState('');
  const [oldPass, setOldPass] = React.useState('');
  const [newPass, setNewPass] = React.useState('');
  const [newPassConfirmed, setNewPassConfirmed] = React.useState('');
  const mfaOptions = React.useMemo<MfaOption[]>(
    () =>
      createMfaOptions({
        auth2faType: auth2faType,
        preferredType: preferredMfaType,
      }),
    []
  );
  const [mfaType, setMfaType] = React.useState(mfaOptions[0]);

  const { isProcessing } = attempt;

  function submit(oldPass, newPass) {
    switch (mfaType?.value) {
      case 'webauthn':
        return onChangePassWithWebauthn(oldPass, newPass);
      default:
        return onChangePass(oldPass, newPass, token);
    }
  }

  function resetForm() {
    setOldPass('');
    setNewPass('');
    setNewPassConfirmed('');
    setToken('');
  }

  // function onSubmit(
  //   e: React.MouseEvent<HTMLButtonElement>,
  //   validator: Validator
  // ) {
  //   e.preventDefault();
  //   if (!validator.validate()) {
  //     return;
  //   }

  //   validator.reset();

  //   attemptActions.start();
  //   submit()
  //     .then(() => {
  //       attemptActions.stop();
  //       resetForm();
  //     })
  //     .catch(err => {
  //       attemptActions.error(err);
  //     });
  // }

  function onSetMfaOption(option: MfaOption, validator: Validator) {
    setToken('');
    attemptActions.clear();
    validator.reset();
    setMfaType(option);
  }

  const onFinish = (values: any) => {
    attemptActions.start();
    submit(values.oldPass, values.newPass)
      .then(() => {
        attemptActions.stop();
      })
      .catch(err => {
        attemptActions.error(err);
      });
    form.resetFields()
  };
  let reg = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]/
  return (
    <Form
      name="basic"
      layout='vertical'
      form={form}
      style={{ maxWidth: 600 }}
      onFinish={onFinish}
    >
      <Status attempt={attempt} />
      <Form.Item label="当前密码" name='oldPass' rules={[
        { required: true, message: '请输入当前密码' },
        {
          pattern: reg,
          message: '请输入大写字母+小写字母+数字格式字符',
        }
      ]}>
        <Input.Password />
      </Form.Item>
      <Form.Item label="新密码" name='newPass' dependencies={['oldPass']} rules={[
        { required: true, message: '请输入新密码' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('oldPass') !== value) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error('新密码不能和当前密码一致'),
            );
          },
        }),
        {
          pattern: reg,
          message: '请输入大写字母+小写字母+数字格式字符',
        },

      ]}>
        <Input.Password />
      </Form.Item>
      <Form.Item label="确认密码" name='newPassConfirmed' dependencies={['newPass']} rules={[
        { required: true, message: '请输入确认密码' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('newPass') === value) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error('2次密码输入不一致'),
            );
          },
        }),
      ]}>
        <Input.Password />
      </Form.Item>
      <Form.Item >
        <Button type="primary" htmlType="submit"> 更新密码</Button>
      </Form.Item>
    </Form>
    // <Validation>
    //   {({ validator }) => (
    //     <Card as="form" bg="primary.contrastText" width="456px" p="6">
    //       <Status attempt={attempt} />

    //       <FieldInput
    //         rule={requiredField('当前密码为必填项')}
    //         label="当前密码"
    //         value={oldPass}
    //         onChange={e => setOldPass(e.target.value)}
    //         type="password"
    //         placeholder="密码"
    //       />
    //       {mfaEnabled && (
    //         <Flex alignItems="flex-end" mb={4}>
    //           <Box width="50%" data-testid="mfa-select">
    //             <FieldSelect
    //               label="双因素设备"
    //               value={mfaType}
    //               options={mfaOptions}
    //               onChange={opt => onSetMfaOption(opt as MfaOption, validator)}
    //               mr={3}
    //               mb={0}
    //               isDisabled={isProcessing}
    //             />
    //           </Box>
    //           <Box width="50%">
    //             {mfaType.value === 'otp' && (
    //               <FieldInput
    //                 label="身份验证码"
    //                 inputMode="numeric"
    //                 autoComplete="one-time-code"
    //                 rule={requiredToken}
    //                 value={token}
    //                 onChange={e => setToken(e.target.value)}
    //                 placeholder="123 456"
    //                 mb={0}
    //               />
    //             )}
    //           </Box>
    //         </Flex>
    //       )}
    //       <FieldInput
    //         rule={requiredPassword}
    //         label="新密码"
    //         value={newPass}
    //         onChange={e => setNewPass(e.target.value)}
    //         type="password"
    //         placeholder="新密码"
    //       />
    //       <FieldInput
    //         rule={requiredConfirmedPassword(newPass)}
    //         label="确认密码"
    //         value={newPassConfirmed}
    //         onChange={e => setNewPassConfirmed(e.target.value)}
    //         type="password"
    //         placeholder="确认密码"
    //       />
    //       <ButtonPrimary
    //         block
    //         disabled={isProcessing}
    //         size="large"
    //         onClick={e => onSubmit(e, validator)}
    //         mt={5}
    //       >
    //         更新密码
    //       </ButtonPrimary>
    //     </Card>
    //   )}
    // </Validation>
  );
}

function Status({ attempt }: StatusProps) {
  if (attempt.isFailed) {
    return <Alerts.Danger>{attempt.message}</Alerts.Danger>;
  }

  if (attempt.isSuccess) {
    return <Alerts.Success>您的密码已更改!</Alerts.Success>;
  }

  return null;
}

type StatusProps = {
  attempt: ReturnType<typeof useAttempt>[0];
};

type Props = {
  auth2faType?: Auth2faType;
  preferredMfaType?: PreferredMfaType;
  onChangePass(oldPass: string, newPass: string, token: string): Promise<any>;
  onChangePassWithWebauthn(oldPass: string, newPass: string): Promise<any>;
};

export default FormPassword;
