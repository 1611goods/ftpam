import React, { useState, forwardRef, useImperativeHandle } from 'react'
import styled from 'styled-components'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Modal, Button, Checkbox, Radio, Form, Input, Select, Upload, Divider } from 'antd';
const { TextArea } = Input;

export default forwardRef(contentFile)
function contentFile(poops, ref) {
  const [form] = Form.useForm();
  const [list, setList] = useState([
    {
      name: 'config2',
      id: '1',
    },
    {
      name: '内网服务器',
      id: '2',
    }
  ])
  useImperativeHandle(ref, () => ({
    list,
  }))
  // 操作弹窗
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleModel, settitleModel] = useState('');

  // 控制单选按钮切换显示
  const [radio, setRadio] = useState('pass')
  const [radios, setRadios] = useState('handpass')
  const [Privileradios, setPrivileRadios] = useState('sudo')
  const handleRadioChange = (e) => {
    setRadio(e.target.value)
  }
  const changePrivilegeEnhancementMethod = (e) => {
    setPrivileRadios(e.target.value)
  }
  const handleRadioChangeselectBy = (e) => {
    setRadios(e.target.value)
  }
  // 添加
  const AddProfile = () => {
    settitleModel('添加配置文件')
    setIsModalOpen(true);
  }
  const [editid, seteditid] = useState('');
  // 编辑
  interface ItemType {
    name: string;
    id: string
  }
  const editProfile = (item: ItemType) => {
    form.setFieldsValue({ name: item.name });
    settitleModel('编辑配置文件')
    setIsModalOpen(true);
    seteditid(item.id)
  }
  // 删除
  const delProfile = (item: ItemType) => {
    setList([...list.filter(items => items.id !== item.id)])
  }
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  }
  const onFinish = (values: any) => {
    if (titleModel == '添加配置文件') {
      let items = {
        name: values.name,
        id: +new Date() + '',
      }
      setList([...list, items])
      handleCancel()
    } else {
      list.forEach(item => {
        if (item.id == editid) {
          item.name = values.name
        }
      })
      setList([...list])
      handleCancel()
    }

  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };


  return (
    <Box>
      <div className='top'>
        <a  onClick={AddProfile}>添加配置文件</a>
      </div>
      <div className='bottom'>
        {list.map((item, index) => (
          <div key={index} className='configuration'>
            <span>{item.name}</span>
            <span>
              <EditOutlined onClick={() => editProfile(item)} />
              <DeleteOutlined onClick={() => delProfile(item)} />
            </span>
          </div>
        ))}
      </div>
      <Modal title={titleModel} open={isModalOpen} footer={null} width={800} onCancel={handleCancel}>
        <Form
          form={form}
          name="Profile"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{
            remember: true,
            setsRadio: 'pass',
            nameAccount: 'root',
            selectBy: 'handpass',
            PrivilegeEnhancementMethod: 'sudo',
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="描述	"
            name="desc"
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item
            label="SSH端口"
            name="port"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="用户提示符"
            name="setUser"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="选择方式"
            name="setsRadio"
          >
            <Radio.Group onChange={handleRadioChange}>
              <p> <Radio value="pass"> 手动指定密码</Radio></p>
              <p><Radio value="pamuser"> 使用一个存储在PAM360中的用户账户</Radio></p>
              <p> <Radio value="sshKey"> 添加ssh私钥 </Radio></p>
            </Radio.Group>
          </Form.Item>
          {radio === 'pass' && <div>
            <Form.Item
              label="用户名	"
              name="username"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="密码	"
              name="pass"
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
          </div>}
          {radio === 'sshKey' && <div>
            <Form.Item
              label="用户名	"
              name="sshKeyusername"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="SSH密钥		"
              name="SSHkey"
            >
              <Upload action="/upload.do" listType="picture-card">
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
            <Form.Item
              label="私钥名称	"
              name="sshKeyname"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="专用密钥密码	"
              name="sshKeypass"
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
          </div>}
          {radio === 'pamuser' && <div>
            <Form.Item
              label="资源名称"
              name="resourceName"
            >

              <Select
                options={[
                  { value: '192.168.80.4', label: '192.168.80.4' },
                  { value: '192.168.80.5', label: '192.168.80.5' },
                  { value: 'MyLocalDB', label: 'MyLocalDB' },
                  { value: 'Windows测试机', label: 'Windows测试机' },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="账户名称"
              name="nameAccount"
            >
              <Select
                options={[
                  { value: 'root', label: 'root' },

                ]}
              />
            </Form.Item>
          </div>}
          <Form.Item label='发现账号' name="remember" valuePropName="checked" >
            <Checkbox>启用</Checkbox>
          </Form.Item>
          <Divider orientation={'center'} style={{ marginLeft: '66px' }} />
          <Form.Item
            label="特权提升方法"
            name="PrivilegeEnhancementMethod"
          >
            <Radio.Group onChange={changePrivilegeEnhancementMethod}>
              <Radio value="root"> su为root </Radio>
              <Radio value="sudo">sudo</Radio>
            </Radio.Group>
          </Form.Item>
          {Privileradios == 'root' && <div>
            <Form.Item
              label="Root用户提示符	"
              name="RootUserPrompt"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="选择方式"
              name="selectBy"
            >
              <Radio.Group onChange={handleRadioChangeselectBy}>
                <Radio value="handpass">手动指定密码</Radio>
                <Radio value="handuseracc">使用一个存储在PAM360中的用户账户</Radio>
              </Radio.Group>
            </Form.Item>

            {radios == 'handpass' && <div>
              <Form.Item
                label="Root账户	"
                name="username"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="密码	"
                name="Rootpass"
              >
                <Input.Password autoComplete="current-password" />
              </Form.Item>
            </div>
            }
            {radios == 'handuseracc' && <div>
              <Form.Item
                label="资源名称"
                name="rootresourceName"
              >

                <Select
                  options={[
                    { value: '192.168.80.4', label: '192.168.80.4' },
                    { value: '192.168.80.5', label: '192.168.80.5' },
                    { value: 'MyLocalDB', label: 'MyLocalDB' },
                    { value: 'Windows测试机', label: 'Windows测试机' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="账户名称"
                name="rootnameAccount"
              >
                <Select
                  options={[
                    { value: 'root', label: 'root' },

                  ]}
                />
              </Form.Item>
            </div>
            }
          </div>}
          {
            Privileradios == 'sudo' &&
            <div className='sudoClass' style={{ marginBottom: '10px', width: '600px', textAlign: 'center', marginLeft: '66px', background: '#f4f4f4 none repeat scroll 0 0', padding: '8px 18px', }}>
              如果上面配置的凭据属于“sudo”特权用户，那么将发现所有资源和相关帐户。如果上面配置的凭据属于“普通”用户，那么只会发现资源。
            </div>
          }
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit"  style={{backgroundColor:"#4459BB"}}>
              保存
            </Button>
            <Button htmlType="button" style={{ marginLeft: '10px' }} onClick={handleCancel}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Box>
  )
}
const Box = styled.div`
display:flex;
flex-direction:column;
.top{
  height:30px;
  line-height:30px;
  background:#e9e9e9;
  padding-left:10px;
}
.bottom{
  height:140px;
  overflow:auto ;
  border:1px #e9e9e9 solid ;
  .configuration{
    display:flex;
    justify-content:space-between;
    height:40px;
    line-height:40px;
    margin: 0 10px;
    span:last-child{
      cursor: pointer;
      span{
        margin-left:15px;
      }
    }
  }
}
`
