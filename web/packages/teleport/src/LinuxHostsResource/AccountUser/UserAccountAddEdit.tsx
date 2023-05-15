import React, {  useEffect, useImperativeHandle, } from 'react'
import { Button, Form, Input, Select,SelectProps,InputNumber, message } from 'antd';
import {  AccountUserProps, UserAccountDataType,AccountTypeOptions } from 'teleport/services/resourcesHost/type';



export default  function UserAccountAddEdit(props: AccountUserProps ) {

  const {
    onAddAccountUser,
    userAccountDataType,
    onCancel,
  } = props


  const onFinish = (values: any) => {
    console.log('Success:', values);
    onAddAccountUser({...values,resid:userAccountDataType.resid,id:userAccountDataType.id})
  };


  const [form] = Form.useForm();


  useEffect(() => {

        form.setFieldsValue({
          account: userAccountDataType.account,
          pwd: userAccountDataType.pwd,
          acttype: userAccountDataType.acttype,
        })


  })


  return (
    <Form
      form={form}
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 17 }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        rules={[{ required: true, message: '请输入你的账号!' ,whitespace:true},
          { max: 64, message: '账号最大长度64个字符'}]}
        label="账号"
        name="account"
      >
        <Input />
      </Form.Item>
      <Form.Item
        rules={userAccountDataType.id?[]:[{ required: true, message: '请输入你的密码!' ,whitespace:true}, { max: 64, message: '密码最大长度64个字符'}]}
        label="密码"
        name="pwd"
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="账号类型"
        name="acttype"
      >

        <Select options={AccountTypeOptions}   />

      </Form.Item>


      <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
        <Button type="primary" htmlType="submit"  style={{backgroundColor:"#4459BB"}}>
          保存
        </Button>
        <Button   htmlType="button" onClick={()=>onCancel()} style={{ marginLeft: "5px", }}>
          取消
        </Button>
      </Form.Item>
    </Form>
  )
}

