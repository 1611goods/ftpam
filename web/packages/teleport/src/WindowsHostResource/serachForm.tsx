import React, { useEffect, useState } from 'react';
import { Button, Form, Input } from 'antd';


export default function serachForm(poops) {
  const [form] = Form.useForm();
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, []);

  const onFinish = (values: any) => {
    poops.getlist(1,10,values)
    console.log('Finish:', values);
  };
  return (
    <Form form={form} autoComplete='off' layout="inline" onFinish={onFinish}>
      <Form.Item
        name="name"
        label='资源名称'
      >
        <Input  />
      </Form.Item>
      <Form.Item
        name="hostname"
        label='DNS名称/IP地址'
      >
        <Input
        />
      </Form.Item>
      <Form.Item shouldUpdate>
        {() => (
          <Button
            style={{backgroundColor:"#4459BB"}}
            type="primary"
            htmlType="submit"
          >
            查询
          </Button>
        )}
      </Form.Item>
    </Form>
  )
}
