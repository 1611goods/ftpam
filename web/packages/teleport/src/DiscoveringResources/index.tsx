import React, { useState, useMemo, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import Discover from './Discovery';
import Schedules from './Schedules';
import Status from './status';
export default function discoveringResources() {
  const [ActiveKey, setActiveKey] = useState('1')
  const [editobj, seteditobj] = useState(null)
  function onChange(key, values) {
    if (values) {
      seteditobj(values)
    } else {
      seteditobj(null)
    }
    setActiveKey(key);
  }
  const onChangeCallback = useCallback(onChange, []);
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `发现资源`,
      children: <Discover handleTabClick={onChangeCallback} data={editobj} />,
    },
    {
      key: '2',
      label: `发现资源列表`,
      children: <Status handleTabClick={onChangeCallback} />,
    },
  ];
  return (

    <Wrapper>
      {/* <div className='left'>
        <ul >
          <li>Linux</li>
        </ul>
      </div> */}
      <div className='right'>
        <Tabs destroyInactiveTabPane activeKey={ActiveKey} defaultActiveKey={ActiveKey} items={items} onChange={(keys, value?) => onChangeCallback(keys, value)} />
      </div>
    </Wrapper>

  )
}

const Wrapper = styled.div`
height:calc(100vh - 72px);
background-color:#fff;
color:black;
display:flex;
overflow:auto;
.left{
  width:250px;
  border-right:1px solid #ddd;
  ul{
    list-style:none;
    margin:0 ;
    padding:0 ;
  li{
    height:42px;
    line-height:42px;
    padding-left:25px;
    background-color:#e9e9e9;
  }
}
}
.right{
  width:100%;
  padding:0 10px;
  .ant-tabs-tab-active{
    .ant-tabs-tab-btn{
      color: #4459BB;
    }
  }
  .ant-tabs-ink-bar{
    background-color:#4459BB;
  }
}


`
