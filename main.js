const express = require('express');

const TelegramBot = require('node-telegram-bot-api');
const config = require('config');

const TOKEN = config.get("token");
const ANSWERS = config.get("answers");
const COIN = config.get("coin");

const SPECIAL_SYMBOLS = config.get("specialSymbols");
const DIGITS = config.get("digits");
const CHARS = config.get("chars");


const app = express();

app.get('/', (req, res) => res.send('Hello World!'));

const bot = new TelegramBot(TOKEN, {polling: true});

bot.onText(/\/start/, (msg, [source, match]) => {
    const {chat: {id}} = msg;
    bot.sendMessage(id, "Приветвстуем в мире случайности!!!", {
        "reply_markup": {
            "keyboard": [["Числа", "Пароли"], ["Монетка"], ["Волшебный шар"]]
        }
    });
    sendMessageGetInfoNumber(msg);
    sendMessageGetInfoPass(msg);
    sendMessageGetInfoCoin(msg);
    sendMessageGetInfoAnswer(msg);
});

bot.onText(/\/help/, msg => {
    sendMessageGetInfoNumber(msg);
    sendMessageGetInfoPass(msg);
    sendMessageGetInfoCoin(msg);
    sendMessageGetInfoAnswer(msg);
});

bot.onText(/\/q (.+)/, (msg) => {
    sendMessageAnswer(msg)
});
bot.onText(/\/q*$/, (msg) => {
    sendMessageAnswer(msg, "Нет вопроса");
});

bot.onText(/Числа/, (msg) => {
    sendMessageGetInfoNumber(msg);
});

bot.onText(/Пароли/, (msg) => {
    sendMessageGetInfoPass(msg);
});

bot.onText(/Волшебный шар/, (msg) => {
    sendMessageGetInfoAnswer(msg);
});

bot.onText(/Монетка/, (msg) => {
    sendMessageGetInfoCoin(msg);
});

bot.onText(/\/c*$/, (msg) => {
    const {chat: {id}} = msg;
    bot.sendMessage(id, "⚖ " + COIN[getRandomInt(0, COIN.length)]);
});

function sendMessageNumber(msg, components, ...err) {
    const {chat: {id}} = msg;
    if (err.length) {
        bot.sendMessage(id, "💯 " + err[0]);
    } else {
        let result = "";
        let i = 0;
        const min = +components[1], max = +components[2];
        while (i < +components[0]) {
            if (+components[0] === 1) {
                result += getRandomInt(min, max);
                break;
            } else {
                result += "\n " + ++i + ") " + getRandomInt(min, max);
            }
        }
        bot.sendMessage(id, "💯 Результат: " + result);
    }
}

bot.onText(/\/n (.+)/, (msg, [source, match]) => {
    const components = match.split(" ");

    if (components.length === 3 && components.every(isNature) && (+components[1]) < (+components[2])) {
        sendMessageNumber(msg, components);
    }
    else {
        sendMessageNumber(msg, "", "Неверый формат, нужно:\n/n [число, сколько чисел вывести до 100] [положительное число, от] [число, до]");
    }
});

bot.onText(/\/n*$/, (msg) => {
    sendMessageNumber(msg, "", "Неверый формат, нужно:\n/n [число, сколько чисел вывести до 100] [положительное число, от] [число, до]");
});


function sendMessagePassword(msg, components, ...err) {
    const {chat: {id}} = msg;
    if (err.length) {
        bot.sendMessage(id, "🔐 " + err[0]);
    } else {
        let result = "\n";
        let i = 0;
        let isDigits = components[1] === "+", isSpecialSymbols = components[2] === "+";
        const str = CHARS + (isDigits ? DIGITS : "") + (isSpecialSymbols ? SPECIAL_SYMBOLS : "");
        const length = +components[0];
        while (i < length) {
            ++i;
            let bufferStr;
            if ((isDigits || isSpecialSymbols) && ((i + (isSpecialSymbols?1:0) + (isDigits?1:0)) > length)) {
                if (isDigits) {
                    bufferStr = DIGITS;
                }
                else if (isSpecialSymbols) {
                    bufferStr = SPECIAL_SYMBOLS;
                }
            } else {
                bufferStr = str;
            }
            let char = getRandomInt(0, bufferStr.length);

            if (isDigits && ~DIGITS.indexOf(bufferStr[char])) {
                isDigits = false;
            } else if (isSpecialSymbols && ~SPECIAL_SYMBOLS.indexOf(bufferStr[char])) {
                isSpecialSymbols = false;
            }
            result += bufferStr[char];
        }
        bot.sendMessage(id, "🔐: " + result);
    }
}

bot.onText(/\/p (.+)/, (msg, [source, match]) => {
    const components = match.split(" ");

    function isPlusMinus(el) {
        return el === "+" || el === "-";
    }

    if (components.length === 3 && isNature(components[0]) && +components[0] > 5 && +components[0] < 19 && isPlusMinus(components[1]) && isPlusMinus(components[2])) {
        sendMessagePassword(msg, components);
    }
    else {
        sendMessagePassword(msg, "", "Неверый формат, нужно:\n/p [число, сколько символов, от 6 - до 18] +/-[включая цифры] +/-[включая спец. символы]");
    }
});

bot.onText(/\/p*$/, (msg) => {
    sendMessagePassword(msg, "", "Неверый формат, нужно:\n/p [число, сколько символов, от 6 - до 18] +/-[включая цифры] +/-[включая спец. символы]");
});

bot.onText(/\/aim*$/, (msg) => {
    const {chat: {id}} = msg;
    bot.sendMessage(id, "🎯 " + "Данный бот является лабораторной работой Карабанова Романа");
});

bot.onText(/\/thanks*$/, (msg) => {
    const {chat: {id}} = msg;
    bot.sendMessage(id, "🤙🏻" + "Идея данного бота была частично повзаимстована с сайта http://randstuff.ru/");
});


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function isNature(el) {
    return Number.isInteger(+el) && +el > 0;
}

function sendMessageAnswer(msg, ...err) {
    const {chat: {id}} = msg;
    bot.sendMessage(id, "🎱 " + (err.length ? err[0] : ANSWERS[getRandomInt(0, ANSWERS.length)]));
}

function sendMessageGetInfoNumber(msg) {
    const {chat: {id}} = msg;
    bot.sendMessage(id, "💯 вывод случайных натуральных чисел из заданного диапозона, формат ввода:\n /n [число, сколько чисел вывести] [число, от] [число, до]");
}

function sendMessageGetInfoAnswer(msg) {
    const {chat: {id}} = msg;
    bot.sendMessage(id, "🎱 задайте вопрос волшебному шару в формате:\n" + "/q [вопрос]");
}

function sendMessageGetInfoPass(msg, err) {
    const {chat: {id}} = msg;
    bot.sendMessage(id, "🔐 генератор пароля:\n /p [число, сколько символов, от 6 - до 18] +/-[включая цифры] +/-[включая спец. символы]");
}

function sendMessageGetInfoCoin(msg, err) {
    const {chat: {id}} = msg;
    bot.sendMessage(id, "⚖ если у вас нет под рукой монетки, чтобы рассудить спор, то киньте нашу монетку отправив:\n /c");
}

setTimeout(function wakeUp() {
    request("https://guarded-stream-85939.herokuapp.com", function() {
        console.log("WAKE UP DYNO");
    });
    return setTimeout(wakeUp, 1200000);
}, 1200000);

app.listen(process.env.PORT ||5000, () => console.log('Example app listening on port 5000!'));