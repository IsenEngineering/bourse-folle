import { useLocation } from "@solidjs/router"

export default () => {
    const location = useLocation()
    return <>
        <pre class="p-4 text-white">
            {JSON.stringify(location, undefined, 4)}
        </pre>
    </>
}