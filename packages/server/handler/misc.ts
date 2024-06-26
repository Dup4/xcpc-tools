/* eslint-disable no-await-in-loop */
// @ts-ignore
import { Context } from 'cordis';
import { Handler } from '@hydrooj/framework';
import { config } from '../config';
import StaticFrontend from '../data/static.frontend';
import { decodeBinary, StaticHTML } from '../utils';

const randomHash = String.random(8).toLowerCase();
const buf = decodeBinary(StaticFrontend);

class StaticHandler extends Handler {
    async get() {
        this.response.addHeader('Cache-Control', 'public');
        this.response.addHeader('Expires', new Date(new Date().getTime() + 86400000).toUTCString());
        this.response.type = 'text/javascript';
        this.binary(buf, 'main.js');
    }
}

export class AuthHandler extends Handler {
    async prepare() {
        if (!this.request.headers.authorization) {
            this.response.status = 401;
            this.response.addHeader('WWW-Authenticate', 'Basic realm="XCPC Tools"');
            this.response.body = 'Authentication required';
            return 'cleanup';
        }
        const [uname, pass] = Buffer.from(this.request.headers.authorization.split(' ')[1], 'base64').toString().split(':');
        if (uname !== 'admin' || pass !== config.viewPass.toString()) {
            this.response.status = 401;
            this.response.addHeader('WWW-Authenticate', 'Basic realm="XCPC Tools"');
            this.response.body = 'Authentication failed';
            return 'cleanup';
        }
        return '';
    }
}

class HomeHandler extends AuthHandler {
    async get() {
        const context = {
            secretRoute: config.secretRoute,
            contest: this.ctx.fetcher?.contest || { name: 'Server Mode' },
        };
        if (this.request.headers.accept === 'application/json') {
            this.response.body = context;
        } else {
            this.response.type = 'text/html';
            this.response.body = StaticHTML(context, randomHash);
        }
    }
}

export async function apply(ctx: Context) {
    ctx.Route('home', '/', HomeHandler);
    ctx.Route('static', '/main.js', StaticHandler);
}
