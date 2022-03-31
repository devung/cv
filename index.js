// Global variables
const _INDENT_SIZE = 4
const _CHAR_SIZE = 8.8 // in px --> change to CH
const _EXT_URL = "https://ipinfo.io/json"
const _GITHUB_URL = "https://github.com/devung/cv"
let _commands
let _commandList = []
let _cmdIdx = null
let _userPath = 'C:\\Users\\limung.dev>'
let _clientDetails = {}
let _unknown = {}

// Initialize
loadCommands("commands.json")
getClientLocation()
loadDefaultConsole(_userPath)
_unknown['nav_appVersion'] = navigator.appVersion
_unknown['nav_userAgent'] = navigator.userAgent
_unknown['doc_URL'] = document.URL
_unknown['doc_referrer'] = document.referrer
_unknown['doc_loc_host'] = document.location.host
_unknown['viewport_width'] = document.documentElement.clientWidth
_unknown['viewport_height'] = document.documentElement.clientHeight
console.log(document.referrer) // ip?
console.log({document})
console.log({navigator})
console.log({window})
console.log(this)
console.log({location})
console.log(document.documentElement.clientWidth)

// Console
function loadDefaultConsole(path) {
    let a = document.getElementById('console-log-default')
    a.innerHTML = "<span>Microsoft Windows </span><span>[Version 10.0.19042.1415]</span><br><span>(c) Microsoft Corporation. </span><span>All rights reserved.</span>"
    createInput(path)
}

function createInput(path) {
    let c = document.getElementById('console')

    let ncl = document.createElement('label')
    ncl.setAttribute('id', 'console-label-current')
    ncl.innerHTML = path
    c.appendChild(ncl)

    let nci = document.createElement('input')
    nci.setAttribute('id', 'console-input-current')
    nci.setAttribute('type', 'text')
    nci.setAttribute('style', 'width: 0px')
    c.appendChild(nci)

    let ncc = document.createElement('span')
    ncc.setAttribute('id', 'console-cursor')
    ncc.innerText = '_'
    c.appendChild(ncc)

    nci.focus()
    addEventCommand()
    createInlineHelper(true)
}

function printConsoleResult(results, type = 'success') {
    // TO-DO - type each character
    // Create result span tag
    let c = document.getElementById('console')
    let cr = document.createElement('div')
    cr.setAttribute('class', `console-result console-result-${type}`)
    cr.innerHTML = results
    c.appendChild(cr)

    c.appendChild(document.createElement('br'))
}

// Events
function addEventCommand() {
    let i = document.getElementById('console-input-current')
    i.addEventListener('input', function (e) {
        let le = Number(i.value.length)
        let wi = le * _CHAR_SIZE
        i.setAttribute('style', `width: ${wi}px`)

        let s = (wi > 1) ? false : true

        toggleHelp(s)

    })
    i.addEventListener('keyup', function (e) {
        const key = e.key
        if (key === 'Enter') {

            document.getElementById('console-cursor').remove()
            document.getElementById('help-inline').remove()

            i.removeAttribute('id')
            i.setAttribute('readonly', 'true')

            let l = document.getElementById('console-label-current')
            l.removeAttribute('id')

            let v = e.target.value
            if (v) {
                invokeCommand(v, l.value)
            }
            else {
                let c = document.getElementById('console')
                c.appendChild(document.createElement('br'))
                createInput(l.innerHTML)
            }
        }

        if (key === 'ArrowUp' || key === 'ArrowDown') {
            getCommandList(key)
        }
    })
    window.onclick = () => {
        i.focus()
    }
}

// Commands
function getCommandList(key) {
    const max = _commandList.length
    let i = document.getElementById('console-input-current')
    const v = i.value
    if (_cmdIdx === null) _cmdIdx = max

    if (key === 'ArrowUp' && _cmdIdx != 0) {
        _cmdIdx = _cmdIdx - 1
    } 

    if (key === 'ArrowDown' && _cmdIdx < (max - 1)) {
        _cmdIdx = _cmdIdx + 1
    }

    const c = _commandList[_cmdIdx]
    const le = (c) ? c.length : null

    if (c && (c != v)) {
        const ts = 8.8
        const wi = le * ts
        i.setAttribute('style', `width: ${wi}px`)
        i.value = c
    } else {
        i.focus()
        i.setSelectionRange(le, le * 10)
    }
}

function addToCommandList(command) {
    const last = _commandList.at(-1)
    if (last != command) {
        _commandList.push(command)
        _cmdIdx = _commandList.length
    }
}

async function invokeCommand(cmd, path) {
    let err = `'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`
    cmd = cmd.toLowerCase()

    const c = cmd.indexOf(' ')
    const cmdName = (c != -1 ) ? cmd.substring(0, cmd.indexOf(' ')) : cmd
    const cmdAttributes = (c != -1) ? cmd.substring(cmd.indexOf(' ') + 1) : null

    if (cmdName && cmdName != 'help' && cmdName != 'cls' && cmdName != 'ip' && cmdName != 'loc') {
        const file = _commands[cmdName]?.file
        const ext = (file) ? file.match(/[0-9a-z]+$/i) : null
        if (file) {
            let res = await loadFile(file)
            if (ext == 'txt') {
                const text = await res.text()
                if (text) {
                    err = null
                    printConsoleResult(text)
                }
            }
            let json
            if (ext == 'json') json = await res.json()
            if (json && cmdAttributes?.length > 0) {
                let r = json[cmdAttributes] || null
                if (r) {
                    err = null
                    printConsoleResult(prettyPrintChild(r))
                }
            }
            if (json && !cmdAttributes) {
                let r = json
                err = null
                printConsoleResult(`<div class="${cmdName}">${prettyPrint(r)}</div>`)
            }
        }
    }

    if (cmdName == 'ip') {
        const ip = _clientDetails.ip
        if (ip) {
            err = null
            printConsoleResult("\nIPv4 Address . . . . : " +_clientDetails.ip)
        }
    }

    if (cmdName == 'loc') {
        const loc = _clientDetails.location
        let res = []
        if (loc) {
            err = null
            for (const [k, v] of Object.entries(loc)) {
                res.push(`${k.padEnd(10, ' ')} : ${v}` )
            }
            printConsoleResult("\n" + res.join("\n"))
        }
    }

    if (cmdName == 'echo') {
        err = null
        if (cmdAttributes) printConsoleResult(cmdAttributes)
        else printConsoleResult("ECHO is on.")
    }

    if (cmdName == 'github') {
        err = null
        window.open(_GITHUB_URL)
        printConsoleResult(`Open GitHub page ${_GITHUB_URL}`)
    }

    if (cmdName == 'unknown') {
        const un = _unknown
        let res = []
        if (un) {
            err = null
            for (const [k, v] of Object.entries(un)) {
                res.push(`${k} :\n    ${v}` )
            }
            printConsoleResult("\n" + res.join("\n"))
        }
    }

    if (cmdName == 'help') {
        err = null
        if (cmdAttributes) {
            const file = _commands[cmdAttributes]?.file
            const ext = file.match(/[0-9a-z]+$/i)
            if (ext == 'txt') return // No help to read from txt file
            if (ext == 'json') {
                let res = await loadFile(file)
                let json = await res.json()
                const desc = _commands[cmdAttributes].description + "\n\n"
                const attr = Object.keys(json).map( x => `${x}`)
                const usage = `USAGE:\n${cmdAttributes} [use one attribute - ${attr.join(' | ')}]`
                printConsoleResult(desc + usage)
            }
        } else {
            let list = []
            for (var key in _commands) {
                if (_commands.hasOwnProperty(key)) {
                    list.push(`${key.padEnd(5, ' ')} ${_commands[key].description}`)
                }
            }
            let text = "\nFor more information on a specific command, type HELP command-name\n"
            printConsoleResult(text + list.join('\n'))
        }
    }

    if (cmdName == 'cls') {
        err = ''
        let c = document.getElementById('console')
        removeAllChildNodes(c)
    }
    
    if (err) printConsoleResult(err, 'error')
    if (!err) addToCommandList(cmd)
    createInput(_userPath)
    toggleHelp(true)
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.lastChild);
    }
}

// Load files
async function loadCommands(filePath) {
    _commands = await loadJsonFile(filePath)
}

async function loadJsonFile(fileName) {
    try {
        let res = await fetch(fileName)
        if (res.ok) return res.json()
    } catch(err) {
        // do nothing
    }
}

async function loadTextFile(fileName) {
    try {
        let res = await fetch(fileName)
        if (res.ok) return res.text()
    } catch(err) {
        // do nothing
    }
}
async function loadFile(fileName) {
    try {
        let res = await fetch(fileName)
        if (res.ok) return res
    } catch(err) {
        // do nothing
    }
}


// Help
function toggleHelp(toggle) {
    let f = (toggle) ? 'fade-in' : 'fade-out'
    let h = document.getElementById('help-inline')
    h.setAttribute('class', `inline ${f}`)
}

function createInlineHelper(fade) {
    let s = document.createElement('span')
    s.setAttribute('id', `help-inline`)
    s.setAttribute('class', `inline ${fade}`)
    s.innerText = 'type "help" then Enter to get started'
    document.getElementById('console-cursor').after(s)
}

// Pretty print JSON files
function prettyPrint(value, key = null, pad = 0) {
    const cn = value.constructor.name
    let pretty
    if (cn === 'Object') {
        let na = []
        for (const [k, v] of Object.entries(value)) {
            let pkey = k.toUpperCase().replaceAll('_', ' ')
            let p =  `<div class="Parent-Object"><div class="key parent">${pkey}</div>${prettyPrintChild(v, k, k, 0)}</div>`
            na.push(p)
        }
        pretty = `<div class="Object">${na.join('')}</div>`
    }

    return pretty
}

function prettyPrintChild(value, key = null, parent = null, pad = 0) {
    const cn = value.constructor.name
    let pretty
    if (cn === 'String' || cn === 'Number') {
        value = value.toString()
        let r = prettyPrintString(value, key, parent, pad)
        pretty = (key) ? `<div class="key-text-pair">${r}</div>` : r

    }
    if (cn === 'Array') {
        let na = []
        value.forEach((v, i, s) => {
            const vcn = v.constructor.name
            let e
            if (vcn === 'String' || 'Number') {
                let vStr = v.toString()
                e = `<div class="element element-text">${prettyPrintChild(vStr, null, null, 0)}</div>`
            }
            if (vcn === 'Object') {
                e = `<div class="element element-object">${prettyPrintChild(v, null, null, 0)}</div>`
            }
            if (vcn === 'Array') {e = ''} // TO-DO maybe
            na.push(e)
        })
        let v = `<div class="array">${na.join('')}</div>`
        pretty = (key && !(parent === key)) ? `<div class="key child">${capitalize(key)}</div>${v}` : v
    }
    if (cn === 'Object') {
        let na = []
        const kl = Object.keys(value).map(k => k.length)
        const mx = Math.max(...kl)
        for (const [k, v] of Object.entries(value)) {
            let p = prettyPrintChild(v, k, key, mx)
            na.push(p)
        }
        let r = na.join('')
        pretty = `<div class="object">${r}</div>`
    }

    return pretty
}

function prettyPrintString(value, key = null, parent = null, pad = 0) {
    let res
    if (key) {
        let k = capitalize(key)
        let sv =  `<span class="value">${value}</span>`
        res = (parent === key) 
            ? `<span class="key hide" pad="${pad}">${k}</span>${sv}` 
            : `<span class="key" pad="${pad}" data-key="${k}">${k.padEnd(pad, ' ')}</span>${sv}`
    } else {
        res = `<span class="value">${value}</span>`
    }

    return res
}

// String functions
function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase().replaceAll('_', ' ')
}

// On-load functions
async function getClientLocation() {
    console.log('getting location')
    try {
        let res = await fetch(_EXT_URL)
        if (res.ok) {
            const data = await res.json()
            _clientDetails["ip"] = data.ip
            let location = {}
            location["city"] = data.city
            location["region"] = data.region
            location["country"] = data.country
            _clientDetails["location"] = location
        }
    } catch(err) {
        // do nothing
    }
}
