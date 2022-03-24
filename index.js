// Global variables
const _INDENT_SIZE = 4
const _CHAR_SIZE = 8.8 // in px --> change to CH
let _cv
let _commandList = []
let _cmd_idx = null
let _userPath = 'C:\\Users\\limung.dev>'
let _res

// Initialize
loadCV("cv.json")
loadDefaultConsole(_userPath)

// Console
function loadDefaultConsole(path) {
    let a = document.getElementById('console-log-default')
    a.innerHTML = "Microsoft Windows [Version 10.0.19042.1415]<br>(c) Microsoft Corporation. All rights reserved."
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
    if (_cmd_idx === null) _cmd_idx = max

    if (key === 'ArrowUp' && _cmd_idx != 0) {
        _cmd_idx = _cmd_idx - 1
    } 

    if (key === 'ArrowDown' && _cmd_idx < (max - 1)) {
        _cmd_idx = _cmd_idx + 1
    }

    const c = _commandList[_cmd_idx]
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
        _cmd_idx = _commandList.length
    }
}

async function invokeCommand(cmd, path) {
    let err = `'${cmd}' is not recognized as an internal or external command,<br>operable program or batch file.`
    cmd = cmd.toLowerCase()

    if (cmd) {
        const c = cmd.split(' ')
        const cmdName = c[0]
        const cmdAttributes = c[1]

        // {Check} if text file exist
        let text = await loadTextFile(`${cmdName}.txt`)
        if (text) {
            err = null
            printConsoleResult(text)
        }

        // Check if json file exist
        let json = await loadJsonFile(`${cmdName}.json`)
        if (json && cmdAttributes && cmdAttributes.length > 0) {
            let res = json[cmdAttributes] || null
            if (res) {
                err = null
                printConsoleResult(prettyPrintChild(res))
            }
        }
        if (json && !cmdAttributes) {
            let res = json
            err = null
            printConsoleResult(`<div class="${cmdName}">${prettyPrint(res)}</div>`)
        }
    }

    if (cmd == 'cls') {
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
async function loadCV(filePath) {
    let res = await fetch(filePath)
    _cv = await res.json()
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

// Pretty print
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
        let k = capitalize(key).padEnd(pad, ' ')
        let sv =  `<span class="value">${value}</span>`
        res = (parent === key) 
            ? `<span class="key hide" pad="${pad}">${k}</span>${sv}` 
            : `<span class="key" pad="${pad}">${k}</span>${sv}`
    } else {
        res = `<span class="value">${value}</span>`
    }

    return res
}

// String function
function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase().replaceAll('_', ' ')
}
