/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type { ProviderConnectionStatus, ProviderStatus } from '@tmpwip/extension-api';

type LifecycleMethod = 'start' | 'stop';

export interface ProviderContainerConnectionInfo {
  name: string;
  status: ProviderConnectionStatus;
  endpoint: {
    socketPath: string;
  };
  lifecycleMethods?: LifecycleMethod[];
}

export interface ProviderKubernetesConnectionInfo {
  name: string;
  status: ProviderConnectionStatus;
  endpoint: {
    apiURL: string;
  };
  lifecycleMethods?: LifecycleMethod[];
}

export interface ProviderInfo {
  id: string;
  name: string;
  containerConnections: ProviderContainerConnectionInfo[];
  kubernetesConnections: ProviderKubernetesConnectionInfo[];
  status: ProviderStatus;
  lifecycleMethods?: LifecycleMethod[];
}
