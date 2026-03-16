import { DurableObject } from "cloudflare:workers";

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */


/** A Durable Object's behavior is defined in an exported Javascript class */
export class ResearchAgent extends DurableObject {
	private messages: { role: string; content: string }[] = [];
	
	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 */
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	/**
	 * The Durable Object exposes an RPC method sayHello which will be invoked when a Durable
	 *  Object instance receives a request from a Worker via the same method invocation on the stub
	 *
	 * @param name - The name provided to a Durable Object instance from a Worker
	 * @returns The greeting to be sent back to the Worker
	 */
	async sayHello(name: string): Promise<string> {
		return `Hello, ${name}!`;
	}

	async chat(userMessage: string): Promise<string> {
    this.messages.push({ role: "user", content: userMessage }); //saves user msg on the list we declared previously

    const response = await (this.env as any).AI.run(//sends to the LLM for the response
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        { messages: this.messages }
    );

    this.messages.push({ role: "assistant", content: response.response });//saves the answer from the LLM on the list as an "assistant" message

    return response.response;
	}
}

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request, env, ctx): Promise<Response> {
		// Create a stub to open a communication channel with the Durable Object
		// instance named "foo".
		//
		// Requests from all Workers to the Durable Object instance named "foo"
		// will go to a single remote Durable Object instance.
		const id = env.RESEARCH_AGENT.idFromName("default");
		const stub = env.RESEARCH_AGENT.get(id) as unknown as ResearchAgent;

		// Call the `sayHello()` RPC method on the stub to invoke the method on
		// the remote Durable Object instance.
		const url = new URL(request.url);

		if (request.method === "POST" && url.pathname === "/chat") {
 		const body = await request.json() as { message: string }; //verifies if the request is "post" and extracts the message and passes it to the durable object
 		const reply = await stub.chat(body.message); 
		return Response.json({ reply });
 		}
		return new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
