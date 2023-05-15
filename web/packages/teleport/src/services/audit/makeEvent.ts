/*
Copyright 2019 Gravitational, Inc.

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

import { formatDistanceStrict } from 'date-fns';

import { Event, RawEvent, Formatters, eventCodes } from './types';

export const formatters: Formatters = {
  [eventCodes.ACCESS_REQUEST_CREATED]: {
    type: 'access_request.create',
    desc: '已创建访问请求',
    format: ({ id, state }) =>
      `访问请求 [${id}]已创建，并且 ${state}`,
  },
  [eventCodes.ACCESS_REQUEST_UPDATED]: {
    type: 'access_request.update',
    desc: '访问请求已更新',
    format: ({ id, state }) =>
      `访问请求 [${id}] 已更新为 ${state}`,
  },
  [eventCodes.ACCESS_REQUEST_REVIEWED]: {
    type: 'access_request.review',
    desc: '已审核访问请求',
    format: ({ id, reviewer }) =>
      `用户 [${reviewer}] 已审核的访问请求[${id}]`,
  },
  [eventCodes.ACCESS_REQUEST_DELETED]: {
    type: 'access_request.delete',
    desc: '访问请求已删除',
    format: ({ id }) => `访问请求 [${id}] 已被删除`,
  },
  [eventCodes.ACCESS_REQUEST_RESOURCE_SEARCH]: {
    type: 'access_request.search',
    desc: '资源访问请求搜索',
    format: ({ user, resource_type, search_as_roles }) =>
      `用户 [${user}] 已搜索资源类型 [${resource_type}] 具有角色[${search_as_roles}]`,
  },
  [eventCodes.SESSION_COMMAND]: {
    type: 'session.command',
    desc: '会话命令',
    format: ({ program, sid }) =>
      `程序 [${program}] 已在会话中执行 [${sid}]`,
  },
  [eventCodes.SESSION_DISK]: {
    type: 'session.disk',
    desc: 'Session File Access',
    format: ({ path, sid, program }) =>
      `程序 [${program}]访问了一个文件 [${path}]在会话中 [${sid}]`,
  },
  [eventCodes.SESSION_NETWORK]: {
    type: 'session.network',
    desc: '会话网络连接',
    format: ({ action, sid, program, src_addr, dst_addr, dst_port }) => {
      const a = action === 1 ? '[DENY]' : '[ALLOW]';
      const desc =
        action === 1 ? '被阻止打开' : '成功打开';
      return `${a} 程序 [${program}] ${desc} 连接 [${src_addr} <-> ${dst_addr}:${dst_port}] 在会话中[${sid}]`;
    },
  },
  [eventCodes.SESSION_PROCESS_EXIT]: {
    type: 'session.process_exit',
    desc: '会话进程退出',
    format: ({ program, exit_status, sid }) =>
      `程序 [${program}] 已退出，状态为 ${exit_status},在会话中 [${sid}]`,
  },
  [eventCodes.SESSION_DATA]: {
    type: 'session.data',
    desc: '会话数据',
    format: ({ sid }) =>
      `已更新会话的使用情况报告 [${sid || ''}]`,
  },

  [eventCodes.USER_PASSWORD_CHANGED]: {
    type: 'user.password_change',
    desc: '已更新用户密码',
    format: ({ user }) => `用户 [${user}] 已更改密码`,
  },

  [eventCodes.USER_UPDATED]: {
    type: 'user.update',
    desc: '用户已更新',
    format: ({ name }) => `用户 [${name}] 已更新`,
  },
  [eventCodes.RESET_PASSWORD_TOKEN_CREATED]: {
    type: 'reset_password_token.create',
    desc: '重置已创建的密码令牌',
    format: ({ name, user }) =>
      `用户 [${user}] 为用户创建了密码重置令牌[${name}]`,
  },
  [eventCodes.AUTH_ATTEMPT_FAILURE]: {
    type: 'auth',
    desc: '身份验证尝试失败',
    format: ({ user, error }) => `用户 [${user}] 份验证尝试失败: ${error}`,
  },

  [eventCodes.CLIENT_DISCONNECT]: {
    type: 'client.disconnect',
    desc: '客户端已断开连接',
    format: ({ user, reason }) =>
      `用户 [${user}] 已断开连接: ${reason}`,
  },
  [eventCodes.EXEC]: {
    type: 'exec',
    desc: '命令执行',
    format: event => {
      const { proto, kubernetes_cluster, user = '' } = event;
      if (proto === 'kube') {
        if (!kubernetes_cluster) {
          return `用户 [${user}] 执行了一个kubernetes命令`;
        }
        return `用户 [${user}] 在kubernetes集群上执行了一个命令 [${kubernetes_cluster}]`;
      }

      return `用户 [${user}] 在节点上执行命令 ${
        event['server_hostname'] || event['addr.local']
      }`;
    },
  },
  [eventCodes.EXEC_FAILURE]: {
    type: 'exec',
    desc: '命令执行失败',
    format: ({ user, exitError, ...rest }) =>
      `用户 [${user}] 在节点上执行命令${
        rest['server_hostname'] || rest['addr.local']
      } 失败 [${exitError}]`,
  },
  [eventCodes.GITHUB_CONNECTOR_CREATED]: {
    type: 'github.created',
    desc: 'GITHUB 创建身份验证连接器',
    format: ({ user, name }) =>
      `用户 [${user}] 创建GitHub连接器[${name}] 已创建`,
  },
  [eventCodes.GITHUB_CONNECTOR_DELETED]: {
    type: 'github.deleted',
    desc: 'GITHUB 删除身份验证连接器',
    format: ({ user, name }) =>
      `用户 [${user}]删除GITHUB身份验证连接器 [${name}]`,
  },
  [eventCodes.OIDC_CONNECTOR_CREATED]: {
    type: 'oidc.created',
    desc: 'OIDC  创建身份验证连接器',
    format: ({ user, name }) =>
      `用户 [${user}] 创建的OIDC连接器 [${name}]`,
  },
  [eventCodes.OIDC_CONNECTOR_DELETED]: {
    type: 'oidc.deleted',
    desc: 'OIDC 删除身份验证连接器',
    format: ({ user, name }) =>
      `用户 [${user}] 删除OIDC身份验证连接器[${name}]`,
  },
  [eventCodes.PORTFORWARD]: {
    type: 'port',
    desc: '端口 已开始发送',
    format: ({ user }) => `用户 [${user}] 已启动端口转发`,
  },
  [eventCodes.PORTFORWARD_FAILURE]: {
    type: 'port',
    desc: '端口 F转发失败',
    format: ({ user, error }) =>
      `用户 [${user}] 端口转发请求失败: ${error}`,
  },
  [eventCodes.SAML_CONNECTOR_CREATED]: {
    type: 'saml.created',
    desc: 'SAML 创建连接器',
    format: ({ user, name }) =>
      `用户 [${user}] 创建连接器 [${name}]`,
  },
  [eventCodes.SAML_CONNECTOR_DELETED]: {
    type: 'saml.deleted',
    desc: 'SAML 连接器删除',
    format: ({ user, name }) =>
      `用户 [${user}] 删除 SAML  连接器 [${name}]`,
  },
  [eventCodes.SCP_DOWNLOAD]: {
    type: 'scp',
    desc: 'SCP 下载',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] 下载文件[${path}] 来自节点 [${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SCP_DOWNLOAD_FAILURE]: {
    type: 'scp',
    desc: 'SCP 下载失败',
    format: ({ exitError, ...rest }) =>
      `下载文件来自节点[${
        rest['server_hostname'] || rest['addr.local']
      }] 失败 [${exitError}]`,
  },
  [eventCodes.SCP_UPLOAD]: {
    type: 'scp',
    desc: 'SCP Upload',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] uploaded a file to [${path}]在节点上 [${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SCP_UPLOAD_FAILURE]: {
    type: 'scp',
    desc: 'SCP 上传失败',
    format: ({ exitError, ...rest }) =>
      `文件上传节点 [${
        rest['server_hostname'] || rest['addr.local']
      }] 失败 [${exitError}]`,
  },
  [eventCodes.SFTP_OPEN]: {
    type: 'sftp',
    desc: 'SFTP 打开',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] 打开文件 [${path}] 在节点上 [${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_OPEN_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP 打开失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败打开文件 [${path}] 在节点上 [${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_CLOSE]: {
    type: 'sftp',
    desc: 'SFTP 关闭',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] closed file [${path}] 在节点上 [${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_CLOSE_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP 关闭失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败关闭文件 [${path}] 在节点上 [${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_READ]: {
    type: 'sftp',
    desc: 'SFTP 读取',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] 从文件中读取 [${path}]在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_READ_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP 读取失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败从文件中读取 [${path}] 在节点上 [${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_WRITE]: {
    type: 'sftp',
    desc: 'SFTP 写入',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}]写入文件 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_WRITE_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP 写入失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败写入文件 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_LSTAT]: {
    type: 'sftp',
    desc: 'SFTP Lstat',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] 查询的文件属性 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_LSTAT_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Lstat 失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败查询的文件属性 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_FSTAT]: {
    type: 'sftp',
    desc: 'SFTP Fstat',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}]查询的文件属性[${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_FSTAT_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Fstat 失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败查询的文件属性 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_SETSTAT]: {
    type: 'sftp',
    desc: 'SFTP Setstat',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] 更改文件属性 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_SETSTAT_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Setstat 失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败更改文件属性 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_FSETSTAT]: {
    type: 'sftp',
    desc: 'SFTP Fsetstat',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] 更改文件属性 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_FSETSTAT_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Fsetstat 失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败更改文件属性 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_OPENDIR]: {
    type: 'sftp',
    desc: 'SFTP Opendir',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}]打开文件夹 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_OPENDIR_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Opendir 失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败打开文件夹 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_READDIR]: {
    type: 'sftp',
    desc: 'SFTP Readdir',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] 读取文件夹 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_READDIR_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Readdir 失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败读取文件夹[${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_REMOVE]: {
    type: 'sftp',
    desc: 'SFTP Remove',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}]删除文件 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_REMOVE_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Remove 失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败删除文件[${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_MKDIR]: {
    type: 'sftp',
    desc: 'SFTP Mkdir',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] 创建文件夹 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_MKDIR_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Mkdir 失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败创建文件夹 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_RMDIR]: {
    type: 'sftp',
    desc: 'SFTP Rmdir',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}]删除文件夹 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_RMDIR_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Rmdir 失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败删除文件夹 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_REALPATH]: {
    type: 'sftp',
    desc: 'SFTP Realpath',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}]查询的文件绝对路径 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_REALPATH_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Realpath Failed',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败 查询文件的绝对路径 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_STAT]: {
    type: 'sftp',
    desc: 'SFTP Stat',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}]查询文件的绝对路径 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_STAT_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Stat Failed',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败查询文件的绝对路径 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_RENAME]: {
    type: 'sftp',
    desc: 'SFTP Rename',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}]重命名文件 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_RENAME_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Rename Failed',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败重命名文件 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_READLINK]: {
    type: 'sftp',
    desc: 'SFTP Readlink',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] 读取符号链接 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_READLINK_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Readlink Failed',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败读取符号链接 [${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SFTP_SYMLINK]: {
    type: 'sftp',
    desc: 'SFTP Symlink',
    format: ({ user, path, ...rest }) =>
      `用户 [${user}] 创建符号链接[${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]`,
  },
  [eventCodes.SFTP_SYMLINK_FAILURE]: {
    type: 'sftp',
    desc: 'SFTP Symlink 失败',
    format: ({ user, path, error, ...rest }) =>
      `用户 [${user}] 失败创建符号链接[${path}] 在节点上[${
        rest['server_hostname'] || rest['addr.local']
      }]: [${error}]`,
  },
  [eventCodes.SESSION_JOIN]: {
    type: 'session.join',
    desc: '用户连接',
    format: ({ user, sid }) => `用户 [${user}]已加入会话 [${sid}]`,
  },
  [eventCodes.SESSION_END]: {
    type: 'session.end',
    desc: '会话结束',
    format: event => {
      const user = event.user || '';
      const node =
        event.server_hostname || event.server_addr || event.server_id;

      if (event.proto === 'kube') {
        if (!event.kubernetes_cluster) {
          return `用户 [${user}]已结束kubernetes会话 [${event.sid}]`;
        }
        return `用户 [${user}] 已结束会话 [${event.sid}] 关于kubernetes集群 [${event.kubernetes_cluster}]`;
      }

      if (!event.interactive) {
        return `用户 [${user}] 已结束非交互式会话 [${event.sid}] 在节点上[${node}] `;
      }

      if (event.session_start && event.session_stop) {
        const start = new Date(event.session_start);
        const end = new Date(event.session_stop);
        const durationText = formatDistanceStrict(start, end);
        return `用户 [${user}] 已结束持续的交互式会话 ${durationText} [${event.sid}] 在节点上[${node}]`;
      }

      return `用户 [${user}] 已结束交互式会话 [${event.sid}] 在节点上[${node}] `;
    },
  },
  [eventCodes.SESSION_REJECT]: {
    type: 'session.rejected',
    desc: '会话拒绝',
    format: ({ user, login, server_id, reason }) =>
      `用户 [${user}] 被拒绝访问[${login}@${server_id}] 因为 [${reason}]`,
  },
  [eventCodes.SESSION_LEAVE]: {
    type: 'session.leave',
    desc: '用户关闭会话',
    format: ({ user, sid }) => `用户 [${user}] 已离开会话 [${sid}]`,
  },
  [eventCodes.SESSION_START]: {
    type: 'session.start',
    desc: '启动会话 ',
    format: ({ user, sid }) => `用户 [${user}] 已启动会话[${sid}]`,
  },
  [eventCodes.SESSION_UPLOAD]: {
    type: 'session.upload',
    desc: '会话上传',
    format: ({ sid }) => `录制的会话 [${sid}] 已上传`,
  },
  [eventCodes.APP_SESSION_START]: {
    type: 'app.session.start',
    desc: '应用程序会话已启动',
    format: event => {
      const { user, app_name, aws_role_arn } = event;
      if (aws_role_arn) {
        return `用户 [${user}]已连接到AWS控制台[${app_name}]`;
      }
      return `用户 [${user}]已连接到应用程序[${app_name}]`;
    },
  },
  [eventCodes.APP_SESSION_END]: {
    type: 'app.session.end',
    desc: '应用程序会话已结束',
    format: event => {
      const { user, app_name } = event;
      return `用户 [${user}]已断开与应用程序的连接[${app_name}]`;
    },
  },
  [eventCodes.APP_SESSION_CHUNK]: {
    type: 'app.session.chunk',
    desc: '应用程序会话数据',
    format: event => {
      const { user, app_name } = event;
      return `为应用程序创建新的会话数据块 [${app_name}] 由用户访问 [${user}]`;
    },
  },
  [eventCodes.APP_SESSION_DYNAMODB_REQUEST]: {
    type: 'app.session.dynamodb.request',
    desc: '应用程序会话DynamoDB请求',
    format: ({ user, app_name, target }) => {
      let message = `用户 [${user}] 已提出申请 [${app_name}]`;
      if (target) {
        message += `, target: [${target}]`;
      }
      return message;
    },
  },
  [eventCodes.SUBSYSTEM]: {
    type: 'subsystem',
    desc: 'Subsystem 请求',
    format: ({ user, name }) => `用户 [${user}] 请求的子系统 [${name}]`,
  },
  [eventCodes.SUBSYSTEM_FAILURE]: {
    type: 'subsystem',
    desc: 'Subsystem 请求失败',
    format: ({ user, name, exitError }) =>
      `用户 [${user}] 子系统 [${name}] 请求 失败 [${exitError}]`,
  },
  [eventCodes.TERMINAL_RESIZE]: {
    type: 'resize',
    desc: '终端调整大小',
    format: ({ user, sid }) =>
      `用户 [${user}] 调整会话大小 [${sid}] 终端`,
  },
  [eventCodes.USER_CREATED]: {
    type: 'user.create',
    desc: '用户创建',
    format: ({ name }) => `用户 [${name}] 已创建`,
  },
  [eventCodes.USER_DELETED]: {
    type: 'user.delete',
    desc: '用户 删除',
    format: ({ name }) => `用户 [${name}] 已被删除`,
  },
  [eventCodes.USER_LOCAL_LOGIN]: {
    type: 'user.login',
    desc: '本地登录',
    format: ({ user }) => `本地用户 [${user}] 成功登录`,
  },
  [eventCodes.USER_LOCAL_LOGINFAILURE]: {
    type: 'user.login',
    desc: '本地用户失败',
    format: ({ user, error }) => `本地用户 [${user}] 登录 失败 [${error}]`,
  },
  [eventCodes.USER_SSO_LOGIN]: {
    type: 'user.login',
    desc: 'SSO 登录',
    format: ({ user }) => `SSO user [${user}] 成功登录`,
  },
  [eventCodes.USER_SSO_LOGINFAILURE]: {
    type: 'user.login',
    desc: 'SSO 登录失败',
    format: ({ error }) => `SSO 用户登录失败 [${error}]`,
  },
  [eventCodes.USER_SSO_TEST_FLOW_LOGIN]: {
    type: 'user.login',
    desc: 'SSO Test Flow Login',
    format: ({ user }) =>
      `SSO Test Flow: user [${user}] 成功登录`,
  },
  [eventCodes.USER_SSO_TEST_FLOW_LOGINFAILURE]: {
    type: 'user.login',
    desc: 'SSO 测试流程登录失败',
    format: ({ error }) => `SSO 测试流程: 用户登录失败 [${error}]`,
  },
  [eventCodes.ROLE_CREATED]: {
    type: 'role.created',
    desc: '用户角色创建',
    format: ({ user, name }) => `用户 [${user}] 角色创建 [${name}]`,
  },
  [eventCodes.ROLE_DELETED]: {
    type: 'role.deleted',
    desc: '用户删除角色 ',
    format: ({ user, name }) => `用户 [${user}] 删除角色 [${name}]`,
  },
  [eventCodes.TRUSTED_CLUSTER_TOKEN_CREATED]: {
    type: 'trusted_cluster_token.create',
    desc: '已创建受信任的集群令牌',
    format: ({ user }) => `用户 [${user}] 已创建受信任的集群令牌`,
  },
  [eventCodes.TRUSTED_CLUSTER_CREATED]: {
    type: 'trusted_cluster.create',
    desc: '已创建受信任的集群',
    format: ({ user, name }) =>
      `用户 [${user}]已创建与集群的受信任关系 [${name}]`,
  },
  [eventCodes.TRUSTED_CLUSTER_DELETED]: {
    type: 'trusted_cluster.delete',
    desc: '已删除受信任的集群',
    format: ({ user, name }) =>
      `用户 [${user}] 已删除与集群的受信任关系 [${name}]`,
  },
  [eventCodes.KUBE_REQUEST]: {
    type: 'kube.request',
    desc: 'Kubernetes 请求',
    format: ({ user, kubernetes_cluster, verb, request_path, response_code }) =>
      `用户 [${user}] 发送 [${response_code}] 来自 [${verb} ${request_path}]   kubernetes 集群的请求 [${kubernetes_cluster}]`,
  },
  [eventCodes.KUBE_CREATED]: {
    type: 'kube.create',
    desc: 'Kubernetes 创建',
    format: ({ user, name }) =>
      `用户 [${user}] 创建 kubernetes 集群 [${name}]`,
  },
  [eventCodes.KUBE_UPDATED]: {
    type: 'kube.update',
    desc: 'Kubernetes 更新',
    format: ({ user, name }) =>
      `用户 [${user}] 更新 kubernetes 集群 [${name}]`,
  },
  [eventCodes.KUBE_DELETED]: {
    type: 'kube.delete',
    desc: 'Kubernetes 删除',
    format: ({ user, name }) =>
      `用户 [${user}] 删除 kubernetes 集群 [${name}]`,
  },
  [eventCodes.DATABASE_SESSION_STARTED]: {
    type: 'db.session.start',
    desc: '数据库会话已启动',
    format: ({ user, db_service, db_name, db_user }) =>
      `用户 [${user}] 已连接${
        db_name ? `到数据库[${db_name}] ` : ''
      } [${db_user}] 在 [${db_service}]`,
  },
  [eventCodes.DATABASE_SESSION_STARTED_FAILURE]: {
    type: 'db.session.start',
    desc: '数据库会话 拒绝',
    format: ({ user, db_service, db_name, db_user }) =>
      `用户 [${user}] 被拒绝访问数据库 [${db_name}] as [${db_user}] on [${db_service}]`,
  },
  [eventCodes.DATABASE_SESSION_ENDED]: {
    type: 'db.session.end',
    desc: '数据库会话 Ended',
    format: ({ user, db_service, db_name }) =>
      `用户 [${user}] 已断开连接 ${
        db_name ? `来自数据库 [${db_name}] ` : ''
      }on [${db_service}]`,
  },
  [eventCodes.DATABASE_SESSION_QUERY]: {
    type: 'db.session.query',
    desc: '数据库查询',
    format: ({ user, db_service, db_name, db_query }) =>
      `用户 [${user}] 已执行查询 [${truncateStr(
        db_query,
        80
      )}] 在数据库中 [${db_name}] 在[${db_service}]`,
  },
  [eventCodes.DATABASE_SESSION_QUERY_FAILURE]: {
    type: 'db.session.query.failed',
    desc: '数据库查询失败',
    format: ({ user, db_service, db_name, db_query }) =>
      `用户 [${user}] 查询 [${truncateStr(
        db_query,
        80
      )}] 在数据库中 [${db_name}] 在 [${db_service}] 失败`,
  },
  [eventCodes.DATABASE_SESSION_MALFORMED_PACKET]: {
    type: 'db.session.malformed_packet"',
    desc: '数据库 Malformed Packet',
    format: ({ user, db_service, db_name }) =>
      `在数据库 [${user}] 上的 [${db_name}] 中从 [${db_service}]`,
  },
  [eventCodes.DATABASE_CREATED]: {
    type: 'db.create',
    desc: '数据库创建',
    format: ({ user, name }) => `用户 [${user}] 创建数据库 [${name}]`,
  },
  [eventCodes.DATABASE_UPDATED]: {
    type: 'db.update',
    desc: '数据库更新',
    format: ({ user, name }) => `用户 [${user}] 更新数据库 [${name}]`,
  },
  [eventCodes.DATABASE_DELETED]: {
    type: 'db.delete',
    desc: '数据库删除',
    format: ({ user, name }) => `用户 [${user}] 删除数据库 [${name}]`,
  },
  [eventCodes.APP_CREATED]: {
    type: 'app.create',
    desc: '应用创建',
    format: ({ user, name }) => `用户 [${user}] 创建应用 [${name}]`,
  },
  [eventCodes.APP_UPDATED]: {
    type: 'app.update',
    desc: '应用更新',
    format: ({ user, name }) => `用户 [${user}] 更新应用 [${name}]`,
  },
  [eventCodes.APP_DELETED]: {
    type: 'app.delete',
    desc: '应用删除',
    format: ({ user, name }) => `用户 [${user}] 删除应用 [${name}]`,
  },
  [eventCodes.POSTGRES_PARSE]: {
    type: 'db.session.postgres.statements.parse',
    desc: 'PostgreSQL 语句分析',
    format: ({ user, db_service, statement_name, query }) =>
      `用户 [${user}] has prepared [${truncateStr(
        query,
        80
      )}] as statement [${statement_name}] on [${db_service}]`,
  },
  [eventCodes.POSTGRES_BIND]: {
    type: 'db.session.postgres.statements.bind',
    desc: 'PostgreSQL 语句 绑定',
    format: ({ user, db_service, statement_name, portal_name }) =>
      `用户 [${user}] has readied statement [${statement_name}] for execution as portal [${portal_name}] on [${db_service}]`,
  },
  [eventCodes.POSTGRES_EXECUTE]: {
    type: 'db.session.postgres.statements.execute',
    desc: 'PostgreSQL 语句执行',
    format: ({ user, db_service, portal_name }) =>
      `用户 [${user}] has executed portal [${portal_name}] on [${db_service}]`,
  },
  [eventCodes.POSTGRES_CLOSE]: {
    type: 'db.session.postgres.statements.close',
    desc: 'PostgreSQL 语句关闭',
    format: e => {
      if (e.portal_name) {
        return `用户 [${e.user}] has closed portal [${e.portal_name}] on [${e.db_service}]`;
      }
      return `用户 [${e.user}] has closed statement [${e.statement_name}] on [${e.db_service}]`;
    },
  },
  [eventCodes.POSTGRES_FUNCTION_CALL]: {
    type: 'db.session.postgres.function',
    desc: 'PostgreSQL Function Call',
    format: ({ user, db_service, function_oid }) =>
      `用户 [${user}] has executed function with OID [${function_oid}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_STATEMENT_PREPARE]: {
    type: 'db.session.mysql.statements.prepare',
    desc: 'MySQL Statement Prepare',
    format: ({ user, db_service, db_name, query }) =>
      `用户 [${user}] has prepared [${truncateStr(
        query,
        80
      )}] in database [${db_name}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_STATEMENT_EXECUTE]: {
    type: 'db.session.mysql.statements.execute',
    desc: 'MySQL Statement Execute',
    format: ({ user, db_service, db_name, statement_id }) =>
      `用户 [${user}] has executed statement [${statement_id}] in database [${db_name}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_STATEMENT_SEND_LONG_DATA]: {
    type: 'db.session.mysql.statements.send_long_data',
    desc: 'MySQL Statement Send Long Data',
    format: ({
      user,
      db_service,
      db_name,
      statement_id,
      parameter_id,
      data_size,
    }) =>
      `用户 [${user}] has sent ${data_size} bytes of data to parameter [${parameter_id}] of statement [${statement_id}] in database [${db_name}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_STATEMENT_CLOSE]: {
    type: 'db.session.mysql.statements.close',
    desc: 'MySQL Statement Close',
    format: ({ user, db_service, db_name, statement_id }) =>
      `用户 [${user}] has closed statement [${statement_id}] in database [${db_name}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_STATEMENT_RESET]: {
    type: 'db.session.mysql.statements.reset',
    desc: 'MySQL Statement Reset',
    format: ({ user, db_service, db_name, statement_id }) =>
      `用户 [${user}] has reset statement [${statement_id}] in database [${db_name}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_STATEMENT_FETCH]: {
    type: 'db.session.mysql.statements.fetch',
    desc: 'MySQL Statement Fetch',
    format: ({ user, db_service, db_name, rows_count, statement_id }) =>
      `用户 [${user}] has fetched ${rows_count} rows of statement [${statement_id}] in database [${db_name}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_STATEMENT_BULK_EXECUTE]: {
    type: 'db.session.mysql.statements.bulk_execute',
    desc: 'MySQL Statement Bulk Execute',
    format: ({ user, db_service, db_name, statement_id }) =>
      `用户 [${user}] has executed statement [${statement_id}] in database [${db_name}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_INIT_DB]: {
    type: 'db.session.mysql.init_db',
    desc: 'MySQL Change 数据库',
    format: ({ user, db_service, schema_name }) =>
      `用户 [${user}] has changed default database to [${schema_name}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_CREATE_DB]: {
    type: 'db.session.mysql.create_db',
    desc: 'MySQL Create 数据库',
    format: ({ user, db_service, schema_name }) =>
      `用户 [${user}] has created database [${schema_name}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_DROP_DB]: {
    type: 'db.session.mysql.drop_db',
    desc: 'MySQL Drop 数据库',
    format: ({ user, db_service, schema_name }) =>
      `用户 [${user}] has dropped database [${schema_name}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_SHUT_DOWN]: {
    type: 'db.session.mysql.shut_down',
    desc: 'MySQL Shut Down',
    format: ({ user, db_service }) =>
      `用户 [${user}] has attempted to shut down [${db_service}]`,
  },
  [eventCodes.MYSQL_PROCESS_KILL]: {
    type: 'db.session.mysql.process_kill',
    desc: 'MySQL Kill Process',
    format: ({ user, db_service, process_id }) =>
      `用户 [${user}] has attempted to kill process [${process_id}] on [${db_service}]`,
  },
  [eventCodes.MYSQL_DEBUG]: {
    type: 'db.session.mysql.debug',
    desc: 'MySQL Debug',
    format: ({ user, db_service }) =>
      `用户 [${user}] has asked [${db_service}] to dump debug information`,
  },
  [eventCodes.MYSQL_REFRESH]: {
    type: 'db.session.mysql.refresh',
    desc: 'MySQL Refresh',
    format: ({ user, db_service, subcommand }) =>
      `用户 [${user}] has sent command [${subcommand}] to [${db_service}]`,
  },
  [eventCodes.SQLSERVER_RPC_REQUEST]: {
    type: 'db.session.sqlserver.rpc_request',
    desc: 'SQLServer RPC Request',
    format: ({ user, db_service, db_name, proc_name }) =>
      `用户 [${user}] has sent RPC Request [${proc_name}] in database [${db_name}] on [${db_service}]`,
  },
  [eventCodes.CASSANDRA_BATCH_EVENT]: {
    type: 'db.session.cassandra.batch',
    desc: 'Cassandra Batch',
    format: ({ user, db_service }) =>
      `用户 [${user}] has sent Cassandra Batch to [${db_service}]`,
  },
  [eventCodes.CASSANDRA_PREPARE_EVENT]: {
    type: 'db.session.cassandra.prepare',
    desc: 'Cassandra Prepare Event',
    format: ({ user, db_service, query }) =>
      `用户 [${user}] has sent Cassandra Prepare [${truncateStr(
        query,
        80
      )}] to [${db_service}]`,
  },
  [eventCodes.CASSANDRA_EXECUTE_EVENT]: {
    type: 'db.session.cassandra.execute',
    desc: 'Cassandra Execute',
    format: ({ user, db_service }) =>
      `用户 [${user}] has sent Cassandra Execute to [${db_service}]`,
  },
  [eventCodes.CASSANDRA_REGISTER_EVENT]: {
    type: 'db.session.cassandra.register',
    desc: 'Cassandra Register',
    format: ({ user, db_service }) =>
      `用户 [${user}] has sent Cassandra Register to [${db_service}]`,
  },
  [eventCodes.ELASTICSEARCH_REQUEST]: {
    type: 'db.session.elasticsearch.request',
    desc: 'Elasticsearch Request',
    format: ({ user, db_service, category, target, query, path }) => {
      // local redefinition of enum ElasticsearchCategory from events.proto
      enum ElasticsearchCategory {
        GENERAL = 0,
        SECURITY = 1,
        SEARCH = 2,
        SQL = 3,
      }

      let categoryString = 'UNKNOWN';
      switch (category) {
        case ElasticsearchCategory.GENERAL:
          categoryString = 'GENERAL';
          break;
        case ElasticsearchCategory.SEARCH:
          categoryString = 'SEARCH';
          break;
        case ElasticsearchCategory.SECURITY:
          categoryString = 'SECURITY';
          break;
        case ElasticsearchCategory.SQL:
          categoryString = 'SQL';
          break;
      }

      let message = `用户 [${user}] has ran a [${categoryString}] query in [${db_service}], request path: [${path}]`;

      if (query) {
        message += `, query string: [${truncateStr(query, 80)}]`;
      }

      if (target) {
        message += `, target: [${target}]`;
      }

      return message;
    },
  },
  [eventCodes.DYNAMODB_REQUEST]: {
    type: 'db.session.dynamodb.request',
    desc: 'DynamoDB Request',
    format: ({ user, db_service, target }) => {
      let message = `用户 [${user}] has made a request to database [${db_service}]`;
      if (target) {
        message += `, target API: [${target}]`;
      }
      return message;
    },
  },
  [eventCodes.DYNAMODB_REQUEST_FAILURE]: {
    type: 'db.session.dynamodb.request',
    desc: 'DynamoDB Request Failed',
    format: ({ user, db_service, target }) => {
      let message = `用户 [${user}] 失败 to make a request to database  [${db_service}]`;
      if (target) {
        message += `, target API: [${target}]`;
      }
      return message;
    },
  },
  [eventCodes.MFA_DEVICE_ADD]: {
    type: 'mfa.add',
    desc: 'MFA 设备 添加',
    format: ({ user, mfa_device_name, mfa_device_type }) =>
      `用户 [${user}] 添加 ${mfa_device_type} 设备 [${mfa_device_name}]`,
  },
  [eventCodes.MFA_DEVICE_DELETE]: {
    type: 'mfa.delete',
    desc: 'MFA 设备 删除',
    format: ({ user, mfa_device_name, mfa_device_type }) =>
      `用户 [${user}] 删除 ${mfa_device_type} 设备 [${mfa_device_name}]`,
  },
  [eventCodes.BILLING_CARD_CREATE]: {
    type: 'billing.create_card',
    desc: 'Credit Card 添加',
    format: ({ user }) => `用户 [${user}] 添加了一张信用卡`,
  },
  [eventCodes.BILLING_CARD_DELETE]: {
    type: 'billing.delete_card',
    desc: 'Credit Card 删除',
    format: ({ user }) => `用户 [${user}] 删除了一张信用卡`,
  },
  [eventCodes.BILLING_CARD_UPDATE]: {
    type: 'billing.update_card',
    desc: 'Credit Card 更新',
    format: ({ user }) => `用户 [${user}] 更新了一张信用卡`,
  },
  [eventCodes.BILLING_INFORMATION_UPDATE]: {
    type: 'billing.update_info',
    desc: 'Billing Information Updated',
    format: ({ user }) => `用户 [${user}] 有更新 帐单信息`,
  },
  [eventCodes.LOCK_CREATED]: {
    type: 'lock.created',
    desc: '锁创建',
    format: ({ user, name }) => `锁 [${name}] 是由用户 [${user}]创建的`,
  },
  [eventCodes.LOCK_DELETED]: {
    type: 'lock.deleted',
    desc: '锁删除',
    format: ({ user, name }) => `锁 [${name}] 是由用户[${user}]删除的`,
  },
  [eventCodes.PRIVILEGE_TOKEN_CREATED]: {
    type: 'privilege_token.create',
    desc: '特权令牌创建',
    format: ({ name }) => `已为用户创建特权令牌 [${name}]`,
  },
  [eventCodes.RECOVERY_TOKEN_CREATED]: {
    type: 'recovery_token.create',
    desc: '恢复令牌创建',
    format: ({ name }) => `已为用户创建恢复令牌 [${name}]`,
  },
  [eventCodes.RECOVERY_CODE_GENERATED]: {
    type: 'recovery_code.generated',
    desc: '恢复代码生成d',
    format: ({ user }) =>
      `为用户生成了新的恢复代码 [${user}]`,
  },
  [eventCodes.RECOVERY_CODE_USED]: {
    type: 'recovery_code.used',
    desc: '使用的恢复代码',
    format: ({ user }) => `用户 [${user}]成功使用了恢复代码`,
  },
  [eventCodes.RECOVERY_CODE_USED_FAILURE]: {
    type: 'recovery_code.used',
    desc: '恢复代码使用失败',
    format: ({ user }) =>
      `用户 [${user}] 失败 尝试使用恢复代码`,
  },
  [eventCodes.DESKTOP_SESSION_STARTED]: {
    type: 'windows.desktop.session.start',
    desc: 'Windows主机会话已启动',
    format: ({ user, windows_domain, desktop_addr, windows_user }) =>
      `用户 [${user}]已连接到Windows主机 [${windows_user}@${desktop_addr}] on [${windows_domain}]`,
  },
  [eventCodes.DESKTOP_SESSION_STARTED_FAILED]: {
    type: 'windows.desktop.session.start',
    desc: 'Windows主机会话被拒绝',
    format: ({ user, windows_domain, desktop_addr, windows_user }) =>
      `用户 [${user}] 被拒绝访问Windows主机 [${windows_user}@${desktop_addr}] on [${windows_domain}]`,
  },
  [eventCodes.DESKTOP_SESSION_ENDED]: {
    type: 'windows.desktop.session.end',
    desc: 'Windows主机会话结束',
    format: ({ user, windows_domain, desktop_addr, windows_user }) =>
      ` Windows主机的会话 [${windows_user}@${desktop_addr}] 在 [${windows_domain}]已为用户结束 [${user}]`,
  },
  [eventCodes.DESKTOP_CLIPBOARD_RECEIVE]: {
    type: 'desktop.clipboard.receive',
    desc: '已接收剪贴板数据',
    format: ({ user, desktop_addr, length }) =>
      `用户 [${user}] 接收 ${length}来自windows主机的剪贴板数据字节数 [${desktop_addr}]`,
  },
  [eventCodes.DESKTOP_CLIPBOARD_SEND]: {
    type: 'desktop.clipboard.send',
    desc: '剪贴板数据已发送',
    format: ({ user, desktop_addr, length }) =>
      `用户 [${user}] 发送 ${length}剪贴板数据到windows主机字节数 [${desktop_addr}]`,
  },
  [eventCodes.DESKTOP_SHARED_DIRECTORY_START]: {
    type: 'desktop.directory.share',
    desc: '目录共享已启动',
    format: ({ user, desktop_addr, directory_name }) =>
      `用户 [${user}] 已启动共享目录[${directory_name}] 在windows主机 [${desktop_addr}]`,
  },
  [eventCodes.DESKTOP_SHARED_DIRECTORY_START_FAILURE]: {
    type: 'desktop.directory.share',
    desc: '目录共享启动失败',
    format: ({ user, desktop_addr, directory_name }) =>
      `用户 [${user}] 开始共享目录失败 [${directory_name}]  在windows主机 [${desktop_addr}]`,
  },
  [eventCodes.DESKTOP_SHARED_DIRECTORY_READ]: {
    type: 'desktop.directory.read',
    desc: '目录共享读取',
    format: ({ user, desktop_addr, directory_name, file_path, length }) =>
      `用户 [${user}] 读取 [${length}] 文件中的字节 [${file_path}] 目录共享 [${directory_name}] 在windows主机 [${desktop_addr}]`,
  },
  [eventCodes.DESKTOP_SHARED_DIRECTORY_READ_FAILURE]: {
    type: 'desktop.directory.read',
    desc: '目录共享读取失败',
    format: ({ user, desktop_addr, directory_name, file_path, length }) =>
      `用户 [${user}] 读取失败 [${length}] 文件中的字节 [${file_path}] 目录共享 [${directory_name}] 在windows主机 [${desktop_addr}]`,
  },
  [eventCodes.DESKTOP_SHARED_DIRECTORY_WRITE]: {
    type: 'desktop.directory.write',
    desc: '目录共享写入',
    format: ({ user, desktop_addr, directory_name, file_path, length }) =>
      `用户 [${user}] 写入 [${length}] 文件中的字节 [${file_path}] 目录共享 [${directory_name}] 在windows主机 [${desktop_addr}]`,
  },
  [eventCodes.DESKTOP_SHARED_DIRECTORY_WRITE_FAILURE]: {
    type: 'desktop.directory.write',
    desc: '目录共享写入失败',
    format: ({ user, desktop_addr, directory_name, file_path, length }) =>
      `用户 [${user}] 写入失败 [${length}] 文件中的字节 [${file_path}] 目录共享 [${directory_name}] 在windows主机 [${desktop_addr}]`,
  },
  [eventCodes.DEVICE_CREATE]: {
    type: 'device',
    desc: '设备 注册',
    format: ({ user, status }) =>
      status.success
        ? `用户 [${user.user}] 已注册设备`
        : `用户 [${user.user}] 注册设备失败`,
  },
  [eventCodes.DEVICE_DELETE]: {
    type: 'device',
    desc: '设备 删除',
    format: ({ user, status }) =>
      status.success
        ? `用户 [${user.user}] 已删除设备`
        : `用户 [${user.user}] 删除设备失败`,
  },
  [eventCodes.DEVICE_AUTHENTICATE]: {
    type: 'device',
    desc: '设备 认证',
    format: ({ user, status }) =>
      status.success
        ? `用户 [${user.user}] 已成功验证其设备`
        : `用户 [${user.user}] 已失败验证他们的设备`,
  },
  [eventCodes.DEVICE_ENROLL]: {
    type: 'device',
    desc: '设备 注册',
    format: ({ user, status }) =>
      status.success
        ? `用户 [${user.user}] 已成功注册他们的设备`
        : `用户 [${user.user}] 注册他们的设备失败`,
  },
  [eventCodes.DEVICE_ENROLL_TOKEN_CREATE]: {
    type: 'device',
    desc: '设备 Enroll Token Create',
    format: ({ user, status }) =>
      status.success
        ? `用户 [${user.user}] created a device enroll token`
        : `用户 [${user.user}] has 失败 to create a device enroll token`,
  },
  [eventCodes.DEVICE_ENROLL_TOKEN_SPENT]: {
    type: 'device',
    desc: '设备 Enroll Token Spent',
    format: ({ user, status }) =>
      status.success
        ? `用户 [${user.user}] has spent a device enroll token`
        : `用户 [${user.user}] has 失败 to spend a device enroll token`,
  },
  [eventCodes.X11_FORWARD]: {
    type: 'x11-forward',
    desc: 'X11 Forwarding Requested',
    format: ({ user }) =>
      `用户 [${user}] has requested x11 forwarding for a session`,
  },
  [eventCodes.X11_FORWARD_FAILURE]: {
    type: 'x11-forward',
    desc: 'X11 Forwarding Request Failed',
    format: ({ user }) =>
      `用户 [${user}] was denied x11 forwarding for a session`,
  },
  [eventCodes.SESSION_CONNECT]: {
    type: 'session.connect',
    desc: 'Session Connected',
    format: ({ server_addr }) => `Session connected to [${server_addr}]`,
  },
  [eventCodes.CERTIFICATE_CREATED]: {
    type: 'cert.create',
    desc: '颁发的证书',
    format: ({ cert_type, identity: { user } }) => {
      if (cert_type === 'user') {
        return `颁发的用户证书 [${user}]`;
      }
      return `证书型式[${cert_type}] 为发布 [${user}]`;
    },
  },
  [eventCodes.UPGRADE_WINDOW_UPDATED]: {
    type: 'upgradewindow.update',
    desc: '升级窗口开始更新',
    format: ({ user, upgrade_window_start }) => {
      return `升级窗口开始更新为 [${upgrade_window_start}] 按用户 [${user}]`;
    },
  },
  [eventCodes.SESSION_RECORDING_ACCESS]: {
    type: 'session.recording.access',
    desc: 'Session Recording Accessed',
    format: ({ sid, user }) => {
      return `用户 [${user}] 访问了会话录制 [${sid}]`;
    },
  },
  [eventCodes.SSMRUN_SUCCESS]: {
    type: 'ssm.run',
    desc: 'SSM Command Executed',
    format: ({ account_id, instance_id, region, command_id }) => {
      return `SSM Command with ID [${command_id}] was successfully executed on EC2 Instance [${instance_id}] on AWS Account [${account_id}] in [${region}]`;
    },
  },
  [eventCodes.SSMRUN_FAIL]: {
    type: 'ssm.run',
    desc: 'SSM Command Execution Failed',
    format: ({ account_id, instance_id, region, command_id }) => {
      return `SSM Command with ID [${command_id}] 失败 during execution on EC2 Instance [${instance_id}] on AWS Account [${account_id}] in [${region}]`;
    },
  },
  [eventCodes.BOT_JOIN]: {
    type: 'bot.join',
    desc: 'Bot Joined',
    format: ({ bot_name, method }) => {
      return `Bot [${bot_name}] joined the cluster using the [${method}] join method`;
    },
  },
  [eventCodes.INSTANCE_JOIN]: {
    type: 'instance.join',
    desc: 'Instance Joined',
    format: ({ node_name, role, method }) => {
      return `实例 [${node_name}] 加入集群[${role}] 角色使用 [${method}]加入方法`;
    },
  },
  [eventCodes.LOGIN_RULE_CREATE]: {
    type: 'login_rule.create',
    desc: '登录角色创建',
    format: ({ user, name }) => `用户 [${user}] 创建登录角色[${name}]`,
  },
  [eventCodes.LOGIN_RULE_DELETE]: {
    type: 'login_rule.delete',
    desc: '登录角色删除',
    format: ({ user, name }) => `用户 [${user}] 删除登录角色 [${name}]`,
  },
  [eventCodes.SAML_IDP_AUTH_ATTEMPT]: {
    type: 'saml.idp.auth',
    desc: 'SAML IdP 认证',
    format: ({
      user,
      success,
      service_provider_entity_id,
      service_provider_shortcut,
    }) => {
      const desc =
        success === false
          ? '认证失败'
          : '认证成功';
      const id = service_provider_entity_id
        ? `[${service_provider_entity_id}]`
        : `[${service_provider_shortcut}]`;
      return `用户 [${user}] ${desc} t至 SAML 服务供应商 ${id}`;
    },
  },
  [eventCodes.SAML_IDP_SERVICE_PROVIDER_CREATE]: {
    type: 'saml.idp.service.provider.create',
    desc: 'SAML IdP 已创建服务提供商',
    format: ({ updated_by, name, service_provider_entity_id }) =>
      `用户 [${updated_by}] added 服务供应商 [${name}]具有实体ID [${service_provider_entity_id}]`,
  },
  [eventCodes.SAML_IDP_SERVICE_PROVIDER_CREATE_FAILURE]: {
    type: 'saml.idp.service.provider.create',
    desc: 'SAML IdP 创建服务提供商 失败',
    format: ({ updated_by, name, service_provider_entity_id }) =>
      `用户 [${updated_by}] 失败创建服务供应商 [${name}]具有实体ID [${service_provider_entity_id}]`,
  },
  [eventCodes.SAML_IDP_SERVICE_PROVIDER_UPDATE]: {
    type: 'saml.idp.service.provider.update',
    desc: 'SAML IdP 服务提供商更新',
    format: ({ updated_by, name, service_provider_entity_id }) =>
      `用户 [${updated_by}] 更新服务供应商 [${name}]具有实体ID [${service_provider_entity_id}]`,
  },
  [eventCodes.SAML_IDP_SERVICE_PROVIDER_UPDATE_FAILURE]: {
    type: 'saml.idp.service.provider.update',
    desc: 'SAML IdP 服务提供商已更新失败',
    format: ({ updated_by, name, service_provider_entity_id }) =>
      `用户 [${updated_by}] 失败更新服务供应商 [${name}]具有实体ID [${service_provider_entity_id}]`,
  },
  [eventCodes.SAML_IDP_SERVICE_PROVIDER_DELETE]: {
    type: 'saml.idp.service.provider.delete',
    desc: 'SAML IdP 服务提供商已删除',
    format: ({ updated_by, name, service_provider_entity_id }) =>
      `用户 [${updated_by}] 删除 服务供应商 [${name}]具有实体ID [${service_provider_entity_id}]`,
  },
  [eventCodes.SAML_IDP_SERVICE_PROVIDER_DELETE_FAILURE]: {
    type: 'saml.idp.service.provider.delete',
    desc: 'SAML IdP 服务提供商删除失败',
    format: ({ updated_by, name, service_provider_entity_id }) =>
      `用户 [${updated_by}] 失败删除服务供应商 [${name}]具有实体ID [${service_provider_entity_id}]`,
  },
  [eventCodes.SAML_IDP_SERVICE_PROVIDER_DELETE_ALL]: {
    type: 'saml.idp.service.provider.delete_all',
    desc: 'All SAML IdP 服务提供商已删除',
    format: ({ updated_by }) =>
      `用户 [${updated_by}] 删除所有服务供应商`,
  },
  [eventCodes.SAML_IDP_SERVICE_PROVIDER_DELETE_ALL_FAILURE]: {
    type: 'saml.idp.service.provider.delete',
    desc: 'SAML IdP 服务提供商删除失败',
    format: ({ updated_by }) =>
      `用户 [${updated_by}] 失败删除所有服务供应商`,
  },
  [eventCodes.UNKNOWN]: {
    type: '未知',
    desc: '未知 事件',
    format: ({ unknown_type, unknown_code }) =>
      `未知 '${unknown_type}' 事件 (${unknown_code})`,
  },
};

const unknownFormatter = {
  desc: '未知',
  format: () => '未知',
};

export default function makeEvent(json: any): Event {
  // lookup event formatter by code
  const formatter = formatters[json.code] || unknownFormatter;
  const event = {
    codeDesc: formatter.desc,
    message: formatter.format(json as any),
    id: getId(json),
    code: json.code,
    user: json.user,
    time: json.time,
    raw: json,
  };

  return event;
}

// older events might not have an uid field.
// in this case compose it from other fields.
function getId(json: RawEvent<any>) {
  const { uid, event, time } = json;
  if (uid) {
    return uid;
  }

  return `${event}:${time}`;
}

function truncateStr(str: string, len: number): string {
  if (str.length <= len) {
    return str;
  }
  return str.substring(0, len - 3) + '...';
}
