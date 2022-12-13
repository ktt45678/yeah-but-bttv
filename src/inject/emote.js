//let cachedBTTVEmotes = [];
//let cachedFFZEmotes = [];
let cached7TVEmotes = [];
let initialChildProcess = [];

// XXX: Implement channel emotes.
// Scuffed implementation, but it works I guess so I'm not complaining :)

/*
const fetchBTTVEmotes = async () => {
    const response = await fetch("https://api.betterttv.net/3/cached/emotes/global");
    const data = await response.json();
    cachedBTTVEmotes = data;

    if (typeof injectedChannelId === "string") {
        console.info("[BTTV] Fetching channel emotes:", injectedChannelId);
        const bttvYTChannel = await fetch("https://api.betterttv.net/3/cached/users/youtube/" + injectedChannelId);
        const bttvYTData = await bttvYTChannel.json();
        if (!Array.isArray(bttvYTData)) {
            console.warn("[BTTV] Channel doesn't exist on BTTV:", injectedChannelId);
            return;
        } else {
            console.info("[BTTV] Merging back with cached emotes list:", injectedChannelId);
            bttvYTData.forEach((content) => {
                cachedBTTVEmotes.push(content);
            })
        }
    }
}

const fetchFFZEmotes = async () => {
    const response = await fetch("https://api.betterttv.net/3/cached/frankerfacez/emotes/global");
    const data = await response.json();

    data.forEach((content) => {
        cachedFFZEmotes.push(
            {
                "id": content.id.toString(),
                "code": content.code,
            }
        )
    })
}
*/

const fetch7TVEmotes = async () => {
    const response = await fetch("https://api.7tv.app/v2/emotes/global");
    const data = await response.json();

    data.forEach((content) => {
        cached7TVEmotes.push(
            {
                "id": content.id,
                "code": content.name,
            }
        )
    })

    if (typeof injectedChannelId === "string") {
        console.info("[7TV] Fetching channel emotes:", injectedChannelId);
        const sevenTVYTChannel = await fetch("https://api.7tv.app/v2/users/" + injectedChannelId + "/emotes");
        const sevenTVYTData = await sevenTVYTChannel.json();
        if (!Array.isArray(sevenTVYTData)) {
            console.warn("[7TV] Channel doesn't exist on 7TV:", injectedChannelId);
            return;
        } else {
            console.info("[7TV] Merging back with cached emotes list:", injectedChannelId);
            sevenTVYTData.forEach((content) => {
                cached7TVEmotes.push(
                    {
                        "id": content.id,
                        "code": content.name,
                    }
                )
            })
        }
    }
}

function createEmote(emote, pepela) {
    let emoteContainer = document.createElement('span');
    emoteContainer.style.minWidth = "32px";
    emoteContainer.style.minHeight = "32px";
    let emoteElement = document.createElement("img");
    emoteElement.className = "emoji yt-formatted-string style-scope yt-live-chat-text-message-renderer yeah-but-bttv chat-image chat-line__message--emote";
    emoteElement.alt = emote.code;
    if (pepela === "bttv") {
        emoteElement.src = "https://cdn.betterttv.net/emote/" + emote.id + "/1x";
        emoteElement.srset = "https://cdn.betterttv.net/emote/" + emote.id + "/1x 1x, https://cdn.betterttv.net/emote/" + emote.id + "/2x 2x, https://cdn.betterttv.net/emote/" + emote.id + "/3x 3x";
    } else if (pepela === "ffz") {
        emoteElement.src = "https://cdn.frankerfacez.com/emoticon/" + emote.id + "/1";
        emoteElement.srset = "https://cdn.frankerfacez.com/emoticon/" + emote.id + "/1 1x, https://cdn.frankerfacez.com/emoticon/" + emote.id + "/2 2x, https://cdn.frankerfacez.com/emoticon/" + emote.id + "/4 4x";
    } else if (pepela === "7tv") {
        emoteElement.src = "https://cdn.7tv.app/emote/" + emote.id + "/1x";
        emoteElement.srset = "https://cdn.7tv.app/emote/" + emote.id + "/1x 1x, https://cdn.7tv.app/emote/" + emote.id + "/2x 2x, https://cdn.7tv.app/emote/" + emote.id + "/3x 3x, https://cdn.7tv.app/emote/" + emote.id + "/4x 4x";
    }
    emoteContainer.appendChild(emoteElement);
    return emoteContainer;
}

// replace #message contents
const replaceContents = (node) => {
    if (!node) {
        return;
    }
    const textContent = node.innerHTML;
    // try to replace if message match any emotes in
    // cachedBTTVEmotes, cachedFFZEmotes, cached7TVEmotes
    /*
    cachedBTTVEmotes.forEach((emote) => {
        const regex = new RegExp('(?<!<[^>]*)' + emote.code, "g");
        const replaced = textContent.replace(regex, createEmote(emote, "bttv"));
        if (replaced !== textContent) {
            node.innerHTML = replaced;
        }
    })

    cachedFFZEmotes.forEach((emote) => {
        const regex = new RegExp('(?<!<[^>]*)' + emote.code, "g");
        const replaced = textContent.replace(regex, createEmote(emote, "ffz"));
        if (replaced !== textContent) {
            node.innerHTML = replaced;
        }
    })

    cached7TVEmotes.forEach((emote) => {
        const regex = getRegexp([emote.code]);
        const replaced = textContent.replace(regex, createEmote(emote, "7tv"));
        if (replaced !== textContent) {
            node.innerHTML = replaced;
        }
    })
    */
}

const handleNewChatMessage = (el) => {
    el.classList.add('seventv-yt');

    const tok = new Tokenizer(cached7TVEmotes, el);
    if (tok.validate()) {
        const newBody = tok.generateTree();
        tok.contentMessage?.replaceWith(newBody);
    }
}

const mutationObserver = new MutationObserver((mut) => {
    for (const m of mut) {
        // Render new messages
        for (const n of m.addedNodes) {
            handleNewChatMessage(n);
        }
    }
})

window.addEventListener('load', async () => {
    console.info("Loaded everything...");

    /*
    console.info("Fetching BTTV Emotes...");
    await fetchBTTVEmotes();
    console.info("Fetching FFZ Emotes...");
    await fetchFFZEmotes();
    */
    console.info("Fetching 7TV emotes...");
    await fetch7TVEmotes();

    const chatContainer = document.getElementsByTagName("yt-live-chat-item-list-renderer")[0].querySelector("#contents #items");
    initialChildProcess = chatContainer.getElementsByTagName("yt-live-chat-text-message-renderer");
    console.info("Initial child process: ", initialChildProcess.length);
    for (let i = 0; i < initialChildProcess.length; i++) {
        replaceContents(initialChildProcess[i].querySelector("#message"));
    }

    window.fetchFallback = window.fetch;
    window.fetch = async (...args) => {
        let url = args[0].url;
        const result = await window.fetchFallback(...args);
        if (url.startsWith(
            'https://www.youtube.com/youtubei/v1/live_chat/get_live_chat')
        ) {
            const response = JSON.stringify(await (await result.clone()).json());
            window.dispatchEvent(new CustomEvent('messageReceive', { detail: response }));
        }
        return result;
    }
    console.info("Binding observer...");
    mutationObserver.observe(chatContainer, {
        childList: true,
    });
});

class Tokenizer {
    content = null;
    contentMessage = null;
    previousEmote = null;

    constructor(sevenTVEmotes, element) {
        this.sevenTVEmotes = sevenTVEmotes;
        this.element = element;
    }

    get data() {
        return this.element.__data;
    }

    /**
     * Validate that the given element is a valid message
     */
    validate() {
        this.content = this.element.querySelector('div#content') ?? null;
        this.contentMessage = this.content?.querySelector('span#message') ?? null;

        return !!this.content && !!this.contentMessage;
    }

    /**
     *  Generate a new message body tree containing modified text and emotes
     */
    generateTree() {
        this.element.__data.data.seventv = [];
        const newContext = document.createElement('span');
        newContext.classList.add('seventv-yt-message-content');
        newContext.classList.add('seventv-emote');
        newContext.style.verticalAlign = 'middle';
        const me = this.element.querySelector('.mention')?.textContent ?? null;
        const isMod = this.element.__data.authorBadges.some(x => ['MODERATOR', 'OWNER'].includes(x.liveChatAuthorBadgeRenderer?.icon?.iconType));

        for (let i = 0; i < this.element.__data.data.message.runs.length; i++) {
            const part = this.element.__data.data.message.runs[i];

            if (!!part.emoji) {
                this.addEmojiPart(newContext, part.emoji);
            } else if (!!part.text) {
                for (let s of part.text.split(' ')) {
                    if (!this.addEmotePart(newContext, s)) {
                        if (!isMod || !this.addHyperlinkPart(newContext, s)) {
                            this.addTextPart(newContext, ' ');
                            s === me
                                ? this.addMentionPart(newContext, s)
                                : this.addTextPart(newContext, s + ' ');
                        }
                    }
                }
            }
        }

        return newContext;
    }

    /**
     * Append a text part to the new message context
     */
    addTextPart(ctx, text) {
        const span = document.createElement('span');
        span.innerText = text;
        if (span.innerText === ' ') {
            span.style.width = '0.25rem';
        }

        ctx.appendChild(span);
    }

    /**
     * Append a text part to the new message context
     */
    addHyperlinkPart(ctx, text) {
        const a = document.createElement('a');
        a.innerText = text;
        a.className = 'yt-simple-endpoint style-scope yt-live-chat-text-message-renderer';
        a.href = text;
        a.target = '_blank';

        if (a.host && a.host != window.location.host) {
            ctx.appendChild(a);
            return true;
        }
        return false;
    }

    /**
     * Append a mention part to the new message context
     */
    addMentionPart(ctx, text) {
        const span = document.createElement('span');
        span.innerText = text;
        span.style.background = 'var(--yt-live-chat-mention-background-color)';
        span.style.padding = '2px 4px';
        span.style.borderRadius = '2px';

        ctx.appendChild(span);
    }

    /**
     * Apppend an emoji to the new message context
     */
    addEmojiPart(ctx, emoji) {
        const img = document.createElement('img');
        img.src = emoji.image?.thumbnails?.[0]?.url ?? '';
        img.alt = emoji.searchTerms?.[0] ?? 'ytemoji';
        img.width = 19.5;
        img.height = 19.5;

        ctx.appendChild(img);
    }

    /**
     * Apppend an emote to the new message context
     */
    addEmotePart(ctx, emoteName) {
        const emote = this.sevenTVEmotes.find(e => e.code === emoteName);

        if (!!emote) {
            const emoteElement = createEmote(emote, "7tv");
            ctx.appendChild(emoteElement);
            this.considerZeroWidth(emote);
            this.previousEmote = emote;
            return true;
        }
        return false;
    }

    considerZeroWidth(emote) {
        return false;
        // If this emote is zerowidth, we must check the previous emote
        if (emote.isZeroWidth() && !!this.previousEmote) {
            // Previous emote should be the target for this zero-width emmote
            // Add css class
            this.previousEmote.element?.classList.add('seventv-next-is-zerowidth');

            if (!!emote.element && !!this.previousEmote.element?.style.minWidth) {
                emote.element.style.minWidth = this.previousEmote.element?.style.minWidth;
            }
        }
    }
}