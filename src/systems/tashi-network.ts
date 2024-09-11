import { Entity, EntitySnapshot, IterativeSystem } from "tick-knock";
import mqtt from "mqtt";
import { createDot, DOT, FINALIZED } from "../entities/dot.ts";
import { Position } from "../components/position.ts";
import { Color } from "../components/color.ts";

// const foxMqEndpoints = [
//   [
//     import.meta.env.VITE_FOXMQ_HOSTNAME_1,
//     import.meta.env.VITE_FOXMQ_USERNAME_1,
//     import.meta.env.VITE_FOXMQ_PASSWORD_1,
//   ],
// ];

type TashiNetworkEvent = {
  event: "dot";
  dot: {
    x: number;
    y: number;
    color: number;
  };
};

const envPrefix = "VITE_FOXMQ_";

export class TashiNetworkSystem extends IterativeSystem {
  private readonly availableEndpoints: mqtt.IClientOptions[] = [];
  private clientPromise: Promise<mqtt.MqttClient>;

  constructor() {
    super((entity) => {
      // we accept dot-tagged entities that have both a position and color and are NOT tagged as finalized
      return !entity.hasTag(FINALIZED) && entity.hasAll(Position, Color, DOT);
    });

    // discover endpoints from .env
    for (let i = 1; ; i++) {
      const hostname = import.meta.env[`${envPrefix}HOSTNAME_${i}`];
      const username = import.meta.env[`${envPrefix}USERNAME_${i}`];
      const password = import.meta.env[`${envPrefix}PASSWORD_${i}`];

      if (hostname == null || username == null || password == null) break;

      this.availableEndpoints.push({
        hostname,
        username,
        password,
      });
    }

    // randomly pick an endpoint
    const endpointIndex = Math.floor(
      Math.random() * (this.availableEndpoints.length - 1),
    );

    const endpoint = this.availableEndpoints[endpointIndex];
    if (endpoint == null) {
      throw new Error(
        "failed to find an available FoxMQ endpoint to connect, check envrionment configuration",
      );
    }

    // connect to FoxMQ
    this.clientPromise = (async () => {
      const client = await mqtt.connectAsync(endpoint);
      await client.subscribeAsync("place");
      client.on("message", this.onMessage.bind(this));

      return client;
    })();
  }

  protected updateEntity(_entity: Entity) {
    // no action needed
  }

  protected override entityAdded = ({ current }: EntitySnapshot) => {
    // an unfinalized dot was added to our local system, broadcast
    const { x, y } = current.get(Position)!;
    const { color } = current.get(Color)!;

    this.clientPromise.then((client) =>
      client.publish(
        "place",
        JSON.stringify({
          event: "dot",
          dot: {
            x,
            y,
            color,
          },
        } satisfies TashiNetworkEvent),
      ),
    );

    // drop the unfinalized dot from the world
    this.engine.removeEntity(current);
  };

  protected override entityRemoved = (snapshot: EntitySnapshot) => {
    // no action needed
  };

  private onMessage(topic: string, message: Buffer) {
    if (topic === "place") {
      const payload = JSON.parse(message.toString("utf8")) as TashiNetworkEvent;

      switch (payload.event) {
        case "dot": {
          // add a new dot
          createDot(this.engine, {
            ...payload.dot,
            finalized: true,
          });

          break;
        }
      }
    }
  }
}
