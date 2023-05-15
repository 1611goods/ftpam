import React from 'react';
import styled from 'styled-components';
import {Space,Modal,Popconfirm, Button, Table,Row,Col,Select, message, Form, Input } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

import { DesktopsIcon } from 'design/SVGIcon';

import api from 'teleport/services/api';
import cfg from 'teleport/config'



import { DataType, TableParams, UserAccountDataType ,AccountTypeOptions,ACCOUNT_TYPE} from 'teleport/services/resourcesHost/type';

import useAccountUser , { State } from './useAccountUser';


import UserAccountAddEdit from './UserAccountAddEdit';

import { useEffect } from 'shared/hooks';

export default function Container(props: DataType) {
  return <AccountUser  {...props} />;
}



export function AccountUser(props: DataType) {
  const { Remoteconnection } = cfg.api
  const state = useAccountUser();
  const {
    accountOperation,
    pagination,
    setAccountOperation,
    onAccountUserCreate,
    onAccountOptionsClose,
    onAddAccountUser,
    selectUserAccountList,
    usersAccount,
    delUserAccount,
    tableParams,
    setTableParams,
    onAccountOptionsUpdate,
  } = state



  const {
    id,
    type
  } = props

  const [form] = Form.useForm();


  useEffect(() => {
    console.log(props)
    let param: TableParams = {
      ...tableParams,
      resId: id,
    }
    selectUserAccountList(param)
  }, [tableParams,id]); //这里传递了空数组



    const onFinish = (values: any) => {
      console.log('Finish:', values);

      let param:TableParams = {}
      if(values.account != undefined) {
        param.account = values.account
      }
      if(values.acttype != undefined) {
        param.acttype = values.acttype
      }

      setTableParams({
        resId: id,
        ...param,
        pagesize: 10,
        pagenum: 1
      })
    };

    const onReset =()=>{
      setTableParams({
        // ...tableParams,
        resId: id,
        pagesize: 10,
        pagenum: 1
      })
    };

    const delAccount = (userAccountDataType: UserAccountDataType) => {

      let params: UserAccountDataType = {
        ...userAccountDataType,
        resid: id
      }
      delUserAccount(params)
    }
    const handleTableChange = (
      pagination: TablePaginationConfig,
    ) => {
      console.log(pagination)
      setTableParams({
        ...tableParams,
        pagesize: pagination.pageSize,
        pagenum: pagination.current
      })

    };

    const JumpURL=(accountId:number) => {

      api.get(Remoteconnection + `/${accountId}`).then(res => {
        if (res.code == 0) {
           // window.open(`http://192.168.36.25:64080/#/connect?token=${res.data}`)
            window.open(`http://192.168.25.101:3000/#/connect?token=${res.data}`)
        } else {
          message.error(res.message)
        }
      })
    }

    const columns: ColumnsType<UserAccountDataType> = [
      {
        title: '资源账号',
        dataIndex: 'account',
        key: 'account',

      },
      {
        title: '密码',
        dataIndex: 'pwd',
        key: 'pwd',
        render: (_, record) => (
          <>******</>
        )
      },
      {
        title: '账号类型',
        dataIndex: 'acttype',
        key: 'acttype',
        render: (_, record) => (
          <>{ACCOUNT_TYPE[record.acttype]}</>
        )
      },
      {
        title: '远程连接',
        dataIndex: 'connect',
        key: 'connect',
        render: (_, record) => <a  onClick={() => JumpURL(record.id)}><DesktopsIcon   fill="black"/></a>
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            <a

              style={{color:"#4459BB"}}
              onClick={(e) => {
              e.preventDefault();
              onAccountOptionsUpdate(record)
            }}>编辑</a>
            <Popconfirm title="确定要删除?" onConfirm={() => delAccount(record)}>
              <a style={{color:"#4459BB"}} >删除</a>
            </Popconfirm>
          </Space>
        ),
      },
    ]

    const getFields = () => {

      const children = [];

      children.push(
        <Col span={8} key="account">

          <Form.Item
            name="account"
            label="账号"
          >
            <Input placeholder="请输入账号"/>
          </Form.Item>

        </Col>,
      );
      children.push(
        <Col span={8}  key="acttype">
          <Form.Item
            label="账号类型"
            name="acttype"
          >
            <Select options={AccountTypeOptions}/>
          </Form.Item>
        </Col>,
      );
      children.push(
        <Col span={6} key="submit">
          <Form.Item>
            <Space size="small">
              <Button type="primary" style={{backgroundColor:"#4459BB"}}  htmlType="submit">
                搜索
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  onReset()
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Col>,
      );
      return children;
    };


    return (
      <Wrapper>
        <div className='header'>
          <Space size="middle">
            <Button type="primary" style={{backgroundColor:"#4459BB",marginBottom:'10px'}}  onClick={() => {
              onAccountUserCreate(id)
            }}>添加</Button>


          </Space>
        </div>

        <Form form={form} onFinish={onFinish}>
          <Row gutter={24}>{getFields()}</Row>
        </Form>

        <div className='contentBox'>
          <Table
            size="small"
            style={{fontSize:"12px"}}
            rowKey={record => record.id}
            columns={columns}
            onChange={handleTableChange}
            dataSource={usersAccount}
            pagination={pagination}
          />
        </div>

        <Modal width={accountOperation.width} title={accountOperation.title}
               open={accountOperation.visible} onCancel={onAccountOptionsClose} footer={null}>
          {(accountOperation.type == 'create' || accountOperation.type == 'edit') && <UserAccountAddEdit
            userAccountDataType={accountOperation.userAccountDataType}
            onAddAccountUser={onAddAccountUser}
            onCancel={onAccountOptionsClose}
          />}
        </Modal>

      </Wrapper>

    )
  }
const Wrapper = styled.div`
  min-width: 600px;
  th{font-size:12px}
  td{font-size:12px}
`;
