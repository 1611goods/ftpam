/*
Copyright 2019-2021 Gravitational, Inc.

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

import {
  ActiveSessionsIcon,
  AddIcon,
  ApplicationsIcon,
  AuditLogIcon,
  AuthConnectorsIcon,
  DatabasesIcon,
  DesktopsIcon,
  KubernetesIcon,
  ManageClustersIcon,
  RolesIcon,
  ServersIcon,
  SessionRecordingsIcon,

  TrustedClustersIcon,
  UserSettingsIcon,
  UsersIcon,
} from 'design/SVGIcon';

import cfg from 'teleport/config';

import {
  ManagementSection,
  NavigationCategory,
} from 'teleport/Navigation/categories';

import type { TeleportFeature, FeatureFlags } from './types';

const Audit = React.lazy(
  () => import(/* webpackChunkName: "audit" */ './Audit')
);
const Nodes = React.lazy(
  () => import(/* webpackChunkName: "nodes" */ './Nodes')
);
const Sessions = React.lazy(
  () => import(/* webpackChunkName: "sessions" */ './Sessions')
);
const Account = React.lazy(
  () => import(/* webpackChunkName: "account" */ './Account')
);
const Applications = React.lazy(
  () => import(/* webpackChunkName: "apps" */ './Apps')
);
const Kubes = React.lazy(
  () => import(/* webpackChunkName: "kubes" */ './Kubes')
);

const Clusters = React.lazy(
  () => import(/* webpackChunkName: "clusters" */ './Clusters')
);
const Trust = React.lazy(
  () => import(/* webpackChunkName: "trusted-clusters" */ './TrustedClusters')
);
const Users = React.lazy(
  () => import(/* webpackChunkName: "users" */ './Users')
);
const Roles = React.lazy(
  () => import(/* webpackChunkName: "roles" */ './Roles')
);
// 资源
const LinuxHostsResource=React.lazy(
  () => import(/* webpackChunkName: "roles" */ './LinuxHostsResource')
);
//发现资源
const DiscoveringResources=React.lazy(
  () => import(/* webpackChunkName: "roles" */ './DiscoveringResources')
);
const Recordings = React.lazy(
  () => import(/* webpackChunkName: "recordings" */ './Recordings')
);
const AuthConnectors = React.lazy(
  () => import(/* webpackChunkName: "auth-connectors" */ './AuthConnectors')
);
const Databases = React.lazy(
  () => import(/* webpackChunkName: "databases" */ './Databases')
);
const Desktops = React.lazy(
  () => import(/* webpackChunkName: "desktop" */ './Desktops')
);
const Discover = React.lazy(
  () => import(/* webpackChunkName: "discover" */ './Discover')
);

// ****************************
// Resource Features
// ****************************

export class FeatureNodes implements TeleportFeature {
  route = {
    title: 'Linux主机',
    path: cfg.routes.nodes,
    exact: true,
    component: Nodes,
  };

  navigationItem = {
    title: 'Linux主机',
    icon: <ServersIcon />,
    exact: true,
    getLink(clusterId: string) {
      return cfg.getNodesRoute(clusterId);
    },
  };

  category = NavigationCategory.Resources;

  hasAccess(flags: FeatureFlags) {
    return flags.nodes;
  }
}


export class FeatureDesktops implements TeleportFeature {
  category = NavigationCategory.Resources;

  route = {
    title: 'Windows主机',
    path: cfg.routes.desktops,
    exact: true,
    component: Desktops,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.desktops;
  }

  navigationItem = {
    title: 'Windows主机',
    icon: <DesktopsIcon />,
    exact: true,
    getLink(clusterId: string) {
      return cfg.getDesktopsRoute(clusterId);
    },
  };
}



export class FeatureApps implements TeleportFeature {
  category = NavigationCategory.Resources;

  route = {
    title: '应用',
    path: cfg.routes.apps,
    exact: true,
    component: Applications,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.applications;
  }

  navigationItem = {
    title: '应用',
    icon: <ApplicationsIcon />,
    exact: true,
    getLink(clusterId: string) {
      return cfg.getAppsRoute(clusterId);
    },
  };
}

export class FeatureKubes implements TeleportFeature {
  category = NavigationCategory.Resources;

  route = {
    title: 'kubernetes',
    path: cfg.routes.kubernetes,
    exact: true,
    component: Kubes,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.kubernetes;
  }

  navigationItem = {
    title: 'Kubernetes',
    icon: <KubernetesIcon />,
    exact: true,
    getLink(clusterId: string) {
      return cfg.getKubernetesRoute(clusterId);
    },
  };
}

export class FeatureDatabases implements TeleportFeature {
  category = NavigationCategory.Resources;

  route = {
    title: '数据库',
    path: cfg.routes.databases,
    exact: true,
    component: Databases,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.databases;
  }

  navigationItem = {
    title: '数据库',
    icon: <DatabasesIcon />,
    exact: true,
    getLink(clusterId: string) {
      return cfg.getDatabasesRoute(clusterId);
    },
  };
}

export class FeatureSessions implements TeleportFeature {
  category = NavigationCategory.Resources;

  route = {
    title: '活动会话',
    path: cfg.routes.sessions,
    exact: true,
    component: Sessions,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.activeSessions;
  }

  navigationItem = {
    title: '活动会话',
    icon: <ActiveSessionsIcon />,
    exact: true,
    getLink(clusterId: string) {
      return cfg.getSessionsRoute(clusterId);
    },
  };
}

// ****************************
// Management Features
// ****************************

// - Access

export class FeatureUsers implements TeleportFeature {
  category = NavigationCategory.Management;
  section = ManagementSection.Access;

  route = {
    title: '管理用户',
    path: cfg.routes.users,
    exact: true,
    component: Users,
  };

  hasAccess(flags: FeatureFlags): boolean {
    return flags.users;
  }

  navigationItem = {
    title: '用户',
    icon: <UsersIcon />,
    exact: true,
    getLink() {
      return cfg.getUsersRoute();
    },
  };
}

export class FeatureResourceLocator implements TeleportFeature{
  route = {
    title: '主机资源',
    path: cfg.routes.hostsResource,
    exact: true,
    component: LinuxHostsResource,
  };
  hasAccess() {
    return true;
  }
}

export class FeatureDiscoveringResources implements TeleportFeature{
  route = {
    title: '发现资源',
    path: cfg.routes.discoveringResources,
    exact: true,
    component: DiscoveringResources,
  };
  hasAccess() {
    return true;
  }
}

export class FeatureRoles implements TeleportFeature {
  category = NavigationCategory.Management;
  section = ManagementSection.Access;

  route = {
    title: '管理角色',
    path: cfg.routes.roles,
    exact: true,
    component: Roles,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.roles;
  }

  navigationItem = {
    title: '角色',
    icon: <RolesIcon />,
    exact: true,
    getLink() {
      return cfg.routes.roles;
    },
  };
}

export class FeatureAuthConnectors implements TeleportFeature {
  category = NavigationCategory.Management;
  section = ManagementSection.Access;

  route = {
    title: '管理身份连接验证器',
    path: cfg.routes.sso,
    exact: false,
    component: AuthConnectors,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.authConnector;
  }

  navigationItem = {
    title: '身份连接验证器',
    icon: <AuthConnectorsIcon />,
    exact: false,
    getLink() {
      return cfg.routes.sso;
    },
  };
}

export class FeatureDiscover implements TeleportFeature {
  route = {
    title: '注册新资源',
    path: cfg.routes.discover,
    exact: true,
    component: Discover,
  };

  navigationItem = {
    title: '注册新资源',
    icon: <AddIcon />,
    exact: true,
    getLink() {
      return cfg.routes.discover;
    },
  };

  category = NavigationCategory.Management;
  section = ManagementSection.Access;

  hasAccess(flags: FeatureFlags) {
    return flags.discover;
  }
}

// - Activity

export class FeatureRecordings implements TeleportFeature {
  category = NavigationCategory.Management;
  section = ManagementSection.Activity;

  route = {
    title: '会话录制',
    path: cfg.routes.recordings,
    exact: true,
    component: Recordings,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.recordings;
  }

  navigationItem = {
    title: '会话录制',
    icon: <SessionRecordingsIcon />,
    exact: true,
    getLink(clusterId: string) {
      return cfg.getRecordingsRoute(clusterId);
    },
  };
}

export class FeatureAudit implements TeleportFeature {
  category = NavigationCategory.Management;
  section = ManagementSection.Activity;

  route = {
    title: '审核日志',
    path: cfg.routes.audit,
    component: Audit,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.audit;
  }

  navigationItem = {
    title: '审核日志',
    icon: <AuditLogIcon />,
    getLink(clusterId: string) {
      return cfg.getAuditRoute(clusterId);
    },
  };
}

// - Clusters

export class FeatureClusters implements TeleportFeature {
  category = NavigationCategory.Management;
  section = ManagementSection.Clusters;

  route = {
    title: '集群',
    path: cfg.routes.clusters,
    exact: false,
    component: Clusters,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.trustedClusters;
  }

  navigationItem = {
    title: '管理集群',
    icon: <ManageClustersIcon />,
    exact: false,
    getLink() {
      return cfg.routes.clusters;
    },
  };
}

export class FeatureTrust implements TeleportFeature {
  category = NavigationCategory.Management;
  section = ManagementSection.Clusters;

  route = {
    title: '受信任集群',
    path: cfg.routes.trustedClusters,
    component: Trust,
  };

  hasAccess(flags: FeatureFlags) {
    return flags.trustedClusters;
  }

  navigationItem = {
    title: '受信任集群',
    icon: <TrustedClustersIcon />,
    getLink() {
      return cfg.routes.trustedClusters;
    },
  };
}

// ****************************
// Other Features
// ****************************

export class FeatureAccount implements TeleportFeature {
  route = {
    title: '帐户设置',
    path: cfg.routes.account,
    component: Account,
  };

  hasAccess() {
    return true;
  }

  topMenuItem = {
    title: '帐户设置',
    icon: <UserSettingsIcon size={16} />,
    getLink() {
      return cfg.routes.account;
    },
  };
}

// export class FeatureHelpAndSupport implements TeleportFeature {
//   route = {
//     title: '帮助 & 支持',
//     path: cfg.routes.support,
//     exact: true,
//     component: Support,
//   };
//
//   hasAccess() {
//     return true;
//   }
//
//   topMenuItem = {
//     title: '帮助 & 支持',
//     icon: <SupportIcon size={16} />,
//     exact: true,
//     getLink() {
//       return cfg.routes.support;
//     },
//   };
// }

export function getOSSFeatures(): TeleportFeature[] {
  return [
    // Resources
    new FeatureNodes(),
    new FeatureDesktops(),
    new FeatureApps(),
    new FeatureKubes(),
    new FeatureDatabases(),
    new FeatureSessions(),

    // Management

    // - Access
    new FeatureUsers(),
    new FeatureRoles(),
    new FeatureAuthConnectors(),
    new FeatureDiscover(),
    // 资源
    new FeatureResourceLocator(),
    // 发现资源
    new FeatureDiscoveringResources(),
    // - Activity
    new FeatureRecordings(),
    new FeatureAudit(),

    // - Clusters
    new FeatureClusters(),
    new FeatureTrust(),

    // Other
    new FeatureAccount(),
    // new FeatureHelpAndSupport(),
  ];
}
