/* @refresh reload */
import './entry.css';
import 'solid-devtools';
import { lazy } from 'solid-js';
import { render } from 'solid-js/web';
import { Router, type RouteDefinition } from '@solidjs/router';

const routes = [
    {
        path: "/*",
        component: lazy(() => import('./routes/index'))
    },
    {
        path: "/dash",
        component: lazy(() => import('./routes/dash/layout')),
        children: [
            {
                path: "/debug",
                component: lazy(() => import('./routes/dash/debug'))
            },
            {
                path: "/service",
                component: lazy(() => import('./routes/dash/service/mod'))
            },
            {
                path: "/config",
                component: lazy(() => import('./routes/dash/config/layout')),
                children: [
                    {
                        path: '/settings',
                        component: lazy(() => import('./routes/dash/config/settings'))
                    },
                    {
                        path: '/new-resource',
                        component: lazy(() => import('./routes/dash/config/new'))
                    },
                    {
                        path: '/:resource',
                        component: lazy(() => import('./routes/dash/config/resource'))
                    }
                ]
            },
            {
                path: "/actions",
                component: lazy(() => import('./routes/dash/actions/mod'))
            },
            {
                path: "/logs",
                component: lazy(() => import('./routes/dash/logs/layout')),
                children: [
                    {
                        path: '/',
                        component: lazy(() => import('./routes/dash/logs/empty'))
                    },
                    {
                        path: '/:id',
                        component: lazy(() => import('./routes/dash/logs/mod'))
                    }
                ]
            },
            {
                path: "/*",
                component: lazy(() => import('./routes/dash/index')),
            }
        ]
    }
] as RouteDefinition[]

const root = document.getElementById('root');
render(() => <Router>
    {routes}
</Router>, root!);
