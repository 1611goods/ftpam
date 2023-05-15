import { useState} from 'react';

import hostService from 'teleport/services/resourcesHost';

import {UserAccountDataType,TableParams} from 'teleport/services/resourcesHost/type';

import type { TablePaginationConfig} from 'antd/es/table';
import {  message } from 'antd';
export default function useAccountUser() {

  const [usersAccount, setUsersAccount] = useState([] as UserAccountDataType[]);


  const [tableParams, setTableParams] = useState<TableParams>({
    pagenum:1,
    pagesize:10,
  });

   const [pagination,setPagination] = useState<TablePaginationConfig>({
     total:0,
     showSizeChanger: true,
     pageSizeOptions: [10, 20, 30],//每页显示几个
   })

  const [accountOperation,setAccountOperation] = useState({
    type: 'none',
    visible:false,
    width:800,

  } as AccountOperation);


  /** 用户账号列表相关操作*/


  function selectUserAccountList(params:TableParams) {
    return hostService.fetchResourcesHostList(params).then(res=>{
        if(res.code == 0){
              if(res.data.list && res.data.list.length> 0) {
                setUsersAccount(res.data.list)
                setPagination({
                  ...pagination,
                  total:res.data.totalnum
                })
              }else{
                setUsersAccount([])
              }
        }else{
          setUsersAccount([])
        }

    })
  }


  function selectAccountUserId(id:number) {

    hostService.fetchFindIdAccountUser(id).then(res=>{

    })

  }


  function onAccountUserCreate(resid:number) {
    const userAccountDataType:UserAccountDataType = {
      account: "",
      pwd: "",
      acttype:0,
      resid:resid,
      id:0,
    };

    setAccountOperation({
      type: 'create',
      visible:true,
      title:'添加账号',
      width:800,

      userAccountDataType,
    });
  }


  function onAccountOptionsUpdate(userAccountDataType:UserAccountDataType) {
    selectAccountUserId(userAccountDataType.id)
    setAccountOperation({
      type: 'edit',
      visible:true,
      title:'编辑账号',
      width:800,
      userAccountDataType,
    });
  }





  function onAccountOptionsClose() {
    setAccountOperation({ type: 'none',visible:false});
  }



  function delUserAccount(u: UserAccountDataType) {
    return hostService.fetchDelAccountUser(u.id).then(res=>{
      if(res.code == 0) {
        let param:TableParams = {
          ...tableParams,
          resId:u.resid
        }
        message.success("删除成功!")
        selectUserAccountList(param)

      }else{
        message.error("删除失败!")
      }
    })


  }


  function onAddAccountUser(u: UserAccountDataType) {
    if(u.id){
      hostService.fetchPutAccountUser(u).then(res=>{
        onAccountOptionsClose()
        if(res.code == 0) {
          let param:TableParams = {
            ...tableParams,
            resId:u.resid
          }
          message.success("修改成功!")
          selectUserAccountList(param)
        }else {
          message.error("修改失败!")
        }
      })
    }else{
      hostService.fetchAddAccountUser(u).then(res=>{
        onAccountOptionsClose()
        if(res.code == 0) {
          let param:TableParams = {
            ...tableParams,
            resId:u.resid
          }
          message.success("添加成功!")
          selectUserAccountList(param)
        }else {
          message.error("添加失败!")
        }
      })
    }
    return

  }

  return {
    pagination,
    selectUserAccountList,
    tableParams,
    setTableParams,
    onAccountOptionsUpdate,
    usersAccount,
    accountOperation,
    setAccountOperation,
    onAccountUserCreate,
    onAccountOptionsClose,
    delUserAccount,
    onAddAccountUser
  };
}




type AccountOperation = {
  type: 'show' | 'create' | 'edit' | 'delete' | 'reset' | 'none';
  width?:number,
  title?:string,
  visible:boolean,
  userAccountDataType?: UserAccountDataType;
};



export type State = ReturnType<typeof useAccountUser>;
