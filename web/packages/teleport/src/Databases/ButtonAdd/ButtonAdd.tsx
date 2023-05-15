/*
Copyright 2020 Gravitational, Inc.

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

import React from 'react';
import { ButtonPrimary } from 'design';

export default function ButtonAdd(props: Props) {
  const { canCreate, isLeafCluster, onClick } = props;
  const disabled = isLeafCluster || !canCreate;

  let title = '';
  if (!canCreate) {
    title = '您没有添加数据库的权限';
  }

  if (isLeafCluster) {
    title = '不支持将数据库添加到集群';
  }

  return (
    <ButtonPrimary
      title={title}
      disabled={disabled}
      width="240px"
      onClick={onClick}
    >
      添加数据库
    </ButtonPrimary>
  );
}

type Props = {
  isLeafCluster: boolean;
  canCreate: boolean;
  onClick?: () => void;
};
