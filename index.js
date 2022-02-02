const _INDENT_SIZE = 4
const _CHAR_SIZE = 1 // in CH
let _CV // replace
let _Cv
let _CVV // remove
let _CMDS = [] // replace
let _CommandList = []
let _CMD_IDX = null // replace

let userPath = 'C:\\Users\\limung.dev>' // replace
let _UserPath = 'C:\\Users\\limung.dev>'

loadJson("cv.json")

loadJsonFile("cv_skillset.json").then( res => {
    _CVV = res
})


loadDefaultConsole(userPath)

async function loadJson(filePath) {
    var res = await fetch(filePath)
    _CV = await res.json()
}

async function loadJsonFile(filePath) {
    let js = await fetch(filePath)
    let res = await js.json()
    return res
}

function loadDefaultConsole(initString) {
    let a = document.getElementById('console-log-default')
    a.innerHTML = "Microsoft Windows [Version 10.0.19042.1415]<br>(c) Microsoft Corporation. All rights reserved."

    createInput(initString)
}

function addToCommandList(command) {
    const last = _CMDS.at(-1)
    console.log({last})
    if (last != command) {
        _CMDS.push(command)
        _CMD_IDX = _CMDS.length
    }
}

async function invokeCommand(cmd, path) {
    let err = `'${cmd}' is not recognized as an internal or external command,<br>operable program or batch file.`
    cmd = cmd.toLowerCase()

    if (cmd) {
        let res = getJson(cmd)
        if (res) {
            err = null
            printConsoleResult(res)
        }
    }

    if (cmd == 'cv') {
        err = null
        printConsoleResult(`<div class="cv">${prettyPrint(_CV)}</div>`)
    }
    if (cmd == 'cvv') {
        err = null
        printConsoleResult(`<div class="cv">${prettyPrint(_CVV)}</div>`)
    }

    if (cmd == 'help') {
        err = null
        let results = await loadFile('help.txt')
        printConsoleResult(results)
    }
    
    if (cmd == 'cls') {
        err = ''
        let c = document.getElementById('console')
        removeAllChildNodes(c)
    }
    
    if (err) printConsoleResult(err, 'error')
    if (!err) addToCommandList(cmd)
    createInput(userPath)
    toggleHelp(true)
}

function getJson(key) {
    let res = _CV[key]
    if (!res) return null

    let pretty = prettyPrintChild(res)

    return `${pretty}`
}

function prettyPrintChild(value, key = null, parent = null, pad = 0) {
    const cn = value.constructor.name
    console.log('prettyPrintChild - start key: ' + key + ', type of: ' + cn)
    console.log({ key, value, pad, parent })
    let pretty
    if (cn === 'String' || cn === 'Number') {
        value = value.toString()
        let r = prettyPrintString(value, key, parent, pad)
        pretty = (key) ? `<div class="key-text-pair">${r}</div>` : r

    }
    if (cn === 'Array') {
        let na = []
        const ldx = value.length - 1
        value.forEach((v, i, s) => {
            console.log({ i, s })
            const vcn = v.constructor.name
            let e
            if (vcn === 'String' || 'Number') {
                let vStr = v.toString()
                console.log({key})
                e = `<div class="element element-text">${prettyPrintChild(vStr, null, null, 0)}</div>`
            }
            if (vcn === 'Object') {
                e = `<div class="element element-object">${prettyPrintChild(v, null, null, 0)}</div>`
            }
            if (vcn === 'Array') {e = ''} // TO-DO
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
            console.log({ kl, mx })
            let p = prettyPrintChild(v, k, key, mx)
            na.push(p)
        }
        let r = na.join('')
        pretty = `<div class="object">${r}</div>`
    }
    console.log('prettyPrintChild - end')
    return pretty
}

function prettyPrint(value, key = null, pad = 0) {
    console.log("prettyPrint - start")
    console.log({ key, value })
    const cn = value.constructor.name
    let pretty
    if (cn === 'Object') {
        let na = []
        for (const [k, v] of Object.entries(value)) {
            console.log({ k, v })
            let pkey = k.toUpperCase().replaceAll('_', ' ')
            let p =  `<div class="Parent-Object"><div class="key parent">${pkey}</div>${prettyPrintChild(v, k, k, 0)}</div>`
            na.push(p)
        }
        pretty = `<div class="Object">${na.join('')}</div>`
    }
    console.log(`prettyPrint: end`)

    return pretty
}

function prettyPrintString(value, key = null, parent = null, pad = 0) {
    console.log('prettyPrintString - start')
    console.log(value, key, parent, pad)
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
    console.log(`prettyPrintString: end`)
    return res
}

function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase().replaceAll('_', ' ')
}

async function loadFile(fileName) {
    let res = await fetch(fileName)
    let help = await res.text()
    return help
}

function getCommandList(key) {
    const max = _CMDS.length
    let i = document.getElementById('console-input-current')
    const v = i.value
    console.log({v})
    if (_CMD_IDX === null) _CMD_IDX = max
    
    if (key === 'ArrowUp' && _CMD_IDX != 0) {
        _CMD_IDX = _CMD_IDX - 1
    } 
    if (key === 'ArrowDown' && _CMD_IDX < (max - 1)) {
        _CMD_IDX = _CMD_IDX + 1
    }
    const c = _CMDS[_CMD_IDX]
    const le = (c) ? c.length : null
    console.log({_CMD_IDX})
    console.log({c})

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

function toggleHelp(toggle) {
    let h = document.getElementById('help-center')
    let visible = isInViewport(h)
    let f = (toggle) ? 'fade-in' : 'fade-out'
    console.log({f, visible})
    if (visible) {
        h.setAttribute('class', `center ${f}`)
    } else {
        h.setAttribute('class', `fade-out`)
        let hinline = document.getElementById('help-inline')
        if (hinline) {
            hinline.setAttribute('class', f)
        } else createInlineHelper(f)
    }
    //  ? 'center' : 'inline'
    // let f = (toggle) ? 'fade-in' : 'fade-out'
    // console.log("if help visible: " + isInViewport(h))
    // let c = `${d} ${f}`
    // h.setAttribute('class', c)
}

function toggleHelpv1(toggle) {
    let h = document.getElementById('help')
    let d = (isInViewport(h)) ? 'center' : 'inline'
    let f = (toggle) ? 'fade-in' : 'fade-out'
    console.log("if help visible: " + isInViewport(h))
    let c = `${d} ${f}`
    h.setAttribute('class', c)
}

function createInlineHelper(fade) {
    let s = document.createElement('span')
    s.setAttribute('id', `help-inline`)
    s.setAttribute('class', `inline ${fade}`)
    s.innerText = 'type "help" then Enter to get started'
    // document.getElementById('console').appendChild(s)
    // insertAfter(s, document.getElementById('console-cursor'))
    document.getElementById('console-cursor').after(s)
}

function addEventCommand() {
    let i = document.getElementById('console-input-current')
    i.addEventListener('input', function (e) {
        let le = Number(i.value.length)
        const ts = 8.8 // refactor
        let wi = le * ts
        i.setAttribute('style', `width: ${wi}px`)

        let s = (wi > 1) ? false : true
        
        // let c = (wi > 1) ? 'fade-out' : 'fade-in'
        // let h = document.getElementById('help')
        // let isinvp = isInViewport(h)
        // console.log({isinvp})
        // h.setAttribute('class', c)

        toggleHelp(s)

    })
    i.addEventListener('keyup', function (e) {
        const key = e.key
        if (key === 'Enter') {
            let v = e.target.value

            i.removeAttribute('id')

            let cc = document.getElementById('console-cursor')
            cc.remove()

            let l = document.getElementById('console-label-current')
            let clv = l.innerHTML
            l.removeAttribute('id')

            let h = document.getElementById('help-inline')
            if (h) h.remove()

            i.setAttribute('readonly', 'true')
            if (v) {
                invokeCommand(v, l.value)
            }
            else {
                let c = document.getElementById('console')
                c.appendChild(document.createElement('br'))
                createInput(clv)
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
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.lastChild);
    }
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    let left = rect.left
    let top = rect.top
    let bottom = rect.bottom
    let right = rect.right
    console.log({left, top, right, bottom})
    let win_height = window.innerHeight
    let win_width = window.innerWidth
    let cli_height = document.documentElement.clientHeight
    let cli_width = document.documentElement.clientWidth
    console.log({win_height, win_width, cli_height, cli_width})
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
