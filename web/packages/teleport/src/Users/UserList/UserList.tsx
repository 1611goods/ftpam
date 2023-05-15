/**
 * Copyright 2020 Gravitational, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import Table, { Cell, LabelCell } from 'design/DataTable';
import { MenuButton, MenuItem } from 'shared/components/MenuAction';

import { User } from 'teleport/services/user';

export default function UserList({
  users = [],
  pageSize = 20,
  onEdit,
  onDelete,
  onReset,
}: Props) {
  return (
    <Table
      data={users}
      columns={[
        {
          key: 'name',
          headerText: '名字',
          isSortable: true,
        },
        {
          key: 'roles',
          headerText: '角色',
          isSortable: true,
          onSort: (a: string[], b: string[]) => {
            const aStr = a.toString();
            const bStr = b.toString();

            if (aStr < bStr) {
              return -1;
            }
            if (aStr > bStr) {
              return 1;
            }

            return 0;
          },
          render: ({ roles }) => <LabelCell data={roles} />,
        },
        {
          key: 'authType',
          headerText: '类型',
          isSortable: true,
          render: ({ authType }) => (
            <Cell style={{ textTransform: 'capitalize' }}>{authType}</Cell>
          ),
        },
        {
          altKey: 'options-btn',
          render: user => (
            <ActionCell
              user={user}
              onEdit={onEdit}
              onReset={onReset}
              onDelete={onDelete}
            />
          ),
        },
      ]}
      emptyText="未找到用户"
      isSearchable
      pagination={{ pageSize }}
    />
  );
}

const ActionCell = ({
  user,
  onEdit,
  onReset,
  onDelete,
}: {
  user: User;
  onEdit: (user: User) => void;
  onReset: (user: User) => void;
  onDelete: (user: User) => void;
}) => {
  if (!user.isLocal) {
    return <Cell align="right" />;
  }

  return (
    <Cell align="right">
      <MenuButton>
        <MenuItem onClick={() => onEdit(user)}>编辑...</MenuItem>
        <MenuItem onClick={() => onReset(user)}>
          重置用户身份验证...
        </MenuItem>
        <MenuItem onClick={() => onDelete(user)}>删除...</MenuItem>
      </MenuButton>
    </Cell>
  );
};

type Props = {
  users: User[];
  pageSize?: number;
  onEdit(user: User): void;
  onDelete(user: User): void;
  onReset(user: User): void;
};
