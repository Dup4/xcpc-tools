import path from 'node:path';
// @ts-ignore
import { Context } from 'cordis';
import { config } from '../config';
import { fs } from '../utils';
import { AuthHandler } from './misc';

class StaticFileListHandler extends AuthHandler {
    async get() {
        const staticDir = path.resolve(process.cwd(), config.staticDir);
        if (!fs.existsSync(staticDir)) {
            this.response.status = 404;
            this.response.body = { error: 'Static directory not found' };
            return;
        }

        const entries = fs.readdirSync(staticDir, { withFileTypes: true });
        const files = entries
            .filter((entry: any) => entry.isFile())
            .map((entry: any) => {
                const filePath = path.join(staticDir, entry.name);
                const stat = fs.statSync(filePath);
                return {
                    name: entry.name,
                    size: stat.size,
                };
            });

        this.response.body = { files };
    }
}

class StaticFileDownloadHandler extends AuthHandler {
    async get() {
        const filename = this.request.query.file as string;
        if (!filename) {
            this.response.status = 400;
            this.response.body = { error: 'Missing file parameter' };
            return;
        }
        const staticDir = path.resolve(process.cwd(), config.staticDir);
        const requestedPath = path.resolve(staticDir, filename);

        // Security: prevent directory traversal
        if (!requestedPath.startsWith(staticDir + path.sep) && requestedPath !== staticDir) {
            this.response.status = 403;
            this.response.body = { error: 'Access denied' };
            return;
        }

        if (!fs.existsSync(requestedPath)) {
            this.response.status = 404;
            this.response.body = { error: 'File not found' };
            return;
        }

        const stat = fs.statSync(requestedPath);
        if (!stat.isFile()) {
            this.response.status = 400;
            this.response.body = { error: 'Not a file' };
            return;
        }

        const content = fs.readFileSync(requestedPath);
        this.response.type = 'application/octet-stream';
        this.response.disposition = `attachment; filename="${path.basename(requestedPath)}"`;
        this.response.body = content;
    }
}

export async function apply(ctx: Context) {
    if (config.staticDir) {
        ctx.Route('static_list', '/static', StaticFileListHandler);
        ctx.Route('static_download', '/static/download', StaticFileDownloadHandler);
    }
}
