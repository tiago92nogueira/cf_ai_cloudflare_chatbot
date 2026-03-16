Optional Assignment: See instructions below for Cloudflare AI app assignment. SUBMIT GitHub repo URL for the AI project here. (Please do not submit irrelevant repositories.)
Optional Assignment Instructions: We plan to fast track review of candidates who complete an assignment to build a type of __AI-powered application__ on Cloudflare. An AI-powered application should include the following components:
* LLM (recommend using Llama 3.3 on Workers AI), or an external LLM of your choice
* Workflow / coordination (recommend using Workflows, Workers or Durable Objects)
* User input via chat or voice (recommend using Pages or Realtime)
* Memory or state
Find additional documentation __here__.
 
__IMPORTANT NOTE:__ To be considered, your repository name must be prefixed with cf_ai_, must include a README.md file with project documentation and clear running instructions to try out components (either locally or via deployed link). AI-assisted coding is encouraged, but you must include AI prompts used in PROMPTS.md
 
All work must be original; copying from other submissions is strictly prohibited.

explica me resumidamente este projeto que é para fazer para uma candidatura a summer internship para a cloudflare.
consulta os dois links fornecidos para perceberes melhor se necessário
se percisares de mais infos diz

eu gostava que me ajudasses a fazer isso
esta é a pagina que aparece abrindo um dos links , o outro é uma especie de guia
como devo começar

https://developers.cloudflare.com/workers/wrangler/configuration/
consulta este link para configurar o wrangler resume e diz me o que é importante para este projeto

o que é um worker e um durable object

esta é a classe index, explica me como interpretar isto, como começar e como testar

PS C:\Users\James\Desktop\cf_ai_research_agent> npm run dev
> cf-ai-research-agent@0.0.0 dev
> wrangler dev
 ⛅️ wrangler 4.73.0
───────────────────
Cloudflare collects anonymous telemetry about your usage of Wrangler. Learn more at https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler/telemetry.md
Your Worker has access to the following bindings:
Binding                                 Resource            Mode
env.RESEARCH_AGENT (ResearchAgent)      Durable Object      local
env.AI                                  AI                  remote
❓ Your types might be out of date. Re-run wrangler types to ensure your types are correct.
╭──────────────────────────────────────────────────────────────────────╮
│  [b] open a browser [d] open devtools [c] clear console [x] to exit  │
╰──────────────────────────────────────────────────────────────────────╯
X [ERROR] Your Worker depends on the following Durable Objects, which are not exported in your entrypoint file: ResearchAgent.
  You should export these objects from your entrypoint, src\index.ts.
🪵  Logs were written to "C:\Users\James\AppData\Roaming\xdg.config\.wrangler\logs\wrangler-2026-03- 15_20-23-35_618.log"
Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76

Property 'RESEARCH_AGENT' does not exist on type 'Env'.ts(2339)

        const stub = env.RESEARCH_AGENT.get<ResearchAgent>(id);
Expected 0 type arguments, but got 1.ts(2558)

        const greeting = await stub.sayHello("world");
Property 'sayHello' does not exist on type 'DurableObjectStub<undefined>'.ts(2339)

sem me dares a resposta ajuda me a ter ideia como fazer o proximo passo

devemos guardar as perguntas anteriores guardando o string talvez associado ao id do stub da conversa? o que é o env?

o construtor recebe o env e o durable object

o metodo chat deve aceder à lista (historico) e "enviar" para o llm, depois recebe a resposta do llm

guarda-la no historico

async chat(mensagem): 
adicionar { role: "user", content: mensagem } à lista 
enviar this.messages para this.env.AI
receber resposta do this.env.AI
adicionar role: ai, content mensagem a lista

apos declarar a lista de mensagenso que devo fazer

como faço para receber a resposta da LLM

o que significa          "@cf/meta/llama-3.3-70b-instruct-fp8-fast",

para receber a mensagem do user tem de ter acesso a lista messages?

o worker recebe o durable object? recebe do durable object? estou confuso
como assim que pedido do frontend?

request: Request<unknown, IncomingRequestCfProperties<unknown>>

if(request.method == "POST" &&  url.pathname == "/chat")

if(request.method == "POST" &&  url.pathname == "/chat"){ 
const rep = await stub.chat(body.message);
 }

if(request.method == "POST" &&  url.pathname == "/chat"){  
const rep = await stub.chat(body.message); 

}
return response.json({reply});

if (request.method === "POST" && url.pathname === "/chat") {
 const body = await request.json() as { message: string };
 const reply = await stub.chat(body.message); 
return Response.json({ reply });
 }

 PS C:\Users\James\Desktop\cf_ai_research_agent> curl -X POST http://localhost:8787/chat -H "Content-Type: application/json" -d "{\"message\": \"O que e a internet?\"}"

Invoke-WebRequest : Cannot bind parameter 'Headers'. Cannot convert the "Content-Type: application/json" value of type 

"System.String" to type "System.Collections.IDictionary".

At line:1 char:44

+ ... ttp://localhost:8787/chat -H "Content-Type: application/json" -d "{\" ...

+                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    + CategoryInfo          : InvalidArgument: (:) [Invoke-WebRequest], ParameterBindingException

    + FullyQualifiedErrorId : CannotConvertArgumentNoMessage,Microsoft.PowerShell.Commands.InvokeWebRequestCommand

 PS C:\Users\James\Desktop\cf_ai_research_agent> Invoke-WebRequest -Uri "http://localhost:8787/chat" -Method POST -ContentType "application/json" -Body '{"message": "O que e a internet?"}'
>>
StatusCode        : 200
StatusDescription : OK
Content           : {"reply":"A internet Ã© um sistema global de redes de computadores interconectadas que utilizam o protocolo de   
                    comunicaÃ§Ã£o TCP/IP (Transmission Control Protocol/Internet Protocol) para se comunicar ...
RawContent        : HTTP/1.1 200 OK
                    Content-Length: 1142
                    Content-Type: application/json
                    {"reply":"A internet Ã© um sistema global de redes de computadores interconectadas que utilizam o protocolo de   
                    comunicaÃ§Ã£o TC...
Forms             : {}
Headers           : {[Content-Length, 1142], [Content-Type, application/json]}
Images            : {}
InputFields       : {}
Links             : {}
ParsedHtml        : mshtml.HTMLDocumentClass
RawContentLength  : 1142

apareceu me isto no terminal mas nao no localhost