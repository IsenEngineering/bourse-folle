import { serveFile } from "@std/http/file-server";
import { Endpoint } from "./mod.ts";

export default [
    {
        protected: true,
        route: '/',
        handler(req) {
            return serveFile(req, './dist/menu/index.html')
        }
    },
    {
        protected: true,
        route: '/config',
        handler(req) {
            return serveFile(req, './dist/config/index.html')
        }
    },
    {
        protected: true,
        route: '/event',
        handler(req) {
            return serveFile(req, './dist/event/index.html')
        }
    },
    {
        protected: false,
        route: '/tv',
        handler(req) {
            return serveFile(req, './dist/tv/index.html')
        }
    },

] as Endpoint[]