/**
 * This file is in charge of building a controller (or set of controllers made up)
 * of the baseline logic you designed on your chaincode project, but replacing the logic
 * with your own for NodeJS. We inject here the `convector-adapter-fabric` which calls
 * the blockchain based on your own configuration.
 */

/** The client is the component in charge of bringing the "interface" of your business
 * logic right from the chaincode project.
 * Implementation will depend on this layer. In this case, what we want to do at this layer
 * is to call the backend peers.
 */
import { resolve } from 'path';
import { FabricControllerAdapter } from '@worldsibu/convector-adapter-fabric';
import { DrugController } from '@worldsibu/convector-example-dsc-cc-drug';
import { TransportController } from '@worldsibu/convector-example-dsc-cc-transport';
import { ParticipantController, Participant } from '@worldsibu/convector-example-dsc-cc-participant';
import { SelfGenContext } from './selfGenContext';
import { ModelHelpers } from './convectorModels';
import { ConvectorControllerClient, ClientFactory } from '@worldsibu/convector-core';
import { keyStore, networkProfile } from './env';

const user = process.env.USERCERT || 'user1';
const org = process.env.ORGCERT || 'org1';

async function InitFabricAdapter() {
  await SelfGenContext.getClient();

  const adapter = new FabricControllerAdapter({
    txTimeout: 300000,
    user: user,
    // set it later to enable Mutual TLS
    channel: process.env.CHANNEL,
    chaincode: process.env.CHAINCODE,
    keyStore: resolve(__dirname, keyStore),
    networkProfile: resolve(__dirname, networkProfile),
    userMspPath: process.env.KEYSTORE
  });

  await adapter.init();
  return adapter;
}
/**
 * Building this adapter allows you to communicate with the
 * test env created by `hurley`.
 */
export async function InitDrugController(): Promise<ConvectorControllerClient<DrugController>> {
  return ClientFactory(DrugController, await InitFabricAdapter());
}
export async function InitTransportController(): Promise<ConvectorControllerClient<TransportController>> {
  return ClientFactory(TransportController, await InitFabricAdapter());
}
export async function InitParticipantController(): Promise<ConvectorControllerClient<ParticipantController>> {
  return ClientFactory(ParticipantController, await InitFabricAdapter());
}
export async function InitServerIdentity() {
  const users = await ModelHelpers.getAllParticipants();
  if (!users.find(u => u.id === user && u.msp === `${org}MSP`)) {
    console.log('Need to register server identity');
    (await InitParticipantController()).register(user);
    console.log('Server identity registered');
  } else {
    console.log('Server identity found');
  }
}
