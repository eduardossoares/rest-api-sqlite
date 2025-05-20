import fastify from "fastify";

const PORT = 3333;
const app = fastify();

app.get("/", () => {
  return "Hello World";
});

app
  .listen({
    port: PORT,
  })
  .then(() => {
    console.log("Server running on port", PORT);
  });

export { app };
