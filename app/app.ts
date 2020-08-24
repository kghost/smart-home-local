/**
 * Copyright 2019, Google LLC
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *   http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference types="@google/local-home-sdk" />

import {ControlKind} from '../common/discovery';
import {IColorAbsolute, ICustomData, IDiscoveryData} from './types';

import {DOMParser} from 'xmldom';
import cbor from 'cbor';

/* tslint:disable:no-var-requires */
// TODO(proppy): add typings
require('array.prototype.flatmap/auto');
/* tslint:enable:no-var-requires */

// HomeApp implements IDENTIFY and EXECUTE handler for smarthome local device
// execution.
export class HomeApp {
  constructor(private readonly app: smarthome.App) {
    this.app = app;
  }

  // identifyHandlers decode UDP scan data and structured device information.
  public identifyHandler = async(
      identifyRequest: smarthome.IntentFlow.IdentifyRequest):
      Promise<smarthome.IntentFlow.IdentifyResponse> => {
        console.log(
            `IDENTIFY request ${JSON.stringify(identifyRequest, null, 2)}`);
        // TODO(proppy): handle multiple inputs.
        const device = identifyRequest.inputs[0].payload.device;
        const identifyResponse: smarthome.IntentFlow.IdentifyResponse = {
          requestId: identifyRequest.requestId,
          intent: smarthome.Intents.IDENTIFY,
          payload: {
            device: {
              deviceInfo: {
                manufacturer: 'chip',
                model: 'virtual-chip',
                hwVersion: '',
                swVersion: ''
              },
              id: 'virtual-chip-device-id',
              verificationId: 'virtual-chip-device-id'
            },
          },
        };
        console.log(
            `IDENTIFY response ${JSON.stringify(identifyResponse, null, 2)}`);
        return identifyResponse;
      }

  public reachableDevicesHandler = async(
      reachableDevicesRequest: smarthome.IntentFlow.ReachableDevicesRequest):
      Promise<smarthome.IntentFlow.ReachableDevicesResponse> => {
        console.log(`REACHABLE_DEVICES request ${
            JSON.stringify(reachableDevicesRequest, null, 2)}`);

        const proxyDeviceId =
            reachableDevicesRequest.inputs[0].payload.device.id;
        const devices = reachableDevicesRequest.devices.flatMap((d) => {
          const customData = d.customData as ICustomData;
          if (customData.proxy === proxyDeviceId) {
            return [{verificationId: `${proxyDeviceId}-${customData.channel}`}];
          }
          return [];
        });
        const reachableDevicesResponse = {
          intent: smarthome.Intents.REACHABLE_DEVICES,
          requestId: reachableDevicesRequest.requestId,
          payload: {
            devices,
          },
        };
        console.log(`REACHABLE_DEVICES response ${
            JSON.stringify(reachableDevicesResponse, null, 2)}`);
        return reachableDevicesResponse;
      }

  // executeHandler send openpixelcontrol messages corresponding to light device
  // commands.
  public executeHandler = async(
      executeRequest: smarthome.IntentFlow.ExecuteRequest):
      Promise<smarthome.IntentFlow.ExecuteResponse> => {
        console.log(
            `EXECUTE request: ${JSON.stringify(executeRequest, null, 2)}`);
        const executeResponse =
            new smarthome.Execute.Response.Builder().setRequestId(
                executeRequest.requestId);
        //executeResponse.setSuccessState(result.deviceId, state);
        console.log(
            `EXECUTE response: ${JSON.stringify(executeResponse, null, 2)}`);
        // Return execution response to smarthome infrastructure.
        return executeResponse.build();
      }
}
