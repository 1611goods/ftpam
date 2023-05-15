import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Radio, message, Checkbox, Space } from 'antd';
import { useHistory } from 'react-router';
import styled from 'styled-components'
import ContentFile from './contentFile';
import { MinusCircleOutlined, PlusOutlined, } from '@ant-design/icons';
import api from 'teleport/services/api';
import cfg from 'teleport/config'
import useStickyClusterId from 'teleport/useStickyClusterId';

export default function Discovery(props) {
  const { data } = props
  const [loadings, setLoadings] = useState<boolean>(false);
  const [form] = Form.useForm();
  const history = useHistory()
  const { findresources } = cfg.api
  const onFinish = (values: any) => {
    setLoadings(true)
    if(values.hosts[0] == "" && values.ipranges[0].startip==''){

      setLoadings(false)
      message.warning("主机IP 和 IP地址范围至少输入一项")
      return
    }


    if (data) {
      api.put(findresources + `/${data.id}`, values).then(res => {
        if (res.code == 0) {
          message.info('编辑成功')
          props.handleTabClick('2')
          setLoadings(false)
          form.resetFields();
        } else {
          message.error(res.message)
          setLoadings(false)
        }

      })
    } else {
      api.post(findresources, {
        "noticeuser": [],
        "noticeqywxbot": [],
        "noticeemail": [],
        ...values,
        ipranges:values.ipranges[0].startip==''?null:values.ipranges,
        timeout: Number(values.timeout),
        port: Number(values.port),
      }).then(res => {
        if (res.code == 0) {
          message.info('添加成功')
          setLoadings(false)
          props.handleTabClick('2')
          form.resetFields();
        } else {
          message.error(res.message)
          setLoadings(false)
        }
      })
    }

  };
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data
      });
    }
  }, [props.data, form]);

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const { clusterId } = useStickyClusterId();
  const handlCancel = () => {
    history.push({pathname:`/web/cluster/${clusterId}/nodes`,state:{index:1}})
  }
  return (
    <Form
      form={form}
      name="basicname"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 15 }}
      style={{ maxWidth: 600 }}
      initialValues={{ resourcetype: 1, isdiscacc: true, conntype: 0, hosts: [''], ipranges: [{ startip: "", endip: "" }], }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="资源任务名称"
        name="taskname"
        rules={[{ required: true, message: '请输入资源任务名称' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="资源类型"
        name="resourcetype"
      >
        <Radio.Group >
          <StyledRadio value={1}> Linux  </StyledRadio>
        </Radio.Group>
      </Form.Item>
      <Form.List name="hosts">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item key={index} label="主机IP" style={{ marginBottom: 0 }} >
                <Form.Item
                  style={{ display: 'inline-block', width: 'calc(97% - 8px)' }}
                  name={index}
                  rules={[
                    {
                      pattern: /^((1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])(\.(?!$)|$)){4}$/,
                      message: '请输入正确的主机 IP 地址',
                    },
                  ]}
                >
                  <Input style={{ marginRight: '3px' }} placeholder="192.168.1.1" />
                </Form.Item>
                {(index != 0) && <Form.Item style={{ display: 'inline-block', width: '3%', marginLeft: '3px' }}>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Form.Item>}
                {(index == 0 && fields.length < 5) && <Form.Item style={{ display: 'inline-block', width: '3%', marginLeft: '3px' }}>
                  <PlusOutlined onClick={() => add()} />
                </Form.Item>}
              </Form.Item>
            ))}
          </>
        )}
      </Form.List>
      <Form.List name="ipranges"   >
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item key={index} label="IP地址范围" style={{ marginBottom: 0 }} >
                <div>
                  <Form.Item
                    name={[field.name, 'startip']}
                    style={{ display: 'inline-block', width: 'calc(48% - 8px)' }}
                    rules={[
                      // {
                      //   required: true,
                      //   message: '请输入IP地址范围',
                      // },
                      {
                        pattern: /^((1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])(\.(?!$)|$)){4}$/,
                        message: '请输入正确IP地址',
                      },
                    ]}
                  >
                    <Input placeholder="E.g. 192.168.11.1" />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'endip']}
                    style={{ display: 'inline-block', width: 'calc(48% - 8px)', margin: '0 8px' }}
                    rules={[
                      // {
                      //   required: true,
                      //   message: '请输入IP地址范围',
                      // },
                      {
                        pattern: /^((1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])(\.(?!$)|$)){4}$/,
                        message: '请输入正确IP地址',
                      },
                    ]}
                  >
                    <Input placeholder="192.168.11.5" />
                  </Form.Item>
                  <Form.Item style={{ display: 'inline-block', width: '2%', }}>
                    {(index != 0) && <MinusCircleOutlined onClick={() => remove(field.name)} />}
                    {(index == 0 && fields.length < 5) && <PlusOutlined onClick={() => add()} />}
                  </Form.Item>
                </div>
              </Form.Item>
            ))}
          </>
        )}

      </Form.List>
      <Form.Item
        label="类型"
        name="conntype"
      >
        <Radio.Group >
          <StyledRadio value={0}> 手动指定密码  </StyledRadio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label="SSH端口"
        name="port"
        rules={[{ required: true, message: '请输入SSH端口' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="用户名"
        name="account"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="密码"
        name="pwd"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="超时"
        name="timeout"
        rules={[{ required: true, message: '请输入超时多少秒' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label='发现账号' name="isdiscacc" valuePropName="checked" >
        <StyledCheckbox>启用</StyledCheckbox>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <But>
          <Button type="primary" htmlType="submit"  style={{backgroundColor:"#4459BB"}} loading={loadings}>
            {data ? '编辑' : '添加'}
          </Button>
          {/* <Button htmlType="button">
            Add Schedule
          </Button> */}
          <Button htmlType="button" onClick={handlCancel} style={{ marginLeft: "5px",backgroundColor: "#4459BB",color:'#fff' }}>
            取消
          </Button>
        </But>
      </Form.Item>
    </Form>
  )
}

const But = styled.div`
 button{
  margin-left:8px
 }
`
const StartEnd = styled.div`
display:flex
`
const StyledRadio = styled(Radio)`
     .ant-radio{
      .ant-radio-inner{
        background-color:#4459BB;
        border-color:#4459BB;
      }
     }
`;
const StyledCheckbox= styled(Checkbox)`
    .ant-checkbox-inner{
      background-color:#4459BB;
        border-color:#4459BB;
    }
`;