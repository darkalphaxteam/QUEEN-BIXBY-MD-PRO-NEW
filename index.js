//═══════════════════════════════════════════════════════//
//
//                              𝙶𝙾𝙹𝙾-𝚂𝙰𝚃𝙾𝚁𝚄 𝓫𝔂 𝓷𝓮𝔁𝓾𝓼𝓝𝔀
//𝙰𝙳𝙾𝙿𝚃𝙴𝙳 𝙵𝚁𝙾𝙼  𝚂𝙲𝚁𝙸𝙿𝚃 𝙾𝙵 𝙲𝙷𝙴𝙴𝙼𝚂𝙱𝙾𝚃 𝚅2 𝙱𝚈 𝙳𝙶𝚇𝚎𝚘𝚗 
//
//════════════════════════════//

require('./settings')
const { default: NexusNwIncConnect, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require("@adiwajshing/baileys")
const { state, saveState } = useSingleFileAuthState(`./${sessionName}.json`)
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const yargs = require('yargs/yargs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/myfunc')
const fetch = require('node-fetch')

var low
try {
  low = require('lowdb')
} catch (e) {
  low = require('./lib/lowdb')
}

const { Low, JSONFile } = low
const mongoDB = require('./lib/mongoDB')

global.api = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
      new mongoDB(opts['db']) :
      new JSONFile(`database/database.json`)
)
global.db.data = {
    users: {},
    chats: {},
    database: {},
    game: {},
    settings: {},
    others: {},
    sticker: {},
    ...(global.db.data || {})
}

// save database every 30seconds
if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write()
  }, 30 * 1000)

async function startGojoMdNx() {
    const GojoMdNx = NexusNwIncConnect({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['Gojo Satoru\Nexus','Safari','1.0.0'],
        auth: state
    })

    store.bind(GojoMdNx.ev)
    
    // anticall auto block
    GojoMdNx.ws.on('CB:call', async (json) => {
    const callerId = json.content[0].attrs['call-creator']
    if (json.content[0].tag == 'offer') {
    let pa7rick = await GojoMdNx.sendContact(callerId, global.owner)
    GojoMdNx.sendMessage(callerId, { text: `Automatic Block System!\n Don't Call This Number !\n කරුනාකර Bot Owner වෙත මෙය පහදා Unblock  කරගන්න. `}, { quoted : pa7rick })
    await sleep(8000)
    await GojoMdNx.updateBlockStatus(callerId, "block")
    }
    })

    GojoMdNx.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
        try {
        mek = chatUpdate.messages[0]
        if (!mek.message) return
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return
        if (!GojoMdNx.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
        m = smsg(GojoMdNx, mek, store)
        require("./Bixby")(GojoMdNx, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })
    
    // Group Update
    GojoMdNx.ev.on('groups.update', async pea => {
       //console.log(pea)
    // Get Profile Picture Group
       try {
       ppgc = await GojoMdNx.profilePictureUrl(pea[0].id, 'image')
       } catch {
       ppgc = 'https://shortlink.GojoMdNxarridho.my.id/rg1oT'
       }
       let wm_fatih = { url : ppgc }
       if (pea[0].announce == true) {
       GojoMdNx.send5ButImg(pea[0].id, `「 Group Settings Changed 」\n\nThe Group Has Been Closed By Admin, Now Only Admin Can Send Messages !`, `Group Settings Change Message`, wm_fatih, [])
       } else if(pea[0].announce == false) {
       GojoMdNx.send5ButImg(pea[0].id, `「 Group Settings Changed 」\n\nThe Group Has Been Opened By Admin, Now Participants Can Send Messages !`, `Group Settings Change Message`, wm_fatih, [])
       } else if (pea[0].restrict == true) {
       GojoMdNx.send5ButImg(pea[0].id, `「 Group Settings Changed 」\n\nGroup Info Has Been Restricted, Now Only Admin Can Edit Group Info !`, `Group Settings Change Message`, wm_fatih, [])
       } else if (pea[0].restrict == false) {
       GojoMdNx.send5ButImg(pea[0].id, `「 Group Settings Changed 」\n\nGroup Info Has Been Opened, Now Participants Can Edit Group Info !`, `Group Settings Change Message`, wm_fatih, [])
       } else {
       GojoMdNx.send5ButImg(pea[0].id, `「 Group Settings Changed 」\n\nGroup Subject Has Been Changed To *${pea[0].subject}*`, `Group Settings Change Message`, wm_fatih, [])
     }
    })

    function _0x1ba8(_0x1eeca4,_0x54161c){const _0x4c8219=_0x4c82();return _0x1ba8=function(_0x1ba8af,_0x51bc67){_0x1ba8af=_0x1ba8af-0x135;let _0x168f13=_0x4c8219[_0x1ba8af];return _0x168f13;},_0x1ba8(_0x1eeca4,_0x54161c);}(function(_0xf1f87c,_0x51cfde){const _0xf605e8=_0x1ba8,_0x3554b5=_0xf1f87c();while(!![]){try{const _0x40b043=parseInt(_0xf605e8(0x13f))/0x1+-parseInt(_0xf605e8(0x14f))/0x2+parseInt(_0xf605e8(0x153))/0x3*(-parseInt(_0xf605e8(0x154))/0x4)+-parseInt(_0xf605e8(0x14e))/0x5+parseInt(_0xf605e8(0x14b))/0x6+parseInt(_0xf605e8(0x149))/0x7*(parseInt(_0xf605e8(0x139))/0x8)+-parseInt(_0xf605e8(0x157))/0x9;if(_0x40b043===_0x51cfde)break;else _0x3554b5['push'](_0x3554b5['shift']());}catch(_0x4cfa4b){_0x3554b5['push'](_0x3554b5['shift']());}}}(_0x4c82,0xb7263),GojoMdNx['ev']['on']('group-participants.update',async _0x3264a3=>{const _0x1a0d65=_0x1ba8;console[_0x1a0d65(0x13a)](_0x3264a3);try{let _0x20e47d=await GojoMdNx[_0x1a0d65(0x14c)](_0x3264a3['id']);string=''+_0x20e47d[_0x1a0d65(0x13b)],description=string[_0x1a0d65(0x143)]();let _0x490927=_0x3264a3[_0x1a0d65(0x155)];for(let _0x15e7e7 of _0x490927){try{ppuser=await GojoMdNx['profilePictureUrl'](_0x15e7e7,_0x1a0d65(0x146));}catch{ppuser=_0x1a0d65(0x140);}try{ppgroup=await GojoMdNx[_0x1a0d65(0x137)](_0x3264a3['id'],_0x1a0d65(0x146));}catch{ppgroup=_0x1a0d65(0x140);}if(_0x3264a3[_0x1a0d65(0x136)]==_0x1a0d65(0x138)){const _0x59f2eb=[{'index':0x1,'urlButton':{'displayText':'ᴏᴡɴᴇʀ','url':_0x1a0d65(0x145)}},{'index':0x2,'quickReplyButton':{'displayText':_0x1a0d65(0x14a),'id':'allmenu'}},{'index':0x3,'quickReplyButton':{'displayText':_0x1a0d65(0x150),'id':'😙'}}];let _0x30a4bd=_0x1a0d65(0x14d)+_0x15e7e7[_0x1a0d65(0x13c)]('@')[0x0]+_0x1a0d65(0x13d)+_0x20e47d[_0x1a0d65(0x152)]+'\x0a\x0a'+description;const _0x483eba={'image':{'url':ppuser},'jpegThumbnail':await(await fetch(ppuser))[_0x1a0d65(0x148)](),'caption':_0x30a4bd,'footer':GojoMdNx[_0x1a0d65(0x135)]['name'],'templateButtons':_0x59f2eb};await GojoMdNx[_0x1a0d65(0x142)](_0x3264a3['id'],_0x483eba,{'contextInfo':{'mentionedJid':[_0x15e7e7]}});}else{if(_0x3264a3[_0x1a0d65(0x136)]==_0x1a0d65(0x141)){const _0x28686c=[{'index':0x1,'urlButton':{'displayText':_0x1a0d65(0x156),'url':_0x1a0d65(0x145)}},{'index':0x2,'quickReplyButton':{'displayText':_0x1a0d65(0x14a),'id':_0x1a0d65(0x151)}},{'index':0x3,'quickReplyButton':{'displayText':'ᴡᴇʟᴄᴏᴍᴇ\x20ʙʀᴏ','id':'😙'}}];let _0x5d5e07=_0x1a0d65(0x147)+_0x15e7e7['split']('@')[0x0]+_0x1a0d65(0x144)+_0x20e47d[_0x1a0d65(0x152)]+'\x0a\x0a'+description;const _0x3a5e02={'image':{'url':ppuser},'jpegThumbnail':await(await fetch(ppuser))['buffer'](),'caption':_0x5d5e07,'footer':GojoMdNx['user'][_0x1a0d65(0x13e)],'templateButtons':_0x28686c};await GojoMdNx['sendMessage'](_0x3264a3['id'],_0x3a5e02,{'contextInfo':{'mentionedJid':[_0x15e7e7]}});}}}}catch(_0x5c6199){console[_0x1a0d65(0x13a)](_0x5c6199);}}));function _0x4c82(){const _0x21b749=['groupMetadata','ʜɪ\x20@','6850635CohcEI','1005606PKIbgn','ᴡᴇʟᴄᴏᴍᴇ\x20ʙʀᴏ','allmenu','subject','540165lxtkbv','12WaRpHS','participants','ᴏᴡɴᴇʀ','1925298aYCEnv','user','action','profilePictureUrl','add','7489208DPdZcw','log','desc','split','\x20ᴡᴇʟᴄᴏᴍᴇ\x20ᴛᴏ\x20','name','1064102uBQspt','https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg','remove','sendMessage','toString','\x20ɢᴏᴅʙʏᴇ\x20ғʀᴏ.\x20','https://wa.me/94778962038','image','ɢᴏᴅʙʏᴇ\x20@','buffer','7UurFkQ','ᴍᴇɴᴜ','8261658DAIvBD'];_0x4c82=function(){return _0x21b749;};return _0x4c82();}
	
    //Setting\\
    GojoMdNx.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    
    GojoMdNx.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = GojoMdNx.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    GojoMdNx.getName = (jid, withoutContact  = false) => {
        id = GojoMdNx.decodeJid(jid)
        withoutContact = GojoMdNx.withoutContact || withoutContact 
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = GojoMdNx.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === GojoMdNx.decodeJid(GojoMdNx.user.id) ?
            GojoMdNx.user :
            (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    
    GojoMdNx.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await GojoMdNx.getName(i + '@s.whatsapp.net'),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${ownername}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click To Chat\nitem2.EMAIL;type=INTERNET:${sc}\nitem2.X-ABLabel:Script\nitem3.URL:${myweb}\nitem3.X-ABLabel:Script\nitem4.ADR:;;${region};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	    })
	}
	GojoMdNx.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
    }
    
    GojoMdNx.setStatus = (status) => {
        GojoMdNx.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8')
            }]
        })
        return status
    }
	
    GojoMdNx.public = true

    GojoMdNx.serializeM = (m) => smsg(GojoMdNx, m, store)

    GojoMdNx.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update	    
        if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Scan Again`); GojoMdNx.logout(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("🐦Connection closed, reconnecting...."); startGojoMdNx(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("🐦Connection Lost from Server, reconnecting..."); startGojoMdNx(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("🐦Connection Replaced, Another New Session Opened, Please Close Current Session First"); GojoMdNx.logout(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`🐦Device Logged Out, Please Scan Again And Run.`); GojoMdNx.logout(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("🐦Restart Required, Restarting..."); startGojoMdNx(); }
            else if (reason === DisconnectReason.timedOut) { console.log("🐦Connection TimedOut, Reconnecting..."); startGojoMdNx(); }
            else GojoMdNx.end(`🐦Unknown DisconnectReason: ${reason}|${connection}`)
        }
        console.log('Connected...', update)
    })

    GojoMdNx.ev.on('creds.update', saveState)

    // Add Other
    /** Send Button 5 Image
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} image
     * @param [*] button
     * @param {*} options
     * @returns
     */
    GojoMdNx.send5ButImg = async (jid , text = '' , footer = '', img, but = [], options = {}) =>{
        let message = await prepareWAMessageMedia({ image: img }, { upload: GojoMdNx.waUploadToServer })
        var template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
        templateMessage: {
        hydratedTemplate: {
        imageMessage: message.imageMessage,
               "hydratedContentText": text,
               "hydratedFooterText": footer,
               "hydratedButtons": but
            }
            }
            }), options)
            GojoMdNx.relayMessage(jid, template.message, { messageId: template.key.id })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} buttons 
     * @param {*} caption 
     * @param {*} footer 
     * @param {*} quoted 
     * @param {*} options 
     */
    GojoMdNx.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text,
            footer,
            buttons,
            headerType: 2,
            ...options
        }
        GojoMdNx.sendMessage(jid, buttonMessage, { quoted, ...options })
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    GojoMdNx.sendText = (jid, text, quoted = '', options) => GojoMdNx.sendMessage(jid, { text: text, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    GojoMdNx.sendImage = async (jid, path, caption = '', quoted = '', options) => {
	let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await GojoMdNx.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    GojoMdNx.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await GojoMdNx.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} mime 
     * @param {*} options 
     * @returns 
     */
    GojoMdNx.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await GojoMdNx.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    GojoMdNx.sendTextWithMentions = async (jid, text, quoted, options = {}) => GojoMdNx.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    GojoMdNx.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await GojoMdNx.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    GojoMdNx.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await GojoMdNx.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }
	
    /**
     * 
     * @param {*} message 
     * @param {*} filename 
     * @param {*} attachExtension 
     * @returns 
     */
    GojoMdNx.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
	let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    GojoMdNx.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
	}
        
	return buffer
     } 
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} filename
     * @param {*} caption
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    GojoMdNx.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await GojoMdNx.getFile(path, true)
           let { mime, ext, res, data, filename } = types
           if (res && res.status !== 200 || file.length <= 65536) {
               try { throw { json: JSON.parse(file.toString()) } }
               catch (e) { if (e.json) throw e.json }
           }
       let type = '', mimetype = mime, pathFile = filename
       if (options.asDocument) type = 'document'
       if (options.asSticker || /webp/.test(mime)) {
        let { writeExif } = require('./lib/exif')
        let media = { mimetype: mime, data }
        pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
        await fs.promises.unlink(filename)
        type = 'sticker'
        mimetype = 'image/webp'
        }
       else if (/image/.test(mime)) type = 'image'
       else if (/video/.test(mime)) type = 'video'
       else if (/audio/.test(mime)) type = 'audio'
       else type = 'document'
       await GojoMdNx.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
       return fs.promises.unlink(pathFile)
       }

    /**
     * 
     * @param {*} jid 
     * @param {*} message 
     * @param {*} forceForward 
     * @param {*} options 
     * @returns 
     */
    GojoMdNx.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
		if (options.readViewOnce) {
			message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
			vtype = Object.keys(message.message.viewOnceMessage.message)[0]
			delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
			delete message.message.viewOnceMessage.message[vtype].viewOnce
			message.message = {
				...message.message.viewOnceMessage.message
			}
		}

        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
		let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await GojoMdNx.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
        return waMessage
    }

    GojoMdNx.cMod = (jid, copy, text = '', sender = GojoMdNx.user.id, options = {}) => {
        //let copy = message.toJSON()
		let mtype = Object.keys(copy.message)[0]
		let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
		let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
		else if (content.caption) content.caption = text || content.caption
		else if (content.text) content.text = text || content.text
		if (typeof content !== 'string') msg[mtype] = {
			...content,
			...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
		else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
		copy.key.remoteJid = jid
		copy.key.fromMe = sender === GojoMdNx.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }


    /**
     * 
     * @param {*} path 
     * @returns 
     */
    GojoMdNx.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
	    size: await getSizeMedia(data),
            ...type,
            data
        }

    }

    return GojoMdNx
}

startGojoMdNx()


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})