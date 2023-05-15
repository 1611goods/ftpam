import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button, Modal, Table, message,Popconfirm } from 'antd';
import styled from 'styled-components';
import type { ColumnsType } from 'antd/es/table';
import Froms from './froms'
import AccountUser from './AccountUser'
import { DesktopsIcon } from 'design/SVGIcon';
import { useHistory } from 'react-router';
import api from 'teleport/services/api';
import cfg from 'teleport/config'
import SerachForm from './serachForm'
import useResource from './userResource'

import { DataType } from 'teleport/services/resourcesHost/type';

const Deleteresource = React.memo((props: DataType) => {
  const { resources } = cfg.api
  const del = () => {
    api.delete(resources + `/${props.id}`,).then(res => {
      if (res.code == 0) {
        message.info('删除成功')
        props.getlist(1, 10)
      }
    })
  }
  return (
    <Popconfirm
    title="删除"
    description="确定删除此数据吗?"
    onConfirm={del}
    okText="确认"
    cancelText="取消"
  >
   <Button type="link" style={{color:"#4459BB"}} > 删除</Button>
  </Popconfirm>
  
  )
})
const Editresource = React.memo((props: DataType) => {

  return (
    <div>
      <Button type="link" style={{color:"#4459BB"}} onClick={() => props.onStartEdite(props)}> 编辑</Button>
    </div>
  )
})
export default function LinuxHostsResource() {
  const {
    showResource,
    onStartCreate,
    onClose,
    onShowResourceUser,
    onStartEdite,
  } = useResource();
  // 列表操作
  const [datalist, setdataList] = useState([])
  const [paginations, setPagination] = useState({
    total: null,
    current: 1,
    pageSize: 10,
  });

  const { resources } = cfg.api
  const getlist = useCallback((pagenum, pagesize, values?,type=1) => {
    let params = new URLSearchParams({ pagenum, pagesize,type})
    if (values) {
      if (values.name) {
        params.append('name', values.name)
      }
      if (values.hostname) {
        params.append('hostname', values.hostname)
      }
    }
    api.get(resources + `?${params}`).then(res => {
      if (res.data.list) {
        setdataList([...res.data.list])
        setPagination({ total: res.data.totalnum, current: pagenum, pageSize: pagesize })
      } else {
        setdataList([])
      }
    })
  }, [paginations.current, paginations.pageSize])

  useEffect(() => {
    getlist(paginations.current, paginations.pageSize,)
  }, [paginations.current, paginations.pageSize])
  const handleTableChange = ({ current = 1, pageSize = 10 }) => {
    setPagination({ ...paginations, current: current, pageSize: pageSize });
  }
  const addListitem = () => {
    getlist(1, 10)
  }
  const columns: ColumnsType<DataType> = [
    {
      title: '资源名称  ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <a style={{color:"#4459BB"}} onClick={(e) => { e.preventDefault(); onShowResourceUser(record) }}>
          <DesktopsIcon size={14} fill="black" />
          {text}</a>
      )
    },

    {
      title: 'DNS名称/IP地址',
      dataIndex: 'hostname',
      key: 'hostname',

    },
    // {
    //   title: '远程连接',
    //   dataIndex: 'connect',
    //   key: 'connect',
    //   render: (text) => <a href={text}><DesktopsIcon size={15} fill="black" /></a>,
    // },
    {
      title: '类型',
      key: 'type',
      dataIndex: 'type',
      render: (text) => <>{text==0?'Windows':'Linux' }</>
    },
    {
      title: '描述',
      dataIndex: 'descp',
      key: 'descp',
      ellipsis: true,

    },
    {
      title: '操作',
      key: 'action',
      align:'center',
      render: (text, record) => <StyledAnchor className="flex">
        <Deleteresource getlist={getlist}   {...record} />
        <Editresource {...record} onStartEdite={onStartEdite} />
      </StyledAnchor>,
    },
  ];
  // 跳转
  const history = useHistory()
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);


  const findResources = () => {
    history.push('/web/DiscoveringResources')
  }
  /** rowSelection */
  // const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
  //   console.log('selectedRowKeys changed: ', newSelectedRowKeys);
  //   setSelectedRowKeys(newSelectedRowKeys);
  // };
  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: onSelectChange,
  // };
  return (
    <Wrapper>
      <div className='box'>
        <div className='header'>
          <Button type="primary"   style={{backgroundColor:"#4459BB"}} onClick={() => onStartCreate()}>添加资源</Button>
          <Button type="primary"   style={{backgroundColor:"#4459BB"}} onClick={findResources} >发现资源</Button>
          {/* <Button type="primary" onClick={batchDelResources} >删除资源</Button> */}
        </div>
        <div className='contentBox'>
          <Serach> <SerachForm getlist={getlist} /></Serach>
          <Table
            size="small"
            scroll={{ y: 'calc(100vh - 330px)' }}
            // rowSelection={rowSelection}
            rowKey='id'
            onChange={handleTableChange}
            columns={columns} dataSource={datalist} pagination={{
              ...paginations,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 30],//每页显示几个
            }}
          />
        </div>
      </div>
      <Modal width={800} title={showResource.title} okText={showResource.okText} cancelText={showResource.cancelText}
             destroyOnClose
        open={showResource.visible} onCancel={onClose} footer={null}>
        {(showResource.type == 'create' || showResource.type == 'edit') && <Froms data={showResource.dataType} handleCancel={onClose} addListitem={addListitem} />}
        {showResource.type == 'show' && <AccountUser  {...showResource.dataType} />}
      </Modal>

    </Wrapper>
  )
}



// 样式
const Wrapper = styled.div`
  background-color: #fff;
  height: calc(100vh - 72px);
  overflow:auto;
  .box{
     padding:20px;
  }
  .header{
    height:40px;
    display: flex;
    justify-content: end;
    button:last-child{
      margin-left:10px;
    }
  }
  th{font-size:12px}
  td{font-size:12px;}
`;
const StyledAnchor = styled.div`
  display: flex;
  align-items:center;
  justify-content: center;
  span{
  font-size:12px
  }
  
`;
const Serach = styled.div`
  height: 50px;
  display:flex;
  align-items:center
`;
