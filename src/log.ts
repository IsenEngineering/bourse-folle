const colors: Record<string, string> = {
    'kv': 'cyan',
    'auth': 'red',
    'boissons': 'green',
    'periode': 'yellow'
}

export default (service: string, msg: string) => {
    const color = service in colors ? colors[service] : 'blue'
    console.log(`%c[${ service }]%c ` + msg, `color: ${color};font-weight: bold;`, 'color: unset; font-weight:normal;')
}