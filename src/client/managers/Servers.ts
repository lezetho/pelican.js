import { Collection } from "@discordjs/collection";
import PelicanClient from "../Client";
import { ServerBased, ServerCache } from "../types";
import BaseManagers from "./Base";
import { getRouter } from "../../util/Router";
import { ClientMethods } from "../methods";
import Server from "../util/formatter/Server";

export default class ServersManager
  extends BaseManagers
  implements ServerCache
{
  public cache = new Collection<string, ServerBased>();

  constructor(client: PelicanClient) {
    super(client);

    this._init();
    setInterval(() => this._init(), 1000 * 60 * 5);
  }

  private async _init() {
    const servers = (await this.client.router
      .GET(getRouter(ClientMethods.SERVERS))
      .then((res) =>
        res.data.data.map((server: any) => server.attributes)
      )) as ServerBased[];

    this.cache = new Collection(
      servers?.map((server: ServerBased) => [
        server.identifier,
        new Server(this.client, server),
      ])
    );
  }

  async fetch(identifier: string): Promise<ServerBased | undefined> {
    if (!identifier) throw new Error("Identifier is required");
    if (identifier.includes("-")) identifier = identifier.split("-")[0];

    const servers = (await this.client.router
      .GET(getRouter(ClientMethods.SERVERS))
      .then((res) =>
        res.data.data.map((server: any) => server.attributes)
      )) as ServerBased[];

    this.cache = new Collection(
      servers?.map((server: ServerBased) => [
        server.identifier,
        new Server(this.client, server),
      ])
    );

    return this.cache.find((server) => server.identifier === identifier);
  }
}
