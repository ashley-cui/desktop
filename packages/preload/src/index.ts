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

/**
 * @module preload
 */

import { contextBridge } from 'electron';
import type { ContainerCreateOptions, ContainerInfo } from './api/container-info';
import type { ExtensionInfo } from './api/extension-info';
import { CommandRegistry } from './command-registry';
import { ContainerProviderRegistry } from './container-registry';
import { ExtensionLoader } from './extension-loader';
import EventEmitter from 'events';
import type { ImageInfo } from './api/image-info';
import type { ImageInspectInfo } from './api/image-inspect-info';
import type { ProviderInfo } from './api/provider-info';
import { TrayMenuRegistry } from './tray-menu-registry';
import { ProviderRegistry } from './provider-registry';
import type { Provider } from '@tmpwip/extension-api';
const shell = require('electron').shell;

// initialize extension loader mechanism
function initExtensions(): void {
  const eventEmitter = new EventEmitter();
  const apiSender = {
    send: (channel: string, data: string) => {
      eventEmitter.emit(channel, data);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (channel: string, func: any) => {
      eventEmitter.on(channel, data => {
        func(data);
      });
    },
  };

  contextBridge.exposeInMainWorld('events', apiSender);

  const commandRegistry = new CommandRegistry();
  const containerProviderRegistry = new ContainerProviderRegistry(apiSender);
  const providerRegistry = new ProviderRegistry(containerProviderRegistry);
  const trayMenuRegistry = new TrayMenuRegistry(commandRegistry, providerRegistry);

  providerRegistry.addProviderListener((name: string, provider: Provider) => {
    if (name === 'provider:update-status') {
      apiSender.send('provider:update-status', provider.name);
    }
  });

  contextBridge.exposeInMainWorld('listContainers', async (): Promise<ContainerInfo[]> => {
    return containerProviderRegistry.listContainers();
  });

  contextBridge.exposeInMainWorld('listImages', async (): Promise<ImageInfo[]> => {
    return containerProviderRegistry.listImages();
  });

  contextBridge.exposeInMainWorld('startContainer', async (engine: string, containerId: string): Promise<void> => {
    return containerProviderRegistry.startContainer(engine, containerId);
  });

  contextBridge.exposeInMainWorld('restartContainer', async (engine: string, containerId: string): Promise<void> => {
    return containerProviderRegistry.restartContainer(engine, containerId);
  });

  contextBridge.exposeInMainWorld(
    'createAndStartContainer',
    async (engine: string, options: ContainerCreateOptions): Promise<void> => {
      return containerProviderRegistry.createAndStartContainer(engine, options);
    },
  );

  contextBridge.exposeInMainWorld('stopContainer', async (engine: string, containerId: string): Promise<void> => {
    return containerProviderRegistry.stopContainer(engine, containerId);
  });

  contextBridge.exposeInMainWorld(
    'logsContainer',
    async (engine: string, containerId: string, callback: (name: string, data: string) => void): Promise<void> => {
      return containerProviderRegistry.logsContainer(engine, containerId, callback);
    },
  );

  contextBridge.exposeInMainWorld(
    'shellInContainer',
    async (engine: string, containerId: string, onData: (data: Buffer) => void): Promise<(param: string) => void> => {
      return containerProviderRegistry.shellInContainer(engine, containerId, onData);
    },
  );

  contextBridge.exposeInMainWorld('deleteContainer', async (engine: string, containerId: string): Promise<void> => {
    return containerProviderRegistry.deleteContainer(engine, containerId);
  });

  contextBridge.exposeInMainWorld('startProviderLifecycle', async (providerId: string): Promise<void> => {
    return providerRegistry.startProviderLifecycle(providerId);
  });

  contextBridge.exposeInMainWorld('stopProviderLifecycle', async (providerId: string): Promise<void> => {
    return providerRegistry.stopProviderLifecycle(providerId);
  });

  contextBridge.exposeInMainWorld(
    'buildImage',
    async (
      buildDirectory: string,
      imageName: string,
      eventCollect: (eventName: string, data: string) => void,
    ): Promise<unknown> => {
      return containerProviderRegistry.buildImage(buildDirectory, imageName, eventCollect);
    },
  );

  contextBridge.exposeInMainWorld(
    'getImageInspect',
    async (engine: string, imageId: string): Promise<ImageInspectInfo> => {
      return containerProviderRegistry.getImageInspect(engine, imageId);
    },
  );

  contextBridge.exposeInMainWorld('getProviderInfos', async (): Promise<ProviderInfo[]> => {
    return providerRegistry.getProviderInfos();
  });

  const extensionLoader = new ExtensionLoader(commandRegistry, providerRegistry, apiSender, trayMenuRegistry);
  contextBridge.exposeInMainWorld('listExtensions', async (): Promise<ExtensionInfo[]> => {
    return extensionLoader.listExtensions();
  });

  contextBridge.exposeInMainWorld('stopExtension', async (extensionId: string): Promise<void> => {
    return extensionLoader.deactivateExtension(extensionId);
  });
  contextBridge.exposeInMainWorld('startExtension', async (extensionId: string): Promise<void> => {
    return extensionLoader.startExtension(extensionId);
  });

  contextBridge.exposeInMainWorld('openExternal', (link: string): void => {
    shell.openExternal(link);
  });

  contextBridge.exposeInMainWorld('trayMenu', trayMenuRegistry);

  extensionLoader.start();
}

// start extensions
initExtensions();
