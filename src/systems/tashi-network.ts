import { Entity, EntitySnapshot, IterativeSystem } from "tick-knock";
import mqtt from "mqtt";
import { createDot, DOT, FINALIZED } from "../entities/dot.ts";
import { Position } from "../components/position.ts";
import { Color } from "../components/color.ts";
import * as uuid from "uuid";

// const foxMqEndpoints = [
//   [
//     import.meta.env.VITE_FOXMQ_HOSTNAME_1,
//     import.meta.env.VITE_FOXMQ_USERNAME_1,
//     import.meta.env.VITE_FOXMQ_PASSWORD_1,
//   ],
// ];

type TashiNetworkEvent =
  | {
      event: "dot";
      dot: {
        x: number;
        y: number;
        color: number;
      };
    }
  | {
      event: "welcome";
      clientId: string;
    }
  | {
      event: "world";
      clientId: string;
      dots: { x: number; y: number; color: number }[];
    };

const envPrefix = "VITE_FOXMQ_";

export class TashiNetworkSystem extends IterativeSystem {
  private readonly availableEndpoints: mqtt.IClientOptions[] = [];
  private clientPromise: Promise<mqtt.MqttClient>;
  private welcomed = false;
  private readonly clientId = uuid.v4();

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
      client.on("message", this.onMessage.bind(this, client));

      // publish a welcome message
      client.publish(
        "place",
        JSON.stringify({ event: "welcome", clientId: this.clientId }),
      );

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

  private onMessage(client: mqtt.MqttClient, topic: string, message: Buffer) {
    if (topic === "place") {
      const payload = JSON.parse(message.toString("utf8")) as TashiNetworkEvent;

      switch (payload.event) {
        case "welcome": {
          if (this.clientId === payload.clientId) return;

          // hey there is a new client
          // send our world
          const world = this.engine.entities
            .filter((entity) => entity.hasAll(FINALIZED, DOT, Color, Position))
            .map((entity) => {
              const { x, y } = entity.get(Position)!;
              const { color } = entity.get(Color)!;

              return { x, y, color };
            });

          console.log("send", world.length);

          client.publish(
            "place",
            JSON.stringify({
              event: "world",
              dots: world,
              clientId: this.clientId,
            } satisfies TashiNetworkEvent),
          );

          break;
        }

        case "world": {
          if (this.clientId === payload.clientId) return;
          if (this.welcomed) return;
          this.welcomed = true;
          console.log("world!");

          for (const dot of payload.dots) {
            createDot(this.engine, {
              ...dot,
              finalized: true,
            });
          }

          break;
        }

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
