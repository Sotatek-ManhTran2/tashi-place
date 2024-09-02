import mqtt from "mqtt";

export async function connectFoxMQ(options: {
  // TODO: support receiving multiple of these endpoints
  //  and then picking one somehow, maybe at random
  endpoint: {
    hostname?: string;
    username?: string;
    password?: string;
  };
}) {
  const client = await mqtt.connectAsync({
    hostname: options.endpoint.hostname,
    username: options.endpoint.username,
    password: options.endpoint.password,
  });

  console.debug("Connected to FoxMQ");

  return client;
}
