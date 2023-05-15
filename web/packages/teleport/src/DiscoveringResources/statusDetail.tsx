import React, { useEffect, useState, forwardRef, useImperativeHandle, useMemo } from 'react'
import styled from 'styled-components'
import { Button, Modal, Table, message, Col, Row, } from 'antd';
import { detailType, detailcolumns } from './data'
import api from 'teleport/services/api';
import cfg from 'teleport/config'
import type { TableColumnsType } from 'antd';
export default function statusDetail(props) {
  const { discresources, discaccounts, choose } = cfg.api
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datalist, setdataList] = useState<detailType[]>([])
  const [datakey, setdatakey] = useState([])
  const [Expanddatakey, setExpanddatakey] = useState({})
  const [paginations, setPagination] = useState({
    total: null,
    current: 1,
    pageSize: 10,
  });
  function getList(pagenum, pagesize) {
    let params = new URLSearchParams({ pagenum, pagesize, taskId: props.id })
    api.get(discresources + `?${params}`).then(res => {
      setdataList(res.data.list)
      setPagination({
        total: res.data.totalnum,
        current: pagenum,
        pageSize: pagesize,
      })
    })
  }
  const handleTableChange = ({ current = 1, pageSize = 10 }) => {
    setPagination({
      ...paginations,
      current: current,
      pageSize: pageSize,
    })
    getList(current,pageSize)
  }
  const detailStatus = () => {
    getList(1, 10)
    setIsModalOpen(true)
  }
  function addtaskStatus() {
    api.post(choose, Expanddatakey).then(res => {
      if (res.code == 0) {
        message.info('添加成功')
        setdatakey([])
      } else {
        message.error(res.message)
      }
    })
  }
  const handleCancel = () => {
    setIsModalOpen(false)
  }
  function getExpandedkey(keys,keys2) {
    setExpanddatakey({ ...Expanddatakey, ...keys, })
    setdatakey([...datakey,...keys2])
  }
  const [Expanddatalist, setExpanddatalist] = useState([])
  const [Expandepaginations, setExpandepaginations] = useState({
    total: null,
    current: 1,
    pageSize: 10,
  });
 function handpagechange(current,pageSize){
   setExpandepaginations({
     ...Expandepaginations,
     current: current,
     pageSize: pageSize,
  })
  }
  function getLists(pagenum, pagesize, discResId) {
    let params = new URLSearchParams({ pagenum, pagesize, discResId })
    api.get(discaccounts + `?${params}`).then(res => {
      setExpanddatalist(res.data.list)
      setExpandepaginations({
        total: res.data.totalnum,
        current: pagenum,
        pageSize: pagesize,
      })
    })
  }
  function onExpand(expanded, record) {
    expanded && getLists(1, 10, record.id)
  }
  const expandedRowRenders = useMemo(() => {
    return (record) => (
      <ExpandedContent
        getExpandedkey={getExpandedkey}
        Expandepaginations={Expandepaginations}
        Expanddatalist={Expanddatalist}
        datakey={datakey}
        handpagechange={handpagechange}
        {...record} />)

  }, [Expandepaginations, Expanddatalist, getExpandedkey,])
  return (
    <div>
      <Button type="link" onClick={detailStatus} style={{fontSize:'12px',color:'#4459BB'}}>   {props.taskname}</Button>
      <Modal title="发现任务的状态" width={800} open={isModalOpen} footer={null} onCancel={handleCancel} style={{ height: '600px', overflow: 'auto' }}>
        <div style={{ margin: '10px 0' }}>
          <Button type="primary"style={{ marginRight: '10px',backgroundColor:'#4459BB' }}  onClick={addtaskStatus}>添加</Button>
          {/* <Button>add ALL</Button> */}
        </div>
        <Table
          scroll={{ y: 300 }}
          rowKey='id'
          expandable={{
            expandedRowRender:expandedRowRenders,
            onExpand,
          }}
          onChange={handleTableChange}
          style={{ height: '400px' }}
          columns={detailcolumns}
          dataSource={datalist}
          pagination={{
            ...paginations,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 30],//每页显示几个
          }}
        />
      </Modal>
    </div>
  )
}
const ExpandedContent = ((props) => {
  const { Expanddatalist,handpagechange, Expandepaginations, getExpandedkey,datakey } = props

  interface ExpandedDataType {
    id: string;
    discResId: string;
    account: string;
  }
  const columns: TableColumnsType<ExpandedDataType> = [
    {
      title: '账号',
      dataIndex: 'account',
      key: 'dnsname',
    },
  ]
  const rowSelection = {
    selectedRowKeys:datakey,
    onChange: (selectedRowKeys, selectedRows) => {
      getExpandedkey({ [props.id]: selectedRowKeys.length ? selectedRowKeys : null },selectedRowKeys)
    }
  }
  function handleTableChange({ current = 1, pageSize = 10 }) {
    handpagechange(current,pageSize)
 }
  return (
    <div>
      <Table
        rowSelection={{
        type: 'checkbox',
        ...rowSelection
        }}
        onChange={handleTableChange}
        rowKey='id'
        columns={columns}
        dataSource={Expanddatalist}
        pagination={{
        ...Expandepaginations,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 30],//每页显示几个
      }} />
    </div>
  )
})
const StyledRow = styled(Row)`
  .ant-col{
    height:40px ;
    line-height:40px;
  }
`

