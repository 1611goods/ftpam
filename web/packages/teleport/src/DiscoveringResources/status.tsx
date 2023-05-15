import React, { useEffect, useState, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { Button, Table, message, Popconfirm } from 'antd';
import { DataType } from './data'
import type { ColumnsType } from 'antd/es/table';
import api from 'teleport/services/api';
import cfg from 'teleport/config'
import Detail from './statusDetail'
import SerachForm from './serachfroms';
function DetailStatus(props) {
  const [datas, setdatas] = useState(null)
  const { unspect } = cfg.api
  useEffect(() => {
    const abortController = new AbortController();
    async function fetchData() {
      try {
        let abortSignal = abortController.signal
        let res = await api.get(unspect + `/${props.id}`, abortSignal)
        setdatas(res.data)
      } catch (error) {
        // console.log(error);
      }
    }
    fetchData()
    return () => {
      abortController.abort()
    };
  }, [])
  return (
    <div>
      {datas !== null && (datas == 0 ? '未开始' : datas == 1 ? '运行中' : '已完成')}
    </div>
  )
}

export default function status(props) {
  const [detailStatusKey, setDetailStatusKey] = useState(Math.random());
  const [loadings, setLoadings] = useState<boolean>(false);
  const [executeID, setexecuteID] = useState([]);
  const editDis = (values) => {
    props.handleTabClick('1', values)
  }
  const columns: ColumnsType<DataType> = [
    {
      title: '任务名称',
      dataIndex: 'taskname',
      key: 'taskname',
      render: (text, v) => (<div><Detail  {...v} /></div>)
    },
    {
      title: '资源类型',
      dataIndex: 'resourcetype',
      key: 'resourcetype',
      render: (val) => <div>Linux</div>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (val, record) => <DetailStatus key={detailStatusKey} executeId={executeID} {...record} />
    },
    {
      title: '描述',
      dataIndex: 'descp',
      key: 'descp',

    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (value, record) =>
        <div>
          <Popconfirm
            title="删除"
            description="确定删除此数据吗?"
            onConfirm={() => delDis(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" style={{ color: "#4459BB" }} > 删除</Button>
          </Popconfirm>
          <Button type="link" style={{ fontSize: '12px', color: '#4459BB' }} onClick={() => editDis(record)}> 编辑</Button>
          <Button type="link" disabled={executeID.includes(record.id) ? loadings : false} loading={executeID.includes(record.id) ? loadings : false} style={{ fontSize: '12px', color: '#4459BB' }} onClick={() => execute(record.id)}> 执行</Button>
        </div>
    },
  ];
  const { findresources, performTasks, unspect } = cfg.api
  const [datalist, setdataList] = useState([])
  const [paginations, setPagination] = useState({
    total: null,
    current: 1,
    pageSize: 10,
  });
  // 删除
  function delDis(id) {
    api.delete(findresources + `/${id}`).then(res => {
      if (res.code == 0) {
        message.info('删除成功')
        getList(1, 10)
      }
    })
  }
  let controller = new AbortController()
  let timer = useRef(null)
  //执行
  async function execute(id) {
    let { data } = await api.get(unspect + `/${id}`,)
    if (data == 2) {
      message.info('执行完毕')
    } else {
      setexecuteID([id, ...executeID])
      setLoadings(true)
      api.post(performTasks + `/${id}`, {}, controller.signal).then(res => {
        if (res.code == 0) {
          timer.current = setInterval(() => {
            api.get(unspect + `/${id}`,).then(res => {
              if (res.data == 2) {
                setexecuteID(executeID.filter(item => item != id))
                setLoadings(false)
                setDetailStatusKey(id)
                message.info('执行完毕')
                clearInterval(timer.current)
                getList(1, 10)
              }
            })
          }, 1000);
        }
      })
    }
  }

  useEffect(() => {
    return () => {
      window.clearInterval(timer.current)
      controller.abort();
    }
  }, [])
  useEffect(() => {
    getList(paginations.current, paginations.pageSize,)
  }, [paginations.current, paginations.pageSize,])

  const getList = useCallback(
    (pagenum, pagesize, values?) => {

      let params = new URLSearchParams({ pagesize, pagenum })
      if (values) {
        if (values.taskname) {
          params.append('taskname', values.taskname)
        }
      }
      api.get(findresources + `?${params}`,).then(res => {
        if (res.data.list) {
          setdataList([...res.data.list])
          setPagination({
            total: res.data.totalnum,
            current: pagenum,
            pageSize: pagesize,
          })
        } else {
          setdataList([])
        }

      })
    },
    [paginations.current, paginations.pageSize,],
  )
  //   function getList(pagenum, pagesize) {

  // }
  const handleTableChange = ({ current = 1, pageSize = 10 }) => {
    setPagination({
      ...paginations,
      current: current,
      pageSize: pageSize,
    })
  }

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {

    },
  };
  return (
    <Status >
      <div className='head'>
        <SerachForm getlist={getList} />
      </div>
      <div className='table'>
        <Table
          rowSelection={{
            type: 'checkbox',
            ...rowSelection
          }}
          size="small"
          scroll={{ y: 600 }}
          rowKey='id'
          onChange={handleTableChange}
          columns={columns}
          dataSource={datalist}
          pagination={{
            ...paginations,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 30],//每页显示几个，
            showTotal: (total, range) => `共 ${total} 条记录，当前显示${range[0]}-${range[1]}条`,

          }}
        />
      </div>
    </Status>
  )
}
const Status = styled.div`
width:99% ;
height:100% ;
overflow:auto;
.head{
  margin-bottom:10px;
}
.table {
  th{font-size:12px}
  td{font-size:12px}
}
/* .head{
  padding-bottom:10px;
 button{
  padding-left:10px;
 }
} */
`
