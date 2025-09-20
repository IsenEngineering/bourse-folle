export type Handler = (
    request: Request,
    url: URL,
    info: Deno.ServeHandlerInfo<Deno.Addr>,
) => Promise<Response | 'next'> | Response | 'next'

export type Endpoint = StaticEndpoint

interface StaticEndpoint {
    route: string
    protected?: boolean
    handler: Handler
}

const endpoints: { [route: string]: { handle: Handler, protected: boolean } } = {}

import client from "./client.ts"
import tv from "./tv.ts"

for(const endpoint of client) {
    endpoints[endpoint.route] = {
        protected: endpoint.protected || false,
        handle: endpoint.handler
    }
}
for(const endpoint of tv) {
    endpoints[endpoint.route] = {
        protected: endpoint.protected || false,
        handle: endpoint.handler
    }
}

export default endpoints