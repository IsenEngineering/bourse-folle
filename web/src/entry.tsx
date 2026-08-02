/* @refresh reload */
import './entry.css';
import 'solid-devtools';
import { lazy } from 'solid-js';
import { render } from 'solid-js/web';
import { Router, type RouteDefinition } from '@solidjs/router';
import Nav from './components/nav/mod';

const routes = [
    {
        path: "/*",
        component: lazy(() => import('./routes/index'))
    },
    {
        path: "/prix",
        component: lazy(() => import('./routes/prix'))
    }
] as RouteDefinition[]

const root = document.getElementById('root');
render(() => <>
    <Nav/>
    <Router>
        {routes}
    </Router>
</>, root!);
