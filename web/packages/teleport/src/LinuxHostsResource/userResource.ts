import { useState} from 'react';
import {DataType} from 'teleport/services/resourcesHost/type';


export default function useResource() {

  const [showResource, setShowResource] = useState({
    type: 'none',
    visible:false,
    width:800,
    okText:'保存',
    cancelText:'取消',
  } as Operation);

  function onStartCreate() {
    const dataType:DataType = null;
    setShowResource({
      type: 'create',
      visible:true,
      title:'添加资源',
      width:800,
      dataType,
    });
  }
  function onStartEdite(dataType:DataType) {
    setShowResource({
      type: 'edit',
      visible:true,
      title:'编辑资源',
      width: 800,
      dataType
    });
  }

  function onShowResourceUser(dataType: DataType) {
    setShowResource({ type: 'show',title:dataType.name,  width:800, visible:true, dataType });
  }
  function onClose() {
    setShowResource({ type: 'none',visible:false});
  }

  return {
    showResource,
    onClose,
    onStartCreate,
    onShowResourceUser,
    onStartEdite,
  };
}

type Operation = {
  type: 'show' | 'create' | 'edit' | 'delete' | 'reset' | 'none';
  width?:number,
  title?:string,
  okText?:string,
  cancelText?:string,
  visible:boolean,
  dataType?: DataType;
};
export type State = ReturnType<typeof useResource>;
