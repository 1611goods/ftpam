import React, { useEffect, useState } from 'react';
import { Button, Form, Input } from 'antd';


export default function serachForm(props) {
  const [form] = Form.useForm();
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, []);

  const onFinish = (values: any) => {
    props.getList(values)
  };
  return (
    <Form form={form} autoComplete='off' layout="inline" onFinish={onFinish}>
      <Form.Item
        name="search"
        label='主机名'
      >
        <Input  />
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
