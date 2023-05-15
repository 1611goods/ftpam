//资源信息
import { SelectProps} from 'antd';
export interface DataType {
  id: number;
  name: string;
  descp: string;
  address: string;
  connect: string,
  type: number,
  getlist?: (pagenum: any, pagesize: any) => void;
  onStartEdite:(dataType: DataType)=>void

}


export const AccountTypeOptions: SelectProps['options'] = [
  {
    value:0,
    label: '普通账号',
  },
  {
    value:1,
    label: '任务账号',
  }
];



export  const ACCOUNT_TYPE:string[] = ['普通账号','任务账号']


type AccountUser = {
  account: string;
  pwd: string;
  acttype?:number;
  resid?:number,
}





export type Props = {
  dataType: DataType;
};



export enum EnumSourceType {
  HandAdd,
  Autodiscover
}


export enum EnumAccountType {
  OrdinaryAccount,
  TaskAccount
}







//账号信息
export  interface UserAccountDataType extends AccountUser{
  id:number,
}


export type AccountUserProps = {
  userAccountDataType:UserAccountDataType,
  onAddAccountUser(userAccountData: UserAccountDataType):void;
  onCancel():void

};

export interface TableParams{
  pagenum?:number,
  pagesize?:number,
  account?: string;
  acttype?:number;
  resId?:number,

}
