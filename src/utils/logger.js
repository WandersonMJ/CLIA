import util from 'util';
import lang from '../services/language-service.js';

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    grey: "\x1b[90m",
    brightGreen: "\x1b[92m",
    brightYellow: "\x1b[93m",
    brightBlue: "\x1b[94m",
    brightMagenta: "\x1b[95m",
    brightCyan: "\x1b[96m"
};

function color(colorName, text) {
    return (colors[colorName] || '') + text + colors.reset;
}

function separator(char = '─', length = 50) {
    return color('grey', char.repeat(length));
}

export default {
    success(message) {
        console.log('\n' + color('brightGreen', '✓ ') + color('green', message));
    },

    error(message, error) {
        console.error('\n' + color('red', `✗ ${lang.get('logger.errorPrefix')}: `) + message);
        if (error) {
            console.error(color('grey', '  └─ ') + color('grey', 'Detalhes:'));
            if (error instanceof Error) {
                console.error(color('grey', '     ' + (error.message || 'Erro desconhecido')));
                if (error.stack) {
                    const stackLines = error.stack.split('\n').slice(1, 4);
                    stackLines.forEach(line => {
                        console.error(color('grey', '     ' + line.trim()));
                    });
                }
            }
            else if (typeof error === 'object') {
                console.error(color('grey', '     ' + util.inspect(error, { depth: 2, colors: true })));
            }
            else {
                console.error(color('grey', '     ' + String(error)));
            }
        }
    },

    warn(message) {
        console.warn('\n' + color('brightYellow', '⚠ ') + color('yellow', `${lang.get('logger.warnPrefix')}: `) + message);
    },

    info(message) {
        console.log('\n' + color('brightCyan', 'ℹ ') + color('cyan', message));
    },

    ai(message) {
        console.log('\n' + color('brightMagenta', '🤖 ') + color('magenta', 'AI: ') + message);
    },

    tool(message) {
        console.log('\n' + color('brightBlue', '⚙ ') + color('blue', 'Ferramenta: ') + message);
    },

    iteration(message) {
        console.log('\n' + color('white', '🔄 ') + message);
    },

    response(message) {
        console.log('\n' + separator('═', 60));
        console.log(color('brightGreen', '✓ ') + color('green', lang.get('logger.aiResponse') + ':'));
        console.log(separator('─', 60));
        console.log('\n' + message);
        console.log('\n' + separator('═', 60) + '\n');
    },

    result(success, message) {
        const prefix = success ? color('brightGreen', '✓') : color('red', '✗');
        console.log('\n' + prefix + ' ' + color('white', lang.get('logger.resultPrefix') + ': ') + message);
    },

    raw(message) {
        console.log('\n' + message + '\n');
    }
};