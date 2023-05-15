/*
Copyright 2019-2020 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import api from 'teleport/services/api';
import cfg from 'teleport/config';

import {UserAccountDataType,TableParams} from './type'

import converToUrl from 'teleport/utils/url'
const hostService = {

  fetchResourcesHostList(params:TableParams){
    let query = converToUrl(params)
    return api
      .get(cfg.getAccountUrl()+query)
  },

  fetchAddAccountUser(u:UserAccountDataType){
    return api.post(cfg.getAccountUrl(),u)
  },
  fetchDelAccountUser(id:number){
    return api.delete(cfg.getAccountUrl()+'/'+id)
  },

  fetchPutAccountUser(u:UserAccountDataType){
    return api.put(cfg.getAccountUrl()+'/'+u.id,u)
  },

  fetchFindIdAccountUser(id:number){
    return api.get(cfg.getAccountUrl()+'/'+id)
  }

}

export default hostService;
