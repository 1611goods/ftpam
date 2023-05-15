import React, { useEffect, useState } from 'react';
import { Button, Form, Input } from 'antd';


export default function serachForm(poops) {
  const [form] = Form.useForm();
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, []);

  const onFinish = (values: any) => {
    poops.getlist(1, 10, values)
  };
  return (
    <Form form={form} autoComplete='off' layout="inline" onFinish={onFinish}>
      <Form.Item
        name="taskname"
        label='任务名称'
      >
        <Input />
      </Form.Item>
      <Form.Item shouldUpdate>
        {() => (
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginLeft: "5px",backgroundColor: "#4459BB",color:'#fff' }}
          >
            查询
          </Button>
        )}
      </Form.Item>
    </Form>
  )
}
