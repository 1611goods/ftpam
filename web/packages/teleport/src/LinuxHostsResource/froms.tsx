import React, { forwardRef, useEffect, useImperativeHandle, } from 'react'
import { Button, Form, Input, InputNumber, message, Radio } from 'antd';
import cfg from 'teleport/config'
import api from 'teleport/services/api';
import styled from 'styled-components'
export default forwardRef(froms)
function froms(props, formRef) {
  const { resources } = cfg.api
  const [form] = Form.useForm();
  const { handleCancel, addListitem, data } = props
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data.name,
        hostname: data.hostname,
        descp: data.descp,
        ssh_port: data.ssh_port,
      });
    }
  }, [data, form]);

  useImperativeHandle(formRef, () => ({
    onFinish,
  }));
  const onFinish = (values: any) => {
    if (!data) {
      api.post(resources, values).then(res => {
        console.log(res);
        if (res.code == 0) {
          message.info('添加成功');
          handleCancel()
          form.resetFields();
          addListitem()
        }

      })
    } else {
      api.put(resources + `/${data.id}`, values).then(res => {
        if (res.code == 0) {
          message.info('编辑成功');
          handleCancel()
          form.resetFields();
          addListitem()
        }
      })
    }
  };
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const oncancel = () => {
    form.resetFields();
    handleCancel()
  }
  return (
    <Form
      form={form}
      name="basic"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 17 }}
      initialValues={{ remember: true, type: 1 }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="资源名称"
        name="name"
        rules={[
          { required: true, message: '请输入资源名称',whitespace:true },
          { max: 64, message: '资源名称最大长度64个字符'},
          ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="DNS名称/IP地址"
        name="hostname"
        rules={[
          { required: true, message: '请输入DNS名称/IP地址' ,whitespace:true}
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="资源类型"
        name="type"
      >
        <Radio.Group >
          <StyledRadio value={1}> Linux  </StyledRadio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="自动登录用的SSH端口"
        name="ssh_port"
        rules={[{ required: true, message: '请输入自动登录用的SSH端口' }]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
        <Button type="primary" htmlType="submit" style={{ backgroundColor: "#4459BB" }}>
          保存
        </Button>
        <Button htmlType="button" onClick={oncancel} style={{ marginLeft: "5px",backgroundColor: "#4459BB",color:'#fff' }}>
          取消
        </Button>
      </Form.Item>
    </Form>
  )
}

const StyledRadio = styled(Radio)`
     .ant-radio{
      .ant-radio-inner{
        background-color:#4459BB;
        border-color:#4459BB;
      }
     }
`;
