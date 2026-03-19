import { DurableObject, WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";
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
export class LanguageDetectionWorkflow extends WorkflowEntrypoint {
	async run(event: WorkflowEvent<{ message: string }>, step: WorkflowStep) {
		const language = await step.do("detect-language", async () => {
			const responseLanguage = await (this.env as any).AI.run(
				"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
				{
					messages: [
						{ role: "system", content: "Detect the language of the user message. Reply with ONLY the language name, nothing else. For example: 'Portuguese' or 'English'." },
						{ role: "user", content: event.payload.message }
					]
				}
			);
			return responseLanguage.response;
		});
		return language;
	}
}

export class ResearchAgent extends DurableObject {
	
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
		const stored = await this.ctx.storage.get<{ role: string; content: string }[]>("messages");
		const messages = stored || [];

		messages.push({ role: "user", content: userMessage });

		const response = await (this.env as any).AI.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{ messages }
		);

		messages.push({ role: "assistant", content: response.response });

		await this.ctx.storage.put("messages", messages);

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
 		const instance = await env.LANGUAGE_WORKFLOW.create({
    		params: { message: body.message }
		});

		let status = await instance.status();
		while (status.status === "running" || status.status === "queued") {
			await new Promise(r => setTimeout(r, 500));
			status = await instance.status();
		}

		const language = status.output as string;
		const reply = await stub.chat(body.message); 
		return Response.json({ reply, language }); 		}
		return new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
