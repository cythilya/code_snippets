var publisher = {
    subscribers: {
        any: []
    },
    on: function(type, fn, context) {
        type = type || 'any';
        fn = typeof fn === "function" ? fn : context[fn];
        if (typeof this.subscribers[type] === "undefined") {
            this.subscribers[type] = [];
        }
        this.subscribers[type].push({
            fn: fn,
            context: context || this
        });
    },
    remove: function(type, fn, context) {
        this.visitSubscribers('unsubscribe', type, fn, context);
    },
    fire: function(type, publication) {
        this.visitSubscribers('publish', type, publication);
    },
    visitSubscribers: function(action, type, arg, context) {
        var pubtype = type || 'any',
            subscribers = this.subscribers[pubtype],
            i,
            max = subscribers ? subscribers.length : 0;
        for (i = 0; i < max; i += 1) {
            if (action === 'publish') {
                subscribers[i].fn.call(subscribers[i].context, arg);
            } else {
                if (subscribers[i].fn === arg && subscribers[i].context === context) {
                    subscribers.splice(i, 1);
                }
            }
        }
    }
};

function Player(name, key) {
    this.points = 0;
    this.name = name;
    this.key = key;
    this.fire('newplayer', this);
}
Player.prototype.play = function() {
    this.points += 1;
    this.fire('play', this);
};
var game = {
    keys: {},
    addPlayer: function(player) {
        var key = player.key.toString().charCodeAt(0);
        this.keys[key] = player;
    },
    handleKeypress: function(e) {
        e = e || window.event; // IE
        if (game.keys[e.which]) {
            game.keys[e.which].play();
        }
    },
    handlePlay: function(player) {
        var i,
            players = this.keys,
            score = {};
        for (i in players) {
            if (players.hasOwnProperty(i)) {
                score[players[i].name] = players[i].points;
            }
        }
        this.fire('scorechange', score);
    }
};
makePublisher(Player.prototype);
makePublisher(game);
Player.prototype.on("newplayer", "addPlayer", game);
Player.prototype.on("play", "handlePlay", game);
game.on("scorechange", scoreboard.update, scoreboard);
window.onkeypress = game.handleKeypress;
var playername, key;
while (1) {
    playername = prompt("Add player (name)");
    if (!playername) {
        break;
    }
    while (1) {
        key = prompt("Key for " + playername + "?");
        if (key) {
            break;
        }
    }
    new Player(playername, key);
}