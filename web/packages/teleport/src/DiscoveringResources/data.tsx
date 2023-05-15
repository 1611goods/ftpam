import type { ColumnsType } from 'antd/es/table';
import React from 'react'
export interface DataType {
  taskname: string;
  InvokedFrom: string;
  InvokedBy: string;
  call: string;
  completeTime: string;
  status: string;
  descp: string;
  id:number
}



export interface detailType {
  key: string;
  dnsname: string;
  hostname: string;
  rtype: string;
  status: string;
  detailed: string;
  filename: string;
  
}
export const detailcolumns: ColumnsType<detailType> = [
  {
    title: 'DNS名称',
    dataIndex: 'dnsname',
    key: 'dnsname',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'IP地址/主机名',
    dataIndex: 'hostname',
    key: 'hostname',
  },
  {
    title: '资源类型',
    dataIndex: 'rtype',
    key: 'rtype',
    render: (text) => <>{text==1?'Linux':'Windows' }</>
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (text) => <>{text==0?'失败':'成功'}</>,
  },
]
