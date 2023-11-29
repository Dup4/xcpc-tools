import os from 'os';
import path from 'path';
import { fs, Logger } from '@hydrooj/utils';
import { Context } from './interface';

Logger.levels.base = 3;

const logger = new Logger('tools');

require('./init').load();
process.on('unhandledRejection', (e) => { logger.error(e); });
process.on('uncaughtException', (e) => { logger.error(e); });
Error.stackTraceLimit = 50;
global.app = new Context();
const tmpdir = path.resolve(os.tmpdir(), 'xcpc-tools');

async function apply(ctx: Context) {
    fs.ensureDirSync(tmpdir);
    require('./error');
    await require('./service/server').apply(ctx);
    if (global.Tools.config.type !== 'nofetch') {
        await require('./fetcher').apply(ctx);
    }
    await require('./handler').apply(ctx);
    await ctx.lifecycle.flush();
    await ctx.parallel('app/started');
    logger.success('Server started');
    process.send?.('ready');
    await ctx.parallel('app/ready');
}

apply(global.app);